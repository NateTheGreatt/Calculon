var Plumb;


var connectorPaintStyle = {
        lineWidth: 4,
        strokeStyle: "#fff",
        joinstyle: "round",
        outlineColor: "white",
        outlineWidth: 0.1
    },
    connectorHoverStyle = {
        lineWidth: 4,
        strokeStyle: "#fff",
        outlineWidth: 2,
        outlineColor: "white"
    },
    endpointHoverStyle = {
        fillStyle: "#fff",
        strokeStyle: "#fff"
    },
    sourceEndpoint = {
        endpoint: "Dot",
        paintStyle: { fillStyle: "#fff", radius: 8 },
        isSource: true,
        isTarget: false,
        maxConnections: -1,
        connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
        connectorStyle: connectorPaintStyle,
        hoverPaintStyle: endpointHoverStyle,
        connectorHoverStyle: connectorHoverStyle,
        //            dragOptions:{},
        overlays: [
            [ "Label", {
                location: [0.5, 1.5],
                label: "",
                cssClass: "endpointSourceLabel"
            } ]
        ]
    },
    targetEndpoint = {
        endpoint: "Dot",
        paintStyle: {
            strokeStyle: "#fff",
            fillStyle: "transparent",
            radius: 7,
            lineWidth: 3
        },
        hoverPaintStyle: endpointHoverStyle,
        maxConnections: -1,
        dropOptions: { hoverClass: "hover", activeClass: "active" },
        isTarget: true,
        overlays: [
            [ "Label", { location: [0.5, -0.5], label: "", cssClass: "endpointTargetLabel" } ]
        ]
    }






var Calculon = (function () {

    var boops, scope, projectId;

    /*function getBoopById(id) {
     var r;
     for(var i=0;i<boops.length;i++) {
     if(boops[i].getId() == id)
     r = boops[i];
     }
     return r;
     }*/

    var saveTimeout;

    function saveProject() {
        clearTimeout(saveTimeout);
        saveTimeout = window.setTimeout(function () {
            $.ajax({
                type: "POST",
                url: "/save",
                data: {"boops": JSON.stringify(boops), "projectId": projectId},
                dataType: 'json'
            }).done(function (data) {
                    console.log("Data Saved: " + JSON.stringify(data));
                });
        }, 1000)
    }

    function makeInitialConnections() {
        var boops = BoopFactory.getAllBoops();

        boops.filter(function(boop) {
            boop.outputs.filter(function(port) {
                Plumb.connect({uuids:["boop-"+boop.getId()+"Bottom", "boop-"+port.getId()+"ContinuousTop"]})
            })
        })
    }

    function addBoop(type, data) {
        var id = BoopFactory.createNewBoop(type);
        var newBoop = BoopFactory.getBoop(id);

//            newBoop.projectId = projectId;

        var $boopWrapper = $('<div>').addClass('boopWrapper'),
            $boop = $('<div>').attr('id', 'boop-' + id).addClass('boop'),
            $title = $('<div>').addClass('title'),
            $type = $('<div>').text(type),
            $value = $('<input type="text">').addClass('value disabled').val('0');

        $value.change(function () {
            var boop = BoopFactory.getBoop(id);
            boop.setValue($(this).val());
            boop.outputs.filter(function (port) {
                $('#boop-' + port.id).trigger('redraw');
            });
            /*var delayUpdate = _.debounce(function (port) {
                $('#boop-' + port.id).trigger('redraw');
            }, 300);
            boop.outputs.filter(function (port) {
                delayUpdate(port);
            });*/
        });

        var timeout;
        $boop.on('redraw', function () {
            console.log('redrawing');
            var id = $(this).attr('id').split('-')[1];
            var boop = BoopFactory.getBoop(id);
            var $this = $(this);
            var $wrapper = $this.parent();

            // update the value
            $this.find('.value').val(boop.getValue());


            // update wrapper's top and left css positions
            $wrapper.css({top: boop.getPos().y, left: boop.getPos().x});

            // repaint jsplumb
            Plumb.repaintEverything();

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
            timeout = setTimeout(function () {
                $this.trigger('stopRumble')
                // call redraw on children
                boop.outputs.filter(function (port) {
                    $('#boop-' + port.id).trigger('redraw');
                });
            }, 200);
        });

        $boop.mouseup(function (e) {
            var id = $(this).attr('id').split('-')[1];
            var boop = BoopFactory.getBoop(id);
            var $wrapper = $(this).parent();
            boop.setPos($wrapper.position().left, $wrapper.position().top);
        });

        var x = 100,
            y = 100;

        $boop.css({
            'top': x,
            'left': y
        });

        newBoop.setPos(x, y);

        $boop.append($title);
        $boop.append($type);
        $boop.append($value);

        $boopWrapper.append($boop);

        $('#calculon').append($boopWrapper);

        for (var i = 0; i < newBoop.getMaxOutputs(); i++) {
            Plumb.addEndpoint("boop-" + id, sourceEndpoint);
        }
        for (var i = 0; i < newBoop.getMaxInputs(); i++) {
            console.log('input added');
            Plumb.addEndpoint("boop-" + id, targetEndpoint, {anchor: "ContinuousTop"});
        }

        Plumb.draggable(jsPlumb.getSelector("#calculon .boopWrapper"), { grid: [20, 20], containment: 'parent' });

        if (arguments.length == 2 && data != undefined) {
            newBoop.setId(data.id);
            newBoop.setValue(data.value);
            newBoop.setPos(data.x, data.y);
            console.log(data.inputs);
            data.inputs.filter(function (id) {
                newBoop.inputs.push(new Port(id));
//                newBoop.addInput(id);
            });
            data.outputs.filter(function (id) {
                newBoop.outputs.push(new Port(id));
//                newBoop.addInput(id);
            });
            makeInitialConnections();
            $('.boop').trigger('redraw');
        }
    }

    // PUBLIC

    var module = {
        init: function () {
            BoopFactory.reset();
            $('.calculon').empty();
        },

        addBoop: function (type, data) {
            addBoop(type,data);
        },

        loadProject: function (id) {
            this.init();
            $.ajax({
                type: "POST",
                url: "/load",
                data: {"projectId": id},
                dataType: 'json'
            }).done(function (boops) {
                    boops.filter(function (boop) {
                        addBoop(boop.type, boop);
                    });
                    $('.boop').trigger('redraw');
                });
        }
    }

    return module;
}());


jsPlumb.ready(function () {

    Plumb = jsPlumb.getInstance({
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        /*ConnectionOverlays: [
            [ "Arrow", { location: 1 } ],
        ],*/
        Container: "calculon"
    });

    Plumb.doWhileSuspended(function () {
        Plumb.bind('connection', function (info) {
            console.log(info);
            var sourceId = info.sourceId.split('-')[1],
                targetId = info.targetId.split('-')[1];

            BoopFactory.getBoop(sourceId).connectTo(BoopFactory.getBoop(targetId));
            $('#boop-' + targetId + ' .value').val(BoopFactory.getBoop(targetId).getValue());
            $('.boop').trigger('redraw');
        });

        Plumb.bind('connectionDetached', function (info) {
            console.log(info);
            var sourceId = info.sourceId.split('-')[1],
                targetId = info.targetId.split('-')[1];

            BoopFactory.getBoop(sourceId).disconnectFrom(BoopFactory.getBoop(targetId));
            $('#boop-' + targetId + ' .value').val(BoopFactory.getBoop(targetId).getValue());
            $('.boop').trigger('redraw');

        });
    });

    Calculon.init();

    $('#load').click(function () {
        var projectId = $('#projectId').val();
        if (!projectId) alert('Please input project Id to load');
        else {
            Calculon.loadProject(projectId);
        }
    });

    $('.addBoop').click(function () {
        Calculon.addBoop($(this).attr('name').toLowerCase());
    })

})