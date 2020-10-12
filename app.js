var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('./dbcon.js');
var session = require('express-session');
var sessionpw = require('./sessionPw.js');

var app = express();
var handlebars = require('express-handlebars').create({
  defaultLayout:'main',
});

app.engine('handlebars', handlebars.engine);
app.set('mysql', mysql);
app.set('port', process.argv[2]);
app.set('view engine', 'handlebars');
app.use(session({
  secret: sessionpw.pw,
  resave: false,
  saveUninitialized: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use('/home', require('./index.js'));
app.use('/party', require('./party.js'));
app.use('/addPokemon', require('./addPokemon.js'));
app.use('/addMoves', require('./addMoves.js'));
app.use('/addTypes', require('./addTypes.js'));
app.use('/editPokemonMoves', require('./editPokemonMoves.js'));
app.use('/static', express.static('public'));
app.use('/', express.static('public'));

app.use(function(req,res){
  res.status(404);
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
});

app.listen(app.get('port'), function(){
  console.log('Express started on port ' + app.get('port') + '; press Ctrl-C to terminate.');
});