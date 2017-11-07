var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var cheerio = require('cheerio');
var request = require('request');

var loadStories = require('./loadStories');
//var loadResults = require('./loadResults');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 5000)); // Heroku

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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

var CacheTime = 5 * 60 * 1000;

app.get('/', function(req, res) {
	if (stories.lastUpdated < (new Date()) - CacheTime) {
		loadStories(process.env).
		then(function(freshStories) {
			stories = freshStories;
			stories.lastUpdated = new Date();

			res.render("index", { stories, maxStories: 6 }); // object of arrays
		}).
		catch(function(err) {
			console.log(err)
			res.status(500).render("error"); //send(err.toString());
		});
	} else {
		res.render("index", { stories, maxStories: 6 }); // object of arrays
	}
});


app.post('/search', function(req, res) {
	var newSearch = req.body.search;

	results = {
		left: [],
		center: [],
	};

	request('http://www.huffingtonpost.com/search?keywords='+ newSearch + '&sortBy=recency&sortOrder=desc', function (error, response, html) {
			
		// if (error) {
		// 	res.status(500).render("error');		
		// };

		if (!error && response.statusCode == 200) {

			console.log(response.body);
		    var $ = cheerio.load(html);
			    
		    $('a.card__link').each(function(i, element){
			    	
			 	var a = $(this); //gives link
			   	var text = a.text(); // gives text in link
			   	var url = a.attr('href'); // gives url

			   	story = {
			  		headline: text,
			  		link: url
			   	};
			    	
			   	results.left.push(story);
		     	
			});				    
		};

	request('http://hosted.ap.org/dynamic/external/search.hosted.ap.org/wireCoreTool/Search?SITE=AP&SECTION=HOME&TEMPLATE=DEFAULT&query=' + newSearch, function (error, response, html) {

		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(response.body);

			$('span.latestnews > a').each(function(i, element){
		    	
				var a = $(this); //gives link
				var text = a.text(); // gives text in link
		 		var url = 'http://hosted.ap.org/' + a.attr('href'); // gives url

			    story = {
					headline: text,
					link: url
			  	}

			results.center.push(story);
		  	});
	     	
		};			
	    
	request('http://api.foxnews.com/v1/content/search?q=' + newSearch + '&fields=description,title,url,image,type,taxonomy&sort=latest&section.path=fnc&type=article&start=0&callback=angular.callbacks._0&cb=201735140', function (error, response, html) {
					
		if (!error && response.statusCode == 200) {
			var body = response.body.slice(21, response.body.length-1);
			var bodyObj = JSON.parse(body);
								
			results.right = bodyObj.response.docs;
			res.render("results", { results });					    
		} else {
			res.status(500).render("error");
		}
	});
	});
	});
	
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// app.listen(3000, function() {
// 	console.log("app started on port 3000");
// });