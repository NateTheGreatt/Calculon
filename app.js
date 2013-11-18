
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/boop', function(req,res) {
    res.render('boop');
});

var db = mongoose.connect('mongodb://localhost/calculon');

var ProjectSchema = new mongoose.Schema({
    id: Number,
    name: String,
    user: String
});

var BoopSchema = new mongoose.Schema({
    id: Number,
    projectId: Number,
    type: String,
    value: Number,
    x: Number,
    y: Number
});

var BoopModel = mongoose.model('boop', BoopSchema);

var ClosureSchema = new mongoose.Schema({
    projectId: Number,
    boopId: Number,
    ancestor: Number,
    descendant: Number,
    tier: Number,
    layer: Number
});

var ClosureModel = mongoose.model('closure', ClosureSchema);

app.post('/save', function(req,res) {

    var boops = req.body.boops;

    console.log(boops);

    boops.filter(function(_boop) {
        var boop = new BoopModel();
        boop.id = _boop.id;
        boop.type = _boop.type;
        boop.value = _boop.value;
        boop.x = _boop.x;
        boop.y = _boop.y;
        boop.save();
    });

    /*var closure = new ClosureModel();
    closure.boopId = req.body.boopId;
    closure.ancestor = req.body.ancestor;
    closure.descendant = req.body.descendant;
    closure.tier = req.body.tier;

    closure.save(function() {
        ClosureModel.find({}, function(err, rows) {
            if(err) console.log('bad');
            else console.log('Closure added: '+rows);
        });
    });*/

    res.send(201,boops);
});

app.post('/saveBoop', function(req,res) {
    console.log('hey');
    BoopModel.findOne({id: req.body.id}, function(err,boop) {
        if(err) console.log('bad');
        else {
            if(boop) {
                boop.x = req.body.x;
                boop.y = req.body.y;
                boop.save(function() {
                    console.log('ok boop saved');
                });
            } else {

            }

        }
    })
})

app.get('/load', function(req,res) {
    BoopModel.find({}, function(err, boops) {
        console.log(boops);
    })
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
