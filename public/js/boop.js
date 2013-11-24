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
var toSave = [];
var timeoutID;

// jQuery Objects
/*var $port = $(document.createElement('div'))
    .addClass('port');

var $boop = $(document.createElement('div'))
    .addClass('boop')
    .append(document.createElement('div'))
    .html('Boop #'+this.id);*/

//<<-------------------------- Abastract Base Boop ----------------------------------->>

// A structure that holds two floats x, and y
function Vector2(x,y)
{
    this.x = x;
    this.y = y;
}
// function that takes the array toSave, and pushes those changes to the database.
function updateDatabase()
{
    // TODO: update all boops in the array into the database and closure tables
}

function updateCollector(boop)
{
    window.clearTimeout(timeoutID);                         // cancel timer
    timeoutID = window.setTimeout(updateDatabase, 500);    // set new timer

    toSave.push(boop);          // add boop to array
}

function Boop()
{
    this.inputs = [];
    this.outputs = [];
    this.value = 0;
    this.id = ++id;
    this.type = 'boop';
    this.position = new Vector2(0,0);

    var data =
    {
        inputs : this.inputs,
        outputs : this.outputs,
        value : this.value,
        id : this.id,
        type : this.type,
        x : this.position.x,
        y : this.position.y
    }
    this.update();
}

Boop.prototype =
{
    // UPDATE
    update : function()
    {
        if(this.inputs.length > 0)          // if we have any inputs
        {
            this.setValue(this.evaluate()); // evaluate and set our output value
        }

        this.outputs.filter(function(o)	    // for each boop we output to
        {
            console.log('Updating: '+o);    // log who it is
            o.update();					    // and update them
        });
        updateCollector(this);
    },

    // EVALUATE
    evaluate : function(){},	// to be overwritten by child class

    getValue : function()
    {
        return this.value;
    },
    setValue : function(x)
    {
        if(this.value != x)
        {
            this.value = x;
        }
        console.log('Boop #'+this.id+' value has been set to '+x);
        updateCollector(this);
    },
    getType : function()
    {
        return this.type;
    },

    setType : function(type) {
        if(this.type != type)
        {
            this.type = type;
        }
        updateCollector(this);
    },

    getId : function()
    {
        return this.id;
    },

    setPos : function(x,y)
    {
        if(this.position.x != x)
        {
            this.position.x = x;
        }
        if(this.position.y != y)
        {
            this.position.y = y;
        }
        console.log('Position set: ('+x+','+y+')')
        updateCollector(this);
    },

    getPos : function()
    {
        return {"x": this.position.x, "y": this.position.y};
    },

    // CONNECT TO
    connectTo : function(other)
    {
        other.inputs.push(this);	// add ourselves to the other boop's input array

        this.outputs.push(other);	// add the other boop to our output array
        this.update();				// update ourselves
        console.log('Boop' + this.id + ' connected to Boop' + other.id);  // log the connection
    },

    // DISCONNECT FROM    
    disconnectFrom : function(other)
    {
        var index = other.inputs.indexOf(this); 	// get our index in the other boop's input array
        if(index > -1)
        {
            other.inputs.splice(index,1); 			// remove ourselves from it
        }
        other.update(); 							// tell them to update
        index = this.outputs.indexOf(other); 	// get the other boop's index in our output array
        if(index > -1)
        {
            this.outputs.splice(index,1);			// remove them from it
        }
        this.update();                              // update ourselves
    }
}

//<<-------------------------- Variable Boop ----------------------------------->>

function VariableBoop()
{
    Boop.call(this);	// call parent constructor
    this.setType('variable');
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
    this.setType('addition');
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
        sum += parseFloat(o.value);
    });
    console.log('sum: ' + sum);

    return sum;
}

//<<-------------------------- Subtraction Boop ----------------------------------->>

function SubtractionBoop()
{
    Boop.call(this);	// call parent constructor
    this.setType('subtraction');
    console.log('Subtraction Boop Created');
}

//inherit from Boop
extend(Boop, SubtractionBoop);

// @Override EVALUATE
SubtractionBoop.prototype.evaluate = function()
{
    var dif = parseFloat(this.inputs[0].getValue());

    console.log('value: ' + dif);
    if(this.inputs[1])
    {
        dif -= parseFloat(this.inputs[1].getValue());
    }
    console.log('dif: ' + dif);

    return dif;
}

//<<-------------------------- Multiplication Boop ----------------------------------->>

function MultiplicationBoop()
{
    Boop.call(this);	// call parent constructor
    this.setType('multiplication');
    console.log('Multiplication Boop Created');
}

//inherit from Boop
extend(Boop, MultiplicationBoop);

// @Override EVALUATE
MultiplicationBoop.prototype.evaluate = function()
{
    var prod = 1;

    this.inputs.filter(function(o)
    {
        console.log('value: ' + o.getValue());
        prod *= parseFloat(o.getValue());
        console.log('prod: ' + prod);
    });

    return prod;
}

//<<-------------------------- Division Boop ----------------------------------->>

function DivisionBoop()
{
    Boop.call(this);	// call parent constructor
    this.setType('division');
    console.log('Division Boop Created');
}

//inherit from Boop
extend(Boop, DivisionBoop);

// @Override EVALUATE
DivisionBoop.prototype.evaluate = function()
{
    var quot = this.inputs[0].getValue();

    console.log('value: ' + quot);
    if(this.inputs[1])
    {
        quot /= parseFloat(this.inputs[1].getValue());
    }
    console.log('quot: ' + quot);

    return quot;
}

//<<-------------------------- Exponent Boop ----------------------------------->>

function ExponentBoop()
{
    Boop.call(this);	// call parent constructor
    this.setType('exponent');
    console.log('Exponent Boop Created');
}

//inherit from Boop
extend(Boop, ExponentBoop);

// @Override EVALUATE
ExponentBoop.prototype.evaluate = function()
{
    var xprod = this.inputs[0].getValue();

    console.log('value: ' + xprod);
    if(this.inputs[1])
    {
        xprod = Math.pow(xprod,this.inputs[1].getValue());
    }
    console.log('xprod: ' + xprod);

    return xprod;
}

//<<-------------------------- Square Root Boop ----------------------------------->>

function SquareRootBoop()
{
    Boop.call(this);	// call parent constructor
    this.setType('squareroot');
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
//<<-------------------------- Modulo Boop ----------------------------------->>

function ModuloBoop()
{
    Boop.call(this);	// call parent constructor
    this.setType('modulo');
    console.log('Modulo Boop Created');
}

//inherit from Boop
extend(Boop, ModuloBoop);

// @Override EVALUATE
ModuloBoop.prototype.evaluate = function()
{
    var div = this.inputs[0].getValue();

    console.log('value: ' + div);
    if(this.inputs[1])
    {
        div %= this.inputs[1].getValue();
    }
    console.log('div: ' + div);

    return div;
}

//<<-------------------------- Initial Layout ----------------------------------->>

/*
var boop1 = new VariableBoop(),
    boop2 = new VariableBoop(),
    add1 = new AdditionBoop();

boop1.setValue(2);
boop2.setValue(3);
boop1.connectTo(add1);
boop2.connectTo(add1);*/
