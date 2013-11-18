var boops = [];
var toSave = [];

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

    function saveProject() {
        var msg = [];
        boops.filter(function(boop) {
            var ancestors = [],
                descendants = [];
            boop.inputs.filter(function(input) {
                ancestors.push(input.getId());
            });
            boop.outputs.filter(function(output) {
                descendants.push(output.getId());
            });
            console.log(ancestors);
            console.log(descendants);
            msg.push({
                "id": boop.getId(),
                "type": boop.getType(),
                "value": boop.getValue(),
                "x": boop.getPos().x,
                "y": boop.getPos().y,
                "ancestors": ancestors,
                "descendant": descendants
            });
        });

        $.ajax({
            type: "POST",
            url: "/save",
            data: {"boops":msg},
            dataType: 'json'
        }).done(function( data ) {
            console.log( "Data Saved: " + data );
        });
    }

    function saveBoop(id) {
        var x = boops[id].getPos().x,
            y = boops[id].getPos().y;

        $.ajax({
            type: "POST",
            url: "/saveBoop",
            data: {"id":id, "x":x, "y":y},
            dataType: 'json'
        }).done(function( data ) {
                console.log( "Data Saved: " + data );
        });
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

        // create the front-end display
        var boop = $('<div>').attr('id', 'boop-'+i).addClass('boop'),
            addInput = $('<div>').addClass('button addInput').text('+'),
            addOutput = $('<div>').addClass('button addOutput').text('+'),
            del = $('<div>').addClass('button delete').text('x'),
            title = $('<div>').addClass('title').text('Boop '+i),
            type = $('<div>').text(type),
            value = $('<input type="text">').addClass('value').val('0'),
            connect = $('<div>').addClass('connect');

        var x = 100,
            y = 100;

        boop.css({
            'top': x,
            'left': y
        });

        newBoop.setPos(x,y);
        boops.push(newBoop);

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
            saveProject();
        });

        $('.value').on('redraw', function() {
            var id = $(this).parent().attr('id').split('-')[1];
            $(this).val(boops[id].getValue());
            console.log('redrawing');
            saveProject();
        });

        $('.boop').mouseup(function(e) {
            var id = $(this).attr('id').split('-')[1];
            boops[id].setPos($(this).position().left, $(this).position().top);
            saveBoop(id);
        });

        saveBoop(i);
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
    });

});

