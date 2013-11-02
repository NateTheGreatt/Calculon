function extend(base, sub)
{
    // Avoid instantiating the base class just to setup inheritance
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
    // for a polyfill
    sub.prototype = Object.create(base.prototype);
    // Remember the constructor property was set wrong, let's fix it
    sub.prototype.constructor = sub;
    // In ECMAScript5+ (all modern browsers), you can make the constructor property
    // non-enumerable if you define it like this instead
    /*Object.defineProperty(sub.prototype, 'constructor',
     {
     enumerable : false,
     value : sub
     });*/
}

// Fields
var id = -1; // boop id number

// jQuery Objects
/*var $port = $(document.createElement('div'))
    .addClass('port');

var $boop = $(document.createElement('div'))
    .addClass('boop')
    .append(document.createElement('div'))
    .html('Boop #'+this.id);*/

//<<-------------------------- Abastract Base Boop ----------------------------------->>

function Boop()
{
    // Back-end ----------------------------->>
    this.inputs = [];
    this.outputs = [];
    this.value = 0;
    this.id = ++id;

    // Front-end ---------------------------->>
    /*this.display = document.createElement('div');
     $(this.display)
     .addClass('boop')
     .html('Boop #'+this.id)
     .attr('draggable', 'true');
     $('#app').append(this.display);*/
}

Boop.prototype =
{
    // UPDATE
    update : function()
    {
        // redraw UI
        $('.value').trigger('redraw');

        if(this.inputs.length > 0)        // if we have any inputs
        {
            this.value = this.evaluate(); // evaluate and set our output value
        }

        this.outputs.filter(function(o)	// for each boop we output to
        {
            console.log('Updating: '+o);				// log who it is
            o.update();					// and update them
        });
    },

    // EVALUATE
    evaluate : function(){},		// to be overwritten by child class

    getValue : function() {
        return this.value;
    },
    setValue : function(x) {
        console.log('Boop #'+this.id+' value has been set to '+x);
        this.value = x;
    },
    getId : function() {
        return this.id;
    },

    // CONNECT TO
    connectTo : function(other)
    {
        other.inputs.push(this);	// add ourselves to the other boop's input array
        other.update();				// tell them to update

        this.outputs.push(other);	// add the other boop to our output array
        this.update();				// update ourselves



        console.log('Boop' + this.id + ' connected to Boop' + other.id);  // log the connection
    },

    // DISCONNECT FROM    
    disconnectFrom : function(other)
    {
        var index = other.inputs.indexOf(this.id); 	// get our index in the other boop's input array
        if(index > -1)
        {
            other.inputs.splice(index,1); 			// remove ourselves from it
        }
        other.update(); 							// tell them to update

        index = this.outputs.indexOf(other.id); 	// get the other boop's index in our output array
        if(index > -1)
        {
            this.outputs.splice(index,1);			// remove them from it
        }
        this.update();								// update ourselves
    }
}

//<<-------------------------- Variable Boop ----------------------------------->>

function VariableBoop()
{
    Boop.call(this);	// call parent constructor
    console.log('Variable Boop Created');
};

// inherit from Boop
extend(Boop, VariableBoop);

// SET VALUE
/*VariableBoop.prototype.setValue = function(value)
{
    this.value = value;
}*/

//<<-------------------------- Addition Boop ----------------------------------->>

function AdditionBoop()
{
    Boop.call(this);	// call parent constructor
    console.log('Addition Boop Created');
}

//inherit from Boop
extend(Boop, AdditionBoop);

// @Override EVALUATE
AdditionBoop.prototype.evaluate = function()
{
    var sum = 0;

    this.inputs.filter(function(o)
    {
        console.log('value: ' + o.value);
        sum += parseInt(o.value);
    });
    console.log('sum: ' + sum);
    this.value = sum;
    return sum;
}

//<<-------------------------- Subtraction Boop ----------------------------------->>

function SubtractionBoop()
{
    Boop.call(this);	// call parent constructor
    console.log('Subtraction Boop Created');
}

//inherit from Boop
extend(Boop, SubtractionBoop);

// @Override EVALUATE
SubtractionBoop.prototype.evaluate = function()
{
    var dif = parseInt(this.inputs[0].getValue());

    console.log('value: ' + dif);
    dif -= parseInt(this.inputs[1].getValue());
    console.log('dif: ' + dif);

    return dif;
}

//<<-------------------------- Multiplication Boop ----------------------------------->>

function MultiplicationBoop()
{
    Boop.call(this);	// call parent constructor
    console.log('Multiplication Boop Created');
}

//inherit from Boop
extend(Boop, MultiplicationBoop);

// @Override EVALUATE
MultiplicationBoop.prototype.evaluate = function()
{
    Boop.update();
    var prod = 1;

    this.inputs.filter(function(o)
    {
        console.log('value: ' + o.value);
        prod *= parseInt(o.value);
        console.log('prod: ' + prod);
    });

    return prod;
}

//<<-------------------------- Division Boop ----------------------------------->>

function DivisionBoop()
{
    Boop.call(this);	// call parent constructor
    console.log('Division Boop Created');
}

//inherit from Boop
extend(Boop, DivisionBoop);

// @Override EVALUATE
DivisionBoop.prototype.evaluate = function()
{
    var quot = this.inputs[0];

    console.log('value: ' + quot);
    quot /= parseInt(this.inputs[1]);
    console.log('quot: ' + quot);

    return quot;
}

//<<-------------------------- Exponent Boop ----------------------------------->>

function ExponentBoop()
{
    Boop.call(this);	// call parent constructor
    console.log('Exponent Boop Created');
}

//inherit from Boop
extend(Boop, ExponentBoop);

// @Override EVALUATE
ExponentBoop.prototype.evaluate = function()
{
    var xprod = this.inputs[0];

    console.log('value: ' + xprod);
    xprod = Math.pow(xprod,this.inputs[1]);
    console.log('xprod: ' + xprod);

    return xprod;
}

//<<-------------------------- Square Root Boop ----------------------------------->>

function SquareRootBoop()
{
    Boop.call(this);	// call parent constructor
    console.log('Square Root Boop Created');
}

//inherit from Boop
extend(Boop, SquareRootBoop);

// @Override EVALUATE
SquareRootBoop.prototype.evaluate = function()
{
    var sr = this.inputs[0];

    console.log('value: ' + sr);
    sr = Math.sqrt(sr);
    console.log('sr: ' + sr);

    return sr;
}

//<<-------------------------- Setup ----------------------------------->>

/*
var boop1 = new VariableBoop(),
    boop2 = new VariableBoop(),
    add1 = new AdditionBoop();

boop1.setValue(2);
boop2.setValue(3);
boop1.connectTo(add1);
boop2.connectTo(add1);*/
