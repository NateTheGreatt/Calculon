var boops = [];

function createConnections() {
    boops.filter(function(boop) {
        boop.outputs.filter(function(port) {
            Plumb.connect({
                source:"boop-"+boop.id,
                target:"boop-"+port.id
            });
        });

    })
}

jsPlumb.ready(function() {

    var Plumb = jsPlumb.getInstance({
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

    function getBoopById(id) {
        var r;
        for(var i=0;i<boops.length;i++) {
            if(boops[i].getId() == id)
                r = boops[i];
        }
        return r;
    }

    function addBoop(type, data) {
        var newBoop = BoopFactory.createNewBoop(type);
        var id = newBoop.getId();

        var $boopWrapper = $('<div>').addClass('boopWrapper'),
            $boop = $('<div>').attr('id', 'boop-'+id).addClass('boop'),
            $title = $('<div>').addClass('title'),
            $type = $('<div>').text(type),
            $value = $('<input type="text">').addClass('value').val('0');

        $value.change(function() {
            var boop = getBoopById(id);
            boop.setValue($(this).val());
            var delayUpdate = _.debounce(function(port) {
                $('#boop-'+port.id).trigger('redraw');
            },300);
            boop.outputs.filter(function(port) {
                delayUpdate(port);
            });
//            saveProject(boop);
        });

        var timeout;
        $boop.on('redraw', function() {
            console.log('redrawing');
            var id = $(this).attr('id').split('-')[1];
            var boop = getBoopById(id);
            var $this = $(this);
            var $wrapper = $this.parent();

            // update the value
            $this.find('.value').val(boop.getValue());

            // update wrapper's top and left css positions
            $wrapper.css({top:boop.getPos().y, left:boop.getPos().x});

            // set up the rumble settings for when it updates
            $this.jrumble({
                x: 3,
                y: 2,
                rotation: 1
            });
            clearTimeout(timeout);

            // trigger the rumble
            $(this).trigger('startRumble');

            // stop rumble after timeout
            timeout = setTimeout(function(){$this.trigger('stopRumble')}, 200);
        });

        $boop.mouseup(function(e) {
            var id = $(this).attr('id').split('-')[1];
            var boop = getBoopById(id);
            var $wrapper = $(this).parent();
            boop.setPos($wrapper.position().left, $wrapper.position().top);
        });

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

        for(var i=0;i<newBoop.getMaxOutputs();i++) {
            Plumb.addEndpoint("boop-"+id, sourceEndpoint);
        }
        for(var i=0;i<newBoop.getMaxInputs();i++) {
            console.log('input added');
            Plumb.addEndpoint("boop-"+id, targetEndpoint, {anchor:"ContinuousTop"});
        }

        Plumb.draggable(jsPlumb.getSelector("#calculon .boopWrapper"), { grid: [20, 20], containment: 'parent' });

        if(arguments.length == 2) {
            boop.setId(data.id);
            boop.setValue(data.value);
            boop.setPos(data.x, data.y);
            data.inputs.filter(function(input) {
                boop.inputs.push(new Port(input));
            });
            data.outputs.filter(function(output) {
                boop.outputs.push(new Port(output));
            });

            x = data.x,
                y = data.y;

            $boop.css({
                'top': x,
                'left': y
            });

            newBoop.setPos(x,y);
        }

        boops.push(newBoop);
    }

    /*var addBoop = function(type, data) {

        // instantiate the back-end boop
        var newBoop = createNewBoop(type);

        var id = newBoop.getId();

        newBoop.projectId = 1;

        var $boopWrapper = $('<div>').addClass('boopWrapper'),
            $boop = $('<div>').attr('id', 'boop-'+id).addClass('boop'),
            $title = $('<div>').addClass('title'),
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

        for(var i=0;i<newBoop.getMaxOutputs();i++) {
            Plumb.addEndpoint("boop-"+id, sourceEndpoint);
        }
        for(var i=0;i<newBoop.getMaxInputs();i++) {
            console.log('input added');
            Plumb.addEndpoint("boop-"+id, targetEndpoint, {anchor:"ContinuousTop"});
        }

        *//*Plumb.addEndpoint("boop-"+id, sourceEndpoint);
        Plumb.addEndpoint("boop-"+id, targetEndpoint, {anchor:"Top"});
        Plumb.addEndpoint("boop-"+id, targetEndpoint, {anchor:"Top"});
        var endpoints = Plumb.getEndpoints("boop-"+id);
        endpoints[0].anchor.x = 0.5;
        endpoints[1].anchor.x = 0.2;
        endpoints[1].anchor.y = 0;
        endpoints[2].anchor.x = 0.4;
        endpoints[2].anchor.y = 0;*//*

        *//*jsPlumb.draggable($boop, {
            containment: 'parent'
        });*//*
        Plumb.draggable(jsPlumb.getSelector("#calculon .boopWrapper"), { grid: [20, 20], containment: 'parent' });

        $('.value').change(function() {
            var id = $(this).parent().attr('id').split('-')[1];
            getBoopById(id).setValue($(this).val());
            // redraw UI
//            $(this).addClass('.toRedraw');
//            $('.toRedraw').trigger('redraw');
            $('.value').trigger('redraw');
        });

        var demoTimeout;
        $('.value').on('redraw', function() {
            var id = $(this).parent().attr('id').split('-')[1];

            $(this).val(getBoopById(id).getValue());

            $(this).removeClass('.toRedraw');
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
            var boop = getBoopById(id);
            console.log(boop);
            boop.setPos($(this).position().left, $(this).position().top);
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
    }*/

    // suspend drawing and initialise.
    Plumb.doWhileSuspended(function() {

        /*_addEndpoints("Window4", ["TopCenter", "TopCenter"], ["LeftMiddle", "RightMiddle"]);
        _addEndpoints("Window2", ["LeftMiddle", "BottomCenter"], ["TopCenter", "RightMiddle"]);
        _addEndpoints("Window3", ["RightMiddle", "BottomCenter"], ["LeftMiddle", "TopCenter"]);
        _addEndpoints("Window1", ["LeftMiddle", "RightMiddle"], ["TopCenter", "BottomCenter"]);*/

        // listen for new connections; initialise them the same way we initialise the connections at startup.
        /*Plumb.bind("connection", function(connInfo, originalEvent) {
            init(connInfo.connection);
        });*/

        Plumb.bind('connection', function(info){
            console.log(info);
            var sourceId = info.sourceId.split('-')[1],
                targetId = info.targetId.split('-')[1];

            getBoopById(sourceId).connectTo(getBoopById(targetId));
            $('#boop-'+targetId+' .value').val(getBoopById(targetId).getValue());
            $('.value').trigger('redraw');
        });

        Plumb.bind('connectionDetached', function(info){
            console.log(info);
            var sourceId = info.sourceId.split('-')[1],
                targetId = info.targetId.split('-')[1];

            getBoopById(sourceId).disconnectFrom(getBoopById(targetId));
            $('#boop-'+targetId+' .value').val(getBoopById(targetId).getValue());
            $('.value').trigger('redraw');

        });

        // make all the window divs draggable
        Plumb.draggable(jsPlumb.getSelector(".calculon .window"), { grid: [20, 20] });
        // THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector
        // method, or document.querySelectorAll:
        //jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });

        // connect a few up
        /*Plumb.connect({uuids:["Window2BottomCenter", "Window3TopCenter"], editable:true});
        Plumb.connect({uuids:["Window2LeftMiddle", "Window4LeftMiddle"], editable:true});
        Plumb.connect({uuids:["Window4TopCenter", "Window4RightMiddle"], editable:true});
        Plumb.connect({uuids:["Window3RightMiddle", "Window2RightMiddle"], editable:true});
        Plumb.connect({uuids:["Window4BottomCenter", "Window1TopCenter"], editable:true});
        Plumb.connect({uuids:["Window3BottomCenter", "Window1BottomCenter"], editable:true});*/
        //

        //
        // listen for clicks on connections, and offer to delete connections on click.
        //
        Plumb.bind("click", function(conn, originalEvent) {
            if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
                jsPlumb.detach(conn);
        });

        Plumb.bind("connectionDrag", function(connection) {
            console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
        });

        Plumb.bind("connectionDragStop", function(connection) {
            console.log("connection " + connection.id + " was dragged");
        });

        Plumb.bind("connectionMoved", function(params) {
            console.log("connection " + params.connection.id + " was moved");
        });
    });

    $(document).on("click", ".addBoop", function(event){
        addBoop($(this).attr('name'));
    });

    $('.calculon').mousedown(function(e){
        switch(e.which)
        {
            case 1:
                //left Click
                break;
            case 2:
                //middle Click

                break;
            case 3:
                //right Click
                break;
        }
        return true;// to allow the browser to know that we handled it.
    });

});