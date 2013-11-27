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

var boops = [];

// Fields
var id = -1; // start at -1 so the first boop ID is 0
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

    console.log('update :');
    console.log(toSave);

    /*var boopArray = [],
        ioArray = [];

    toSave.filter(function(_boop) {
        var tmp = {};
        tmp.push({
            ""
        })
    });

    $.ajax({
     type: "POST",
     url: "/test",
     data: {"boops":JSON.stringify(boopArray), "io":JSON.stringify()},
     dataType: 'json'
     }).done(function( data ) {
        console.log( "Data Saved: " + data );
     });*/

    /*$.ajax({
        type: "POST",
        url: "/save",
        data: {"collection":toSave},
        dataType: 'json'
    });*/
        /*.done(function( data )
        {
            console.log( "Data Saved: " + data );
        });*/
}

function updateCollector(boop)
{
    window.clearTimeout(timeoutID);                         // cancel timer
    timeoutID = window.setTimeout(updateDatabase, 2000);    // set new timer

    for(var i=0;i<toSave.length;i++)
    {
        if(toSave[i].id == boop.id)
        {
            toSave[i] = boop;
            return;
        }
    }
    toSave.push(boop);          // add boop to array
}

function Connection(id)
{
    this.id = id;
    this.update = function()
    {
        if(id > -1)
        {
            boops[this.id].update();
        }
    };
    this.getType = function()
    {
        if(id > -1)
        {
            return boops[this.id].getType();
        }
    };
    this.getValue = function()
    {
        if(id > -1)
        {
            return boops[this.id].getValue();
        }
    };
    this.plugin = function(connectionId)
    {
        if(id > -1)
        {
            boops[this.id].plugin(connectionId);
        }
    };
    this.unplug = function(connectionId)
    {
        if(id > -1)
        {
            boops[this.id].unplug(connectionId);
        }
    };
    this.connectTo = function(connection)
    {
        if(connection)
        {
            boops[this.id].connectTo(connection);
        }
    };
    this.disconnectFrom = function(connection)
    {
        if(connection)
        {
            boops[this.id].disconnectFrom(connection);
        }
    };
}

function Boop()
{
    this.children = [];
    this.childInputs = [];
    this.childOutput;
    this.inputs = [];
    this.outputs = [];
    this.value = 0;
    this.id = ++id;
    this.type = 'boop';
    this.position = new Vector2(0,0);
    this.initializePorts(); // this wasnt here initially...
                            // but boops need port initialization too, but operator boops can't
                            // just inherit this because type hasn't been set yet.

    boops.push(this);
    console.log("boop"+this.id+" constructed");
//    this.update();
}

Boop.prototype =
{
    update : function()
    {
        this.value = this.evaluate();     // evaluate and set our output value

        this.outputs.filter(function(o)	    // for each boop we output to
        {
            console.log('Boop'+this.id+ ' updating: Boop'+ o.id);    // log who it is
            o.update();					    // and update them
        });
        updateCollector(this);
    },

    // EVALUATE to be overwritten by child class
    evaluate : function()
    {
        // parse children
        this.childInputs = [];
        this.children.filter(function(o)
        {
            switch(o.getType())
            {
                case "input":
                    o.update();
                    this.childInputs.push(o);
                    break;
                case "output":
                    this.childOutput = o;
                    break;
            }
        });
        // evaluate children
        if(this.childInputs.length > 0 && this.childOutput)
        {
            for(var i = 0; i < this.childInputs.length; ++i)
            {   //plug our inputs into the inner cluster's inputs and update them
                if(this.inputs[i])
                {
                    this.childInputs[i].plugin(this.inputs[i].getId());
                    this.childInputs[i].update();
                }
            }
            return output.getValue();
        }
        else
        {
            return 0;
        }
    },

    getValue : function()
    {
        return this.value;
    },

    setValue : function(x)
    {
        if(this.value != x)
        {
            this.value = x;
            updateCollector(this);
            this.update();
        }
        console.log('Boop #'+this.getId()+' value has been set to '+x);
    },

    getType : function()
    {
        return this.type;
    },

    setType : function(type)
    {
        console.log('was '+this.type + ' now is ' + type);
        if(this.type != type)
        {
            this.type = type;
            updateCollector(this);
        }
    },

    getId : function()
    {
        return this.id;
    },

    getPos : function()
    {
        return {"x": this.position.x, "y": this.position.y};
    },

    setPos : function(x,y)
    {
        var changed=false;
        if(this.position.x != x)
        {
            this.position.x = x;
            changed=true;
        }
        if(this.position.y != y)
        {
            this.position.y = y;
            changed=true;
        }
        if(changed)
        {
            updateCollector(this);
        }
        console.log('Position set: ('+x+','+y+')')
    },

    connectTo : function(other)
    {
        other.plugin(this.getId());         // add ourselves to the other boop's input array
        this.createOutputPort(other.getId());	// add the new connection to our output array
        other.update();				        // update them

        console.log('Boop' + this.getId() + ' connected to Boop' + other.getId());
    },

    disconnectFrom : function(other)
    {
        other.unplug(this.getId()); // remove ourselves from the other boop's inputs
        other.update(); 			// tell them to update
        this.unplug(other.getId()); // remove them from our outputs

        console.log('Boop' + this.getId() + ' disconnected from Boop' + other.getId());
    },

    plugin : function(id)
    {
        switch(this.getType())
        {
            case 'variable':    // can only take one input
                if(this.inputs[0].id == -1)
                {
                    this.inputs[0].id = id;
                }
                break;
            case 'addition':        // creates a new connection for every new plugin
                this.createInputPort(id);
                break;
            case 'multiplication':  // creates a new connection for every new plugin
                this.createInputPort(id);
                break;
            default:
                _.any(this.inputs,function(connection)  // everything else, just assign the plugin
                {                                       // to the next free connection
                    if(connection.id == -1)
                    {
                        connection.id = id;
                        return true;
                    }
                    return false;
                });
                break;
        }
    },

    unplug : function(id)
    {
        _.any(this.outputs, function(connection)
        {
            if(connection.id == id)
            {
                connection.id = -1;
                return true;
            }
            return false;
        });
    },
    // creating ports at instantiation
    initializePorts : function()
    {
        console.log('initializing ports for ' + this.getType())
        this.inputs = [];
        switch(this.getType())
        {
            case 'variable':
                this.createInputPort();
                break;
            case 'subtraction':
                this.createInputPort();
                this.createInputPort();
                break;
            case 'division':
                this.createInputPort();
                this.createInputPort();
                break;
            case 'exponent':
                this.createInputPort();
                this.createInputPort();
                break;
            case 'square root':
                this.createInputPort();
                break;
            case 'modulo':
                this.createInputPort();
                this.createInputPort();
                break;
            case 'boop':
                this.evaluate();                    // evaluate children
                this.childInputs.filter(function()  // boop has only as many inputs as childInputs
                {
                    this.createInputPort();
                });
                break;
        }
    },

    createInputPort : function(connectionId)
    {
        if(connectionId)
        {
            this.inputs.push(new Connection(connectionId));
        }
        else
        {
            this.inputs.push(new Connection(-1));
        }
    },

    createOutputPort : function(connectionId)
    {
        if(connectionId)
        {
            this.outputs.push(new Connection(connectionId));
        }
    }
}

//<<-------------------------- Variable Boop ----------------------------------->>

function VariableBoop()
{
    Boop.call(this);	// call parent constructor
    console.log('Variable Boop Created');
    this.setType('variable');
    this.initializePorts(); //relies on type being set 
}

// inherit from Boop
extend(Boop, VariableBoop);

//@Override EVALUATE
VariableBoop.prototype.evaluate = function()
{
    var input = this.inputs[0];
    if(input)
    {
        console.log('variable has input of ' + input.getValue());
        var value = input.getValue();
        return value ? value : this.getValue();
    }
}

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
        console.log('value: ' + o.getValue());
        sum += parseFloat(o.getValue());
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
    this.initializePorts(); //relies on type being set
}

//inherit from Boop
extend(Boop, SubtractionBoop);

// @Override EVALUATE
SubtractionBoop.prototype.evaluate = function()
{
    if(!this.inputs[0])
    {
        return 0;
    }
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
    this.initializePorts(); //relies on type being set
}

//inherit from Boop
extend(Boop, MultiplicationBoop);

// @Override EVALUATE
MultiplicationBoop.prototype.evaluate = function()
{
    if(!this.inputs[0])
    {
        return 0;
    }

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
    this.initializePorts(); //relies on type being set
}

//inherit from Boop
extend(Boop, DivisionBoop);

// @Override EVALUATE
DivisionBoop.prototype.evaluate = function()
{
    if(!this.inputs[0])
    {
        return 0;
    }

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
    this.initializePorts(); //relies on type being set
}

//inherit from Boop
extend(Boop, ExponentBoop);

// @Override EVALUATE
ExponentBoop.prototype.evaluate = function()
{
    if(!this.inputs[0])
    {
        return 0;
    }

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
    this.initializePorts(); //relies on type being set
}

//inherit from Boop
extend(Boop, SquareRootBoop);

// @Override EVALUATE
SquareRootBoop.prototype.evaluate = function()
{
    if(!this.inputs[0])
    {
        return 0;
    }

    var sr = this.inputs[0].getValue();

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
    this.initializePorts(); //relies on type being set
}

//inherit from Boop
extend(Boop, ModuloBoop);

// @Override EVALUATE
ModuloBoop.prototype.evaluate = function()
{
    if(!this.inputs[0])
    {
        return 0;
    }
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
