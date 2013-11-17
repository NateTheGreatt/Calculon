
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

var ClosureSchema = new mongoose.Schema({
    ancestor: Number,
    descendant: Number,
    tier: Number
});

ClosureModel = mongoose.model('ClosureTable', ClosureSchema);

app.post('/save', function(req,res) {
    var boop = new ClosureModel();
    boop.ancestor = req.body.ancestor;
    boop.descendant = req.body.descendant;
    boop.tier = req.body.tier;

    boop.save(function() {
        ClosureModel.find({}, function(err, rows) {
            if(err) console.log('bad');
            else console.log(rows);
        });
    });

    res.send(200);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
