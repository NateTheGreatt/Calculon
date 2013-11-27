jsPlumb.ready(function() {

    var instance = jsPlumb.getInstance({
        // default drag options
        DragOptions : { cursor: 'pointer', zIndex:2000 },
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        ConnectionOverlays : [
            [ "Arrow", { location:1 } ],
            [ "Label", {
                location:0.1,
                id:"label",
                cssClass:"aLabel"
            }]
        ],
        Container:"calculon"
    });

    // this is the paint style for the connecting lines..
    var connectorPaintStyle = {
            lineWidth:4,
            strokeStyle:"#fff",
            joinstyle:"round",
            outlineColor:"white",
            outlineWidth:0.1
        },
    // .. and this is the hover style.
        connectorHoverStyle = {
            lineWidth:4,
            strokeStyle:"#fff",
            outlineWidth:2,
            outlineColor:"white"
        },
        endpointHoverStyle = {
            fillStyle:"#fff",
            strokeStyle:"#fff"
        },
    // the definition of source endpoints (the small blue ones)
        sourceEndpoint = {
            endpoint:"Dot",
            paintStyle:{ fillStyle:"#fff",radius:8 },
            isSource: true,
            isTarget: false,
            maxConnections: -1,
            connector:[ "Flowchart", { stub:[40, 60], gap:10, cornerRadius:5, alwaysRespectStubs:true } ],
            connectorStyle:connectorPaintStyle,
            hoverPaintStyle:endpointHoverStyle,
            connectorHoverStyle:connectorHoverStyle,
//            dragOptions:{},
            overlays:[
                [ "Label", {
                    location:[0.5, 1.5],
                    label:"",
                    cssClass:"endpointSourceLabel"
                } ]
            ]
        },
    // the definition of target endpoints (will appear when the user drags a connection)
        targetEndpoint = {
            endpoint:"Dot",
            paintStyle:{
                strokeStyle:"#fff",
                fillStyle:"transparent",
                radius:7,
                lineWidth:3
            },
            hoverPaintStyle:endpointHoverStyle,
            maxConnections:-1,
            dropOptions:{ hoverClass:"hover", activeClass:"active" },
            isTarget:true,
            overlays:[
                [ "Label", { location:[0.5, -0.5], label:"", cssClass:"endpointTargetLabel" } ]
            ]
        },
        init = function(connection) {
            connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
            connection.bind("editCompleted", function(o) {
                if (typeof console != "undefined")
                    console.log("connection edited. path is now ", o.path);
            });
        };

    var addBoop = function(type) {

        // instantiate the back-end boop
        var newBoop;
        switch(type) {
            case 'Variable':
                newBoop = new VariableBoop();
                break;
            case 'Addition':
                newBoop = new AdditionBoop();
                break;
            case 'Subtraction':
                newBoop = new SubtractionBoop();
                break;
            case 'Multiplication':
                newBoop = new MultiplicationBoop();
                break;
            case 'Division':
                newBoop = new DivisionBoop();
                break;
            case 'Modulo':
                newBoop = new ModuloBoop();
                break;
            case 'Exponent':
                newBoop = new ExponentBoop();
                break;
            case 'Square Root':
                newBoop = new SquareRootBoop();
                break;
        }

        var id = newBoop.getId();

        var $boopWrapper = $('<div>').addClass('boopWrapper'),
            $boop = $('<div>').attr('id', 'boop-'+id).addClass('boop'),
            $title = $('<div>').addClass('title').text('Boop '+id),
            $type = $('<div>').text(type),
            $value = $('<input type="text">').addClass('value disabled').val('0');

        var x = 100,
            y = 100;

        $boop.css({
            'top': x,
            'left': y
        });

        newBoop.setPos(x,y);

        $boop.append($title);
        $boop.append($type);
        $boop.append($value);

        $boopWrapper.append($boop);

        $('#calculon').append($boopWrapper);

        instance.addEndpoint("boop-"+id, sourceEndpoint);
        instance.addEndpoint("boop-"+id, targetEndpoint, {anchor:"Top"});
        instance.addEndpoint("boop-"+id, targetEndpoint, {anchor:"Top"});
        var endpoints = instance.getEndpoints("boop-"+id);
        endpoints[0].anchor.x = 0.5;
        endpoints[1].anchor.x = 0.2;
        endpoints[1].anchor.y = 0;
        endpoints[2].anchor.x = 0.4;
        endpoints[2].anchor.y = 0;

        /*jsPlumb.draggable($boop, {
            containment: 'parent'
        });*/
        instance.draggable(jsPlumb.getSelector("#calculon .boopWrapper"), { grid: [20, 20], containment: 'parent' });

        $('.value').change(function() {
            var id = $(this).parent().attr('id').split('-')[1];
            boops[id].setValue($(this).val());
//            boops[id].update();
            // redraw UI
            $(this).addClass('.toRedraw');
            $('.value').trigger('redraw');
//            saveProject();
        });

        var demoTimeout;
        $('.value').on('redraw', function() {
            var id = $(this).parent().attr('id').split('-')[1];
            $(this).val(boops[id].getValue());
            console.log('redrawing');

            var $parent = $(this).parent();
            $parent.jrumble({
                x: 2,
                y: 2,
                rotation: 1
            });
            clearTimeout(demoTimeout);
            $parent.trigger('startRumble');
            demoTimeout = setTimeout(function(){$parent.trigger('stopRumble')}, 150);
        });

        $('.boop').mouseup(function(e) {
            var id = $(this).attr('id').split('-')[1];
            boops[id].setPos($(this).position().left, $(this).position().top);
        });

        $('.boop').bind('mousewheel', function(e) {
            if(e.originalEvent.wheelDelta < 0) {
                //scroll down
                console.log('Down');
            }else {
                //scroll up
                console.log('Up');
            }

            //prevent page fom scrolling
            return false;
        });
    }

    // suspend drawing and initialise.
    instance.doWhileSuspended(function() {

        /*_addEndpoints("Window4", ["TopCenter", "TopCenter"], ["LeftMiddle", "RightMiddle"]);
        _addEndpoints("Window2", ["LeftMiddle", "BottomCenter"], ["TopCenter", "RightMiddle"]);
        _addEndpoints("Window3", ["RightMiddle", "BottomCenter"], ["LeftMiddle", "TopCenter"]);
        _addEndpoints("Window1", ["LeftMiddle", "RightMiddle"], ["TopCenter", "BottomCenter"]);*/

        // listen for new connections; initialise them the same way we initialise the connections at startup.
        /*instance.bind("connection", function(connInfo, originalEvent) {
            init(connInfo.connection);
        });*/

        instance.bind('connection', function(info){
            console.log(info);
            var sourceId = info.sourceId.split('-')[1],
                targetId = info.targetId.split('-')[1];

            boops[sourceId].connectTo(boops[targetId]);
            $('#boop-'+targetId+' .value').val(boops[targetId].getValue());
            $('.value').trigger('redraw');
        });

        instance.bind('connectionDetached', function(info){
            console.log(info);
            var sourceId = info.sourceId.split('-')[1],
                targetId = info.targetId.split('-')[1];

             boops[sourceId].disconnectFrom(boops[targetId]);
             $('#boop-'+targetId+' .value').val(boops[targetId].getValue());
            $('.value').trigger('redraw');


        });

        // make all the window divs draggable
        instance.draggable(jsPlumb.getSelector(".calculon .window"), { grid: [20, 20] });
        // THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector
        // method, or document.querySelectorAll:
        //jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });

        // connect a few up
        /*instance.connect({uuids:["Window2BottomCenter", "Window3TopCenter"], editable:true});
        instance.connect({uuids:["Window2LeftMiddle", "Window4LeftMiddle"], editable:true});
        instance.connect({uuids:["Window4TopCenter", "Window4RightMiddle"], editable:true});
        instance.connect({uuids:["Window3RightMiddle", "Window2RightMiddle"], editable:true});
        instance.connect({uuids:["Window4BottomCenter", "Window1TopCenter"], editable:true});
        instance.connect({uuids:["Window3BottomCenter", "Window1BottomCenter"], editable:true});*/
        //

        //
        // listen for clicks on connections, and offer to delete connections on click.
        //
        instance.bind("click", function(conn, originalEvent) {
            if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
                jsPlumb.detach(conn);
        });

        instance.bind("connectionDrag", function(connection) {
            console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
        });

        instance.bind("connectionDragStop", function(connection) {
            console.log("connection " + connection.id + " was dragged");
        });

        instance.bind("connectionMoved", function(params) {
            console.log("connection " + params.connection.id + " was moved");
        });
    });

    $(document).on("click", ".addBoop", function(event){
        addBoop($(this).html());
    });

    /*//Firefox
    $('#elem').bind('DOMMouseScroll', function(e){
        if(e.originalEvent.detail > 0) {
            //scroll down
            console.log('Down');
        }else {
            //scroll up
            console.log('Up');
        }

        //prevent page fom scrolling
        return false;
    });

    //IE, Opera, Safari
    $('#elem').bind('mousewheel', function(e){
        if(e.originalEvent.wheelDelta < 0) {
            //scroll down
            console.log('Down');
        }else {
            //scroll up
            console.log('Up');
        }

        //prevent page fom scrolling
        return false;
    });*/

});