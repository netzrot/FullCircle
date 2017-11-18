var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var cheerio = require('cheerio');
var favicon = require("serve-favicon");
var API_KEYS = {
	NEWSAPI_KEY: process.env.NEWSAPI_KEY,
	RSSJSON_KEY: process.env.RSSJSON_KEY
};
var compression = require("compression")
var loadStories = require('./scripts/loadStories');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 5000)); // Heroku

app.use(compression())
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var stories = {
	lastUpdated: 0, // 1970
	left: [],
	center: [],
	right: []
};

const CacheTime = 5 * 60 * 1000,
	maxStories = 6

app.get('/', function(req, res) {
	// THIS IS NOT A FINAL SOLUTION
	// JUST NEED TO CLEAR OUT stories HERE FOR THE TIME BEING...
	stories = {
		lastUpdated: 0, // 1970
		left: [],
		center: [],
		right: []
	};

	if (stories.lastUpdated < (new Date()) - CacheTime) {
		loadStories(API_KEYS, undefined).
		then(function(freshStories) {
			stories = freshStories;
			stories.lastUpdated = new Date();

			res.render("index", { stories, maxStories: maxStories }); // object of arrays
		}).
		catch(function(err) {
			console.log(err)
			res.status(500).render("error"); //send(err.toString());
		});
	} else {
		res.render("index", { stories, maxStories: maxStories }); // object of arrays
	}
});

app.post("/search", (req, res) => {
	const newSearch = req.body.search;

	loadStories(API_KEYS, newSearch).
		then((searchResults) => {
			res.render("index", { stories: searchResults, maxStories: maxStories })
		})
})

app.get("/about", (req, res) => {
	res.render("about", {})
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});