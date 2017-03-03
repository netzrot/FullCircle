var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var request = require('superagent');

var index = require('./routes/index');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res) {

	request
   .get('https://newsapi.org/v1/articles?source=the-huffington-post&sortBy=top&apiKey=dfa82d950c17427692ee0798b9b0fab9')
   .end(function(err, response){

	   	console.log(response.body.articles);

	   	res.render("index", { articles: response.body.articles });

	});

});


// app.post('/search', function(req, res) {
	
// });

app.listen(3000, function() {
	console.log("app started on port 3000");
});