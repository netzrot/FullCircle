var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var request = require('superagent');
var cheerio = require('cheerio');
var requesttool = require('request');

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

	stories = {};

	request
	   .get('https://newsapi.org/v1/articles?source=the-huffington-post&sortBy=top&apiKey=dfa82d950c17427692ee0798b9b0fab9')
	   .end(function(err, response){

	   		stories.left = response.body.articles;

		   	request
			   .get('https://newsapi.org/v1/articles?source=associated-press&sortBy=top&apiKey=dfa82d950c17427692ee0798b9b0fab9')
			   .end(function(err, response){
			   
			   		stories.center = response.body.articles; // pushed array into object
		   
					   	
					  	request
						   .get('https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Ffeeds.foxnews.com%2Ffoxnews%2Flatest&api_key=ooep7aqikxp2cukiicftuayxtgrfqyz4f0jvngqx')
						   .end(function(err, response){

						   		stories.right = response.body.items; // response.body.items is an array
						   		res.render("index", { articles: stories }); // object of arrays
					   	})
			});  
	});
});

 

app.post('/search', function(req, res) {

	var newSearch = req.body.search;

	results = {
		left: [],
		center: [],
	};
	

	requesttool('http://www.huffingtonpost.com/search?keywords='+ newSearch + '&sortBy=recency&sortOrder=desc', function (error, response, html) {
			
		if (!error && response.statusCode == 200) {
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

			requesttool('http://hosted.ap.org/dynamic/external/search.hosted.ap.org/wireCoreTool/Search?SITE=AP&SECTION=HOME&TEMPLATE=DEFAULT&query=' + newSearch, function (error, response, html) {
		
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
	    
					requesttool('http://api.foxnews.com/v1/content/search?q=' + newSearch + '&fields=description,title,url,image,type,taxonomy&sort=latest&section.path=fnc&type=article&start=0&callback=angular.callbacks._0&cb=201735140', function (error, response, html) {
					
						if (!error && response.statusCode == 200) {
							var body = response.body.slice(21, response.body.length-1);
							var bodyObj = JSON.parse(body);
								
							results.right = bodyObj.response.docs;
							res.render("results", { results });							    
						};
					});
			});
	});
});




app.listen(3000, function() {
	console.log("app started on port 3000");
});