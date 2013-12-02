function extend(base, sub)
{
    sub.prototype = Object.create(base.prototype);
    sub.prototype.constructor = sub;
}

function Port(id)
{
    this.id = id;
    this.getValue = function() {
        return BoopFactory.getBoop(this.id).getValue();
    }
    this.update = function() {
        BoopFactory.getBoop(this.id).update();
    }
}

var BoopFactory = (function () {
    var boops = [];
    var toSave = [];
    var id = -1;


    // function that takes the array toSave, and pushes those changes to the database.
    function updateDatabase()
    {
        // TODO: update all boops in the array into the database and closure tables

        console.log('update :');
        console.log(toSave);

        var projectData = {};
        projectData.id = $('#projectId').val();

        $.ajax({
            type: "POST",
            url: "/save",
            data: {"boops":JSON.stringify(toSave), "projectData": JSON.stringify(projectData)},
            dataType: 'json'
        }).done(function( data ) {
                console.log( "Data Saved: " + JSON.stringify(data) );
            });
    }

    var timeoutID;
    function updateCollector(boop)
    {
        window.clearTimeout(timeoutID);                         // cancel timer
        timeoutID = window.setTimeout(updateDatabase, 2000);    // set new timer

        // first loop thru all boops to be saved
        for(var i=0;i<toSave.length;i++)
        {
            // check if boop exists in toSave and then overwrite it
            if(toSave[i].id == boop.id)
            {
                toSave[i] = boop;
                return;
            }
        }
        toSave.push(boop);          // add boop to array
    }

    function Boop() {
        this.children = [];
        this.inputs = [];
        this.outputs = [];
        this.childInputs = [];
        this.childOutputs = [];
        // max or required number of inputs & outputs
        this.maxInputs = 2; // two inputs by default
        this.maxOutputs = 1; // one output by default
        this.value = 0;
        this.id = ++id;
        this.type = 'boop';
        this.position = {x:0,y:0};
        this.parent = 0;

        console.log("boop" + this.id + " constructed");
    }

    Boop.prototype =
    {
        update: function () {
            this.value = this.evaluate();     // evaluate and set our output value

            this.outputs.filter(function (o)	    // for each boop we output to
            {
                console.log('Boop' + this.id + ' updating: Boop' + o.id);    // log who it is
                o.update();					    // and update them
            });
            updateCollector(this);
        },

        // EVALUATE to be overwritten by child class
        evaluate: function () {
            // parse children
            this.childInputs = [];
            this.children.filter(function (o) {
                switch (o.getType()) {
                    case "input":
                        this.childInputs.push(o);
                        break;
                    case "output":
                        this.childOutput = o;
                        break;
                }
            });
            // evaluate children
            if (this.childInputs.length > 0 && this.childOutput) {
                for (var i = 0; i < this.childInputs.length; ++i) {   //plug our inputs into the inner cluster's inputs and update them
                    if (this.inputs[i]) {
                        this.childInputs[i].plugin(this.inputs[i].getId());
                        this.childInputs[i].update();
                    }
                }
                return output.getValue();
            }
            else {
                return 0;
            }
        },

        getValue: function () {
            return parseFloat(this.value);
        },

        setValue: function (x) {
            if (this.value != x) {
                this.value = x;
                updateCollector(this);
                this.update();
            }
            console.log('Boop #' + this.getId() + ' value has been set to ' + x);
        },

        getType: function () {
            return this.type;
        },

        setType: function (type) {
            if (this.type != type) {
//                console.log('was ' + this.type + ' now is ' + type);
                this.type = type;
                updateCollector(this);
            }
        },

        getId: function () {
            return this.id;
        },
        setId: function (id) {
            this.id = id;
        },

        getPos: function () {
            return {"x": this.position.x, "y": this.position.y};
        },

        setPos: function (x, y) {
            var changed = false;
            if (this.position.x != x) {
                this.position.x = x;
                changed = true;
            }
            if (this.position.y != y) {
                this.position.y = y;
                changed = true;
            }
            if (changed) {
                updateCollector(this);
            }
            console.log('Position set: (' + x + ',' + y + ')')
        },

        setMaxInputs: function (i) {
            this.maxInputs = i;
        },
        getMaxInputs: function () {
            return this.maxInputs;
        },

        setMaxOutputs: function (i) {
            this.maxOutputs = i;
        },
        getMaxOutputs: function () {
            return this.maxOutputs;
        },

        connectTo: function (other) {
            other.inputs.push(new Port(this.getId())); // add a Port that references this boop to other boop's input array
            other.update();				        // update them

            this.outputs.push(new Port(other.getId())); // add a Port that references the other boop in this boop's output array

            console.log('Boop' + this.getId() + ' connected to Boop' + other.getId());
        },

        disconnectFrom: function (other) {

            // loop thru other's inputs and remove the port for this boop
            for (var i = 0; i < other.inputs.length; i++) {
                if (other.inputs[i].getId() == this.getId()) other.inputs.splice(i, 1);
            }

            // loop thru this boop's outputs and remove the port for the other boop
            for (var i = 0; i < this.outputs.length; i++) {
                if (this.outputs[i].getId() == other.getId()) this.outputs.splice(i, 1);
            }

            // update other boop
            other.update();

            console.log('Boop' + this.getId() + ' disconnected from Boop' + other.getId());
        }
    }

//<<-------------------------- Variable Boop ----------------------------------->>

    function VariableBoop() {
        Boop.call(this);	// call parent constructor
        console.log('Variable Boop Created');
        this.setType('variable');
        this.setMaxInputs(1);
    }

// inherit from Boop
    extend(Boop, VariableBoop);

//@Override EVALUATE
    VariableBoop.prototype.evaluate = function () {
        var input = this.inputs[0];
        if (input) {
            console.log('variable has input of ' + input.getValue());
            var value = input.getValue();
            return value ? value : this.getValue();
        } else {
            return this.getValue();
        }
    }

//<<-------------------------- Addition Boop ----------------------------------->>

    function AdditionBoop() {
        Boop.call(this);	// call parent constructor
        this.setType('addition');
//    this.setMaxInputs(10); // upper limit theoretically infinite, so lets limit it at 10
        console.log('Addition Boop Created');
    }

//inherit from Boop
    extend(Boop, AdditionBoop);

// @Override EVALUATE
    AdditionBoop.prototype.evaluate = function () {
        var sum = 0;

        this.inputs.filter(function (o) {
            console.log('value: ' + o.getValue());
            sum += parseFloat(o.getValue());
        });
        console.log('sum: ' + sum);

        return sum;
    }

//<<-------------------------- Subtraction Boop ----------------------------------->>

    function SubtractionBoop() {
        Boop.call(this);	// call parent constructor
        this.setType('subtraction');
        console.log('Subtraction Boop Created');
    }

//inherit from Boop
    extend(Boop, SubtractionBoop);

// @Override EVALUATE
    SubtractionBoop.prototype.evaluate = function () {
        if (!this.inputs[0]) {
            return 0;
        }
        var dif = parseFloat(this.inputs[0].getValue());

        console.log('value: ' + dif);
        if (this.inputs[1]) {
            dif -= parseFloat(this.inputs[1].getValue());
        }
        console.log('dif: ' + dif);

        return dif;
    }

//<<-------------------------- Multiplication Boop ----------------------------------->>

    function MultiplicationBoop() {
        Boop.call(this);	// call parent constructor
        this.setType('multiplication');
//    this.setMaxInputs(10); // upper limit theoretically infinite, so lets limit it at 10
        console.log('Multiplication Boop Created');
    }

//inherit from Boop
    extend(Boop, MultiplicationBoop);

// @Override EVALUATE
    MultiplicationBoop.prototype.evaluate = function () {
        if (!this.inputs[0]) {
            return 0;
        }

        var prod = 1;

        this.inputs.filter(function (o) {
            console.log('value: ' + o.getValue());
            prod *= parseFloat(o.getValue());
            console.log('prod: ' + prod);
        });

        return prod;
    }

//<<-------------------------- Division Boop ----------------------------------->>

    function DivisionBoop() {
        Boop.call(this);	// call parent constructor
        this.setType('division');
        console.log('Division Boop Created');
    }

//inherit from Boop
    extend(Boop, DivisionBoop);

// @Override EVALUATE
    DivisionBoop.prototype.evaluate = function () {
        if (!this.inputs[0]) {
            return 0;
        }

        var quot = this.inputs[0].getValue();

        console.log('value: ' + quot);
        if (this.inputs[1]) {
            quot /= parseFloat(this.inputs[1].getValue());
        }
        console.log('quot: ' + quot);

        return quot;
    }

//<<-------------------------- Exponent Boop ----------------------------------->>

    function ExponentBoop() {
        Boop.call(this);	// call parent constructor
        this.setType('exponent');
        this.setMaxInputs(1);
        console.log('Exponent Boop Created');
    }

//inherit from Boop
    extend(Boop, ExponentBoop);

// @Override EVALUATE
    ExponentBoop.prototype.evaluate = function () {
        if (!this.inputs[0]) {
            return 0;
        }

        var xprod = this.inputs[0].getValue();

        console.log('value: ' + xprod);
        if (this.inputs[1]) {
            xprod = Math.pow(xprod, this.inputs[1].getValue());
        }
        console.log('xprod: ' + xprod);

        return xprod;
    }

//<<-------------------------- Square Root Boop ----------------------------------->>

    function SquareRootBoop() {
        Boop.call(this);	// call parent constructor
        this.setType('squareroot');
        this.setMaxInputs(1);

        // implementing this later
        // this.setMaxOutputs(2); // square root always returns a positive & a negative

        console.log('Square Root Boop Created');
    }

//inherit from Boop
    extend(Boop, SquareRootBoop);

// @Override EVALUATE
    SquareRootBoop.prototype.evaluate = function () {
        if (!this.inputs[0]) {
            return 0;
        }

        var sr = this.inputs[0].getValue();

        console.log('value: ' + sr);
        sr = Math.sqrt(sr);
        console.log('sr: ' + sr);

        return sr;
    }

//<<-------------------------- Modulo Boop ----------------------------------->>
    function ModuloBoop() {
        Boop.call(this);	// call parent constructor
        this.setType('modulo');
        console.log('Modulo Boop Created');
    }

//inherit from Boop
    extend(Boop, ModuloBoop);

// @Override EVALUATE
    ModuloBoop.prototype.evaluate = function () {
        if (!this.inputs[0]) {
            return 0;
        }
        var div = this.inputs[0].getValue();

        console.log('value: ' + div);
        if (this.inputs[1]) {
            div %= this.inputs[1].getValue();
        }
        console.log('div: ' + div);

        return div;
    }

    // PUBLIC
    return {
        createNewBoop: function(type) {
            var boop;
            switch(type) {
                case 'variable':
                    boop = new VariableBoop();
                    break;
                case 'addition':
                    boop = new AdditionBoop();
                    break;
                case 'subtraction':
                    boop = new SubtractionBoop();
                    break;
                case 'multiplication':
                    boop = new MultiplicationBoop();
                    break;
                case 'division':
                    boop = new DivisionBoop();
                    break;
                case 'modulo':
                    boop = new ModuloBoop();
                    break;
                case 'exponent':
                    boop = new ExponentBoop();
                    break;
                case 'square Root':
                    boop = new SquareRootBoop();
                    break;
            }
            console.log(boop);
            boops.push(boop);
            return boop.getId();
        },

        getBoop: function(id) {
            var r;
            for(var i=0;i<boops.length;i++) {
                if(boops[i].getId() == id)
                    r = boops[i];
            }
            return r;
        },

        getAllBoops: function() {
            return boops;
        },

        reset: function() {
            boops = [];
            toSave = [];
            id = -1;
        }
    }

}())