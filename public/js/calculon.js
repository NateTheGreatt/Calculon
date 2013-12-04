/**
 * jQuery.browser.mobile (http://detectmobilebrowser.com/)
 *
 * jQuery.browser.mobile will be true if the browser is a mobile device
 *
 **/
(function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);

// txt is the text to measure, font is the full CSS font declaration,
// e.g. "bold 12px Verdana"
function measureText(txt, font) {
    var id = 'text-width-tester',
        $tag = $('#' + id);
    if (!$tag.length) {
        $tag = $('<span id="' + id + '" style="display:none;font:"Lucida Grande", Helvetica, Arial, sans-serif;">' + txt + '</span>');
        $('body').append($tag);
    } else {
        $tag.css({font:font}).html(txt);
    }
    return {
        width: $tag.width(),
        height: $tag.height()
    }
}

function shrinkToFill(input, fontSize, fontWeight, fontFamily) {
    var $input = $(input),
        txt = $input.val(),
        maxWidth = $input.width() + 5, // add some padding
        font = fontWeight + " " + fontSize + "px " + fontFamily;
    // see how big the text is at the default size
    var textWidth = measureText(txt, font).width;
    if (textWidth > maxWidth) {
        // if it's too big, calculate a new font size
        // the extra .9 here makes up for some over-measures
        fontSize = fontSize * maxWidth / textWidth * .9;
        font = fontWeight + " " + fontSize + "px " + fontFamily;
        // and set the style on the input
        $input.css({font:font});
    } else {
        // in case the font size has been set small and
        // the text was then deleted
        $input.css({font:font});
    }
}


var Plumb;


var connectorPaintStyle = {
        lineWidth: 4,
        strokeStyle: "#fff",
        joinstyle: "round",
        outlineColor: "white",
        outlineWidth: 0.1
    },
    connectorHoverStyle = {
        /*lineWidth: 4,
        strokeStyle: "#fff",
        outlineWidth: 2,
        outlineColor: "white"*/
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
        maxConnections: 1,
        dropOptions: { hoverClass: "hover", activeClass: "active" },
        isTarget: true,
        overlays: [
            [ "Label", { location: [0.5, -0.5], label: "", cssClass: "endpointTargetLabel" } ]
        ]
    }


if(jQuery.browser.mobile) {
    sourceEndpoint.paintStyle.radius = 16;
    targetEndpoint.paintStyle.radius = 15;
}






var Calculon = (function () {

    var loading, scope, projectId;

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
        console.log('making connections');
        boops.filter(function(boop) {

            // maybe filter out exponents and add those last

            if(boop.inputs.length > 0) {
                var inputNum = 0;
                Plumb.selectEndpoints({target: 'boop-'+boop.getId()}).each(function(input) {
                    var incomingBoopId = boop.inputs[inputNum].getId();

                    // there should only ever be one of these
                    Plumb.selectEndpoints({source: 'boop-'+incomingBoopId}).each(function(output) {
                        Plumb.connect({source:output, target:input});
                    });

                    inputNum++;
                });
            }
        });
    }

    function addBoop(type, data) {
        var id = BoopFactory.createNewBoop(type);
        var newBoop = BoopFactory.getBoop(id);

//            newBoop.projectId = projectId;

        var $boopWrapper = $('<div>').addClass('boopWrapper'),
            $boop = $('<div>').attr('id', 'boop-' + id).addClass('boop'),
            $title = $('<div>').addClass('title'),
            $type = $('<div>').text(type),
            $value = $('<input type="text">').addClass('value disabled').val('0'),
            $label = $('<input type="text">').addClass('label');

        if(type != 'variable') {
            $value.attr('disabled', 'disabled');
        }/* else {
            $value.css({'background-color':'#fff'});
        }*/

        $value.change(function () {
            var boop = BoopFactory.getBoop(id);
            boop.setValue($(this).val());
            boop.outputs.filter(function (port) {
                $('#boop-' + port.id).trigger('redraw');
            });
            shrinkToFill(this, 32, "bold", "Helvetica");
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
            var $value = $this.find('.value');

            // update the value
            $this.find('.value').val(boop.getValue());

            shrinkToFill($value, 32, "bold", "Helvetica");

            // update wrapper's top and left css positions
            $wrapper.css({top: boop.getPos().y, left: boop.getPos().x});

            // repaint jsplumb
            Plumb.repaintEverything();

            // set up the rumble settings for when it updates
            $this.jrumble({
                x: 0,
                y: 0,
                rotation: 3,
                speed:20
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
            }, 300);
        });

        $boop.mouseup(function (e) {
            var id = $(this).attr('id').split('-')[1];
            var boop = BoopFactory.getBoop(id);
            var $wrapper = $(this).parent();
            boop.setPos($wrapper.position().left, $wrapper.position().top);
        });

        $value.keyup(function() {
            shrinkToFill(this, 32, "bold", "Helvetica");
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
        $boop.append($label);

        $boopWrapper.append($boop);

        $('#calculon').append($boopWrapper);

        for (var i = 0; i < newBoop.getMaxOutputs(); i++) {
            Plumb.addEndpoint("boop-" + id, sourceEndpoint);
        }
        for (var i = 0; i < newBoop.getMaxInputs(); i++) {
            Plumb.addEndpoint("boop-" + id, targetEndpoint, {anchor: "ContinuousTop"});
        }

        Plumb.draggable(jsPlumb.getSelector("#calculon .boopWrapper"), { grid: [20, 20], containment: 'parent' });

        if (arguments.length == 2 && data != undefined) {
            newBoop.setId(data.id);
            data.inputs.filter(function (id) {
                newBoop.inputs.push(new Port(id));
//                newBoop.addInput(id);
            });
            data.outputs.filter(function (id) {
                newBoop.outputs.push(new Port(id));
//                newBoop.addInput(id);
            });
            console.log('type: '+type+'; val:'+data.value);
            newBoop.setValue(data.value);
            console.log('and now: '+newBoop.getValue());
            newBoop.setPos(data.x, data.y);
            console.log(data.inputs);
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
            loading = true;
            $.ajax({
                type: "POST",
                url: "/load",
                data: {"projectId": id},
                dataType: 'json'
            }).done(function (boops) {
                    boops.filter(function (boop) {
                        addBoop(boop.type, boop);
                    });
                    makeInitialConnections();

                    $('.boop').trigger('redraw');
                    loading = false;
                });
        },

        isLoading: function() {
            return loading;
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

            if(!Calculon.isLoading()) {
                BoopFactory.getBoop(sourceId).connectTo(BoopFactory.getBoop(targetId));
            }
            $('#boop-' + targetId + ' .value').val(BoopFactory.getBoop(targetId).getValue());
            $('#boop-' + targetId).trigger('redraw');
        });

        Plumb.bind('connectionDetached', function (info) {
            console.log(info);
            var sourceId = info.sourceId.split('-')[1],
                targetId = info.targetId.split('-')[1];

            if(!Calculon.isLoading()) {
                BoopFactory.getBoop(sourceId).disconnectFrom(BoopFactory.getBoop(targetId));
            }
            $('#boop-' + targetId + ' .value').val(BoopFactory.getBoop(targetId).getValue());
            $('#boop-' + targetId).trigger('redraw');
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