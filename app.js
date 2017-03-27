const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const superagent = require('superagent');
const cheerio = require('cheerio');
const request = require('request');
const loadStories = require('./loadStories');
//let loadResults = require('./loadResults');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 5000)); // Heroku

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let stories = {
	lastUpdated: 0, // 1970
	left: [],
	center: [],
	right: []
};

let CacheTime = 5 * 60 * 1000;

app.get('/', function(req, res) {
	if (stories.lastUpdated < (new Date()) - CacheTime) {
		loadStories(process.env).
		then(function(freshStories) {
			stories = freshStories;
			stories.lastUpdated = new Date();

			res.render("index", { stories, maxStories: 6 }); // object of arrays
		}).
		catch(function(err) {
			res.status(500).render("error"); //send(err.toString());
		});
	} else {
		res.render("index", { stories, maxStories: 6 }); // object of arrays
	}
});

app.post('/search', function(req, res) {
	let newSearch = req.body.search;
	results = {
		left: [],
		center: [],
	};

	request('http://www.huffingtonpost.com/search?keywords='+ newSearch + '&sortBy=recency&sortOrder=desc', function (error, response, html) {
		// if (error) {
		// 	res.status(500).render("error');		
		// };
		if (!error && response.statusCode == 200) {
		    let $ = cheerio.load(html);
		    $('a.card__link').each(function(i, element){
			 	let a = $(this); //gives link
			   	let text = a.text(); // gives text in link
			   	let url = a.attr('href'); // gives url
			   	story = {
			  		headline: text,
			  		link: url
			   	};
			   	results.left.push(story);
			});				    
		};

		request('http://hosted.ap.org/dynamic/external/search.hosted.ap.org/wireCoreTool/Search?SITE=AP&SECTION=HOME&TEMPLATE=DEFAULT&query=' + newSearch, function (error, response, html) {
			if (!error && response.statusCode == 200) {
				let $ = cheerio.load(response.body);
				$('span.latestnews > a').each(function(i, element){
					let a = $(this); //gives link
					let text = a.text(); // gives text in link
			 		let url = 'http://hosted.ap.org/' + a.attr('href'); // gives url
				    story = {
						headline: text,
						link: url
				  	}
				results.center.push(story);
			  	});
		     	
			};			
	    
			request('http://api.foxnews.com/v1/content/search?q=' + newSearch + '&fields=description,title,url,image,type,taxonomy&sort=latest&section.path=fnc&type=article&start=0&callback=angular.callbacks._0&cb=201735140', function (error, response, html) {
				if (!error && response.statusCode == 200) {
					let body = response.body.slice(21, response.body.length-1);
					let bodyObj = JSON.parse(body);		
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