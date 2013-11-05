var boops = [];

jsPlumb.ready(function() {


    jsPlumb.draggable($('.boop'));

    var output = {
        endpoint: "Rectangle",
        isSource: true,
        isTarget: false,
        maxConnections: -1,
        anchor: [1,0,1,0],
        ConnectionsDetachable:true
    }

    var input = {
        endpoint: "Dot",
        isSource: false,
        isTarget: true,
        maxConnections: 1,
        anchor: [0,1,-1,0],
        connectorStyle: {
            lineWidth:2,
            strokeStyle:"#000"
        }
    }

    //Fixes endpoints for specified target
    function fixEndpoints(parentnode) {
        //get list of current endpoints
        var endpoints = jsPlumb.getEndpoints(parentnode);

        //there are 2 types - input and output

        var inputAr = $.grep(endpoints, function (elementOfArray, indexInArray) {
            return elementOfArray.isSource; //input
        });

        var outputAr = $.grep(endpoints, function (elementOfArray, indexInArray) {
            return elementOfArray.isTarget; //output
        });

        calculateEndpoint(inputAr, true);
        calculateEndpoint(outputAr, false);

        jsPlumb.repaintEverything();
    }

    //recalculate endpoint anchor position manually
    function calculateEndpoint(endpointArray, isInput) {

        //multiplyer
        var mult = 1 / (endpointArray.length+1);

        for (var i = 0; i < endpointArray.length; i++) {

            if (isInput) {

                //position
                endpointArray[i].anchor.x = 1;
                endpointArray[i].anchor.y = mult * (i + 1);
            }
            else {

                //position
                endpointArray[i].anchor.x = 0;
                endpointArray[i].anchor.y = mult * (i + 1);
            }
        }
    }

    function addBoop(type) {

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
        boops.push(newBoop);

        // create the front-end display
        var boop = $('<div>').attr('id', 'boop-'+i).addClass('boop'),
            addInput = $('<div>').addClass('button addInput').text('+'),
            addOutput = $('<div>').addClass('button addOutput').text('+'),
            del = $('<div>').addClass('button delete').text('x'),
            title = $('<div>').addClass('title').text('Boop '+i),
            type = $('<div>').text(type),
            value = $('<input type="text">').addClass('value').val('0'),
            connect = $('<div>').addClass('connect');

        boop.css({
            'top': 100,
            'left': 100
        });

        jsPlumb.makeTarget(boop, {
            anchor: 'Continuous'
        });

        jsPlumb.makeSource(connect, {
            parent: boop,
            anchor: 'Continuous'
        });

        boop.append(title);
        boop.append(value);
        boop.append(type);
        //boop.append(connect);
        boop.append(addInput);
        boop.append(addOutput);
        boop.append(del);

        jsPlumb.draggable(boop, {
            containment: 'parent'
        });

        boop.find('.delete').click(function(e) {
            jsPlumb.detachAllConnections($(this).parent());
            $(this).parent().remove();
            e.stopPropagation();
        });

        boop.find('.addInput').click(function() {
            var parentnode = $(this)[0].parentNode;

            jsPlumb.addEndpoint(parentnode,input);
            fixEndpoints(parentnode);
        });

        boop.find('.addOutput').click(function() {
            var parentnode = $(this)[0].parentNode;

            jsPlumb.addEndpoint(parentnode,output);
            fixEndpoints(parentnode);
        });

        $('#calculon').append(boop);
        i++;

        $('.value').change(function() {
            var id = $(this).parent().attr('id').split('-')[1];
            boops[id].setValue($(this).val());
            boops[id].update();
            // redraw UI
            $('.value').trigger('redraw');
        });

        $('.value').on('redraw', function() {
            var id = $(this).parent().attr('id').split('-')[1];
            $(this).val(boops[id].getValue());
            console.log('redrawing');
        });
    }

    var i = 0;
    jsPlumb.bind('connection', function(info){
        console.log(info);
        var sourceId = info.sourceId.split('-')[1],
            targetId = info.targetId.split('-')[1];

        boops[sourceId].connectTo(boops[targetId]);
        $('#boop-'+targetId+' .value').val(boops[targetId].getValue());
    });

    jsPlumb.bind('connectionDetached', function(info){
        console.log(info);
        /*var sourceId = info.sourceId.split('-')[1],
            targetId = info.targetId.split('-')[1];

        boops[sourceId].connectTo(boops[targetId]);
        $('#boop-'+targetId+' .value').val(boops[targetId].getValue());*/
    });

    $('.addBoop').click(function() {
        addBoop($(this).html());
    })
});

