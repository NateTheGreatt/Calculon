jsPlumb.ready(function() {

    jsPlumb.draggable($('.boop'));

    var output = {
        endpoint: "Rectangle",
        isSource: true,
        isTarget: false,
        maxConnections: 1,
        anchor: [1,0,1,0]
    }

    var input = {
        endpoint: "Rectangle",
        isSource: false,
        isTarget: true,
        maxConnections: 1,
        anchor: [0,1,-1,0]
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

    function addBoop() {
        var boop = $('<div>').attr('id', 'boop-'+i).addClass('boop');
        var addInput = $('<div>').addClass('button addInput').text('+');
        var addOutput = $('<div>').addClass('button addOutput').text('+');
        var del = $('<div>').addClass('button delete').text('x');
        var title = $('<div>').addClass('title').text('Boop '+i);
        var connect = $('<div>').addClass('connect');

        boop.css({
            'top': e.pageY+200,
            'left': e.pageX+100
        });

        jsPlumb.makeTarget(boop, {
            anchor: 'Continuous'
        });

        jsPlumb.makeSource(connect, {
            parent: boop,
            anchor: 'Continuous'
        });

        boop.append(title);
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
    }

    var i = 0;
    $('#addBoop').click(function(e) {
        addBoop();
    });
});