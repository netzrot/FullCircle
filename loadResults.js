var request = require('request');
var cheerio = require('cheerio');

module.exports = function loadResults(newSearch) {
	
	results = {
		left: [],
		center: [],
	};

	request('http://www.huffingtonpost.com/search?keywords='+ newSearch + '&sortBy=recency&sortOrder=desc', function (error, response, html) {
			
		// if (error) {
		// 	res.redirect('/error');		
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
				return results;						    
			};
	});
	});
	});
};
