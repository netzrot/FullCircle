var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var cheerio = require('cheerio');
var request = require('request');
var favicon = require("serve-favicon");
var API_KEYS = {
	NEWSAPI_KEY: process.env.NEWSAPI_KEY,
	RSSJSON_KEY: process.env.RSSJSON_KEY
};
var compression = require("compression")

var loadStories = require('./scripts/loadStories');
//var loadResults = require('./loadResults');

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
		loadStories(API_KEYS).
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

app.post('/search', function(req, res) {
	var newSearch = req.body.search;

	// results = {
	// 	left: [],
	// 	center: [],
	// };

	// testing
	// THIS SORT OF WORKS FOR NOW, BUT IS NOT A FINAL SOLUTION
	stories = {
		left: [],
		center: [],
		right: []
	}


	request('http://www.huffingtonpost.com/search?keywords='+ newSearch + '&sortBy=recency&sortOrder=desc', function (error, response, html) {
		// if (error) {
		// 	res.status(500).render("error');		
		// };
		if (!error && response.statusCode == 200) {
		    var $ = cheerio.load(html);

		    $('a.card__link').each(function(i, element){
			 	let a = $(this); //gives link
			   	let text = a.text(); // gives text in link
			   	let url = a.attr('href'); // gives url
			   	story = {
			  		title: text,
			  		url: `https://www.huffingtonpost.com/${url}`
			   	};
			    	
			   	// results.left.push(story);
			   	stories.left.push(story);
		     	
			});				    
		};
		
	// IT LOOKS LIKE REQUESTS TO THE AP HAVE A NEW RESPONSE FORMAT, THE response.body DOESN'T APPEAR TO HAVE THE NECESSARY ELEMENTS ANYMORE
	request('http://hosted.ap.org/dynamic/external/search.hosted.ap.org/wireCoreTool/Search?SITE=AP&SECTION=HOME&TEMPLATE=DEFAULT&query=' + newSearch, function (error, response, html) {
	
		if (!error && response.statusCode == 200) {
		 	var $ = cheerio.load(response.body);

			console.log(response.body);
			

			// $('span.latestnews > a').each(function(i, element){
			// 	var a = $(this); //gives link
			// 	var text = a.text(); // gives text in link
		 // 		var url = 'http://hosted.ap.org/' + a.attr('href'); // gives url

			//     story = {
			// 		title: text,
			// 		url: url
			//   	}

			// 	// results.center.push(story);
			// 	stories.center.push(story);
		 //  	});
	     	
		};			
	    
	request('http://api.foxnews.com/v1/content/search?q=' + newSearch + '&fields=description,title,url,image,type,taxonomy&sort=latest&section.path=fnc&type=article&start=0&callback=angular.callbacks._0&cb=201735140', function (error, response, html) {
					
		if (!error && response.statusCode == 200) {
			var body = response.body.slice(21, response.body.length-1);
			var bodyObj = JSON.parse(body);
								
			// results.right = bodyObj.response.docs;
			stories.right = bodyObj.response.docs;
			// res.render("index", { results, maxStories: maxStories });
			res.render("index", { stories, maxStories: maxStories });					    
		} else {
			res.status(500).render("error");
		}
	});
	});
	});
});


// app.post('/search', function(req, res) {
// 	const newSearch = req.body.search,
// 		results = {
// 			left: [],
// 			center: [],
// 		};

// 	const searchLeft = function(callback) {
// 		request(`http://www.huffingtonpost.com/search?keywords=${newSearch}&sortBy=recency&sortOrder=desc`, function (error, response, html) {
// 			if (response.statusCode === 200) {
// 				var $ = cheerio.load(html);
// 			    $('a.card__link').each(function(i, element){
// 				 	const a = $(this), //gives link
// 				   		text = a.text(), // gives text in link
// 				   		url = a.attr('href'), // gives url
// 						story = {
// 				  			headline: text,
// 				  			link: url
// 				   		};
				    	
// 				   	results.left.push(story);
// 				});

// 				callback(searchRight())
// 			}
// 		})
// 	}

// 	const searchRight = function(callback) {
// 		request(`http://api.foxnews.com/v1/content/search?q=${newSearch}&fields=description,title,url,image,type,taxonomy&sort=latest&section.path=fnc&type=article&start=0&callback=angular.callbacks._0&cb=201735140`, function (error, response, html) {
// 			if (!error && response.statusCode == 200) {
// 				var body = response.body.slice(21, response.body.length-1);
// 				var bodyObj = JSON.parse(body);
									
// 				results.right = bodyObj.response.docs;
// 				callback()					    
// 			} else {
// 				res.status(500).render("error");
// 			}
// 		});
// 	}

// 	const searchCenter = function(callback) {
// 		request(`http://hosted.ap.org/dynamic/external/search.hosted.ap.org/wireCoreTool/Search?SITE=AP&SECTION=HOME&TEMPLATE=DEFAULT&query=${newSearch}`, function (error, response, html) {
// 			if (response.statusCode === 200) {
// 				var $ = cheerio.load(response.body);

// 				$('span.latestnews > a').each(function(i, element){
// 					var a = $(this), //gives link
// 						text = a.text(), // gives text in link
// 			 			url = 'http://hosted.ap.org/' + a.attr('href'), // gives url
// 					    story = {
// 							headline: text,
// 							link: url
// 					  	}

// 					results.center.push(story);
// 			  	});

// 			  	callback(renderSearchResults())
// 			};
// 		})
// 	}

// 	searchLeft(searchCenter)

// 	const renderSearchResults = function() {
// 		// res.render({ results })
// 		res.render("index", { results, maxStories: maxStories });
// 	}
// });

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});