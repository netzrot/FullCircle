var superagent = require('superagent');
var request = require('request');

module.exports = function loadStories({ NEWSAPI_KEY, RSSJSON_KEY }, newSearch) {
	console.log('loading stories...');

	var stories = {
		left: [],
		center: [],
		right: []
	};

	// IF THERE IS NO newSearch, THERE SHOULD BE NO searchQueryParam
	// AND THE ENDPOINT FOR CALLS TO newsapi SHOULD BE 'top-headlines'
	let searchQueryParam = ""
	let endPoint = "top-headlines"

	// HOWEVER, IF THERE IS A SEARCH, WE NEED TO ADD A searchQueryParam
	// AND SET everything AS THE ENDPOINT.
	if (newSearch) {
		searchQueryParam = `&q=${newSearch}`
		endPoint = "everything"
	}

	return new Promise(function(resolve, reject) {
		superagent
		    .get(`https://newsapi.org/v2/${endPoint}?sources=the-huffington-post&sortBy=top&apiKey=${NEWSAPI_KEY}${searchQueryParam}`)
		    .end(function(err, response){
		    	if (err) {
		    		return reject(err);
		    	}

				for (var i = 0; i < response.body.articles.length; i++) {
					if (response.body.articles[i].publishedAt) {
					response.body.articles[i].publishedAt = response.body.articles[i].publishedAt.split("T")[0] + " " + response.body.articles[i].publishedAt.split("T")[1].substring(0, 8);
					};
				}

		   		stories.left = response.body.articles;

			superagent
			   .get(`https://newsapi.org/v2/${endPoint}?sources=associated-press&sortBy=top&apiKey=${NEWSAPI_KEY}${searchQueryParam}`)
			   .end(function(err, response){

			   		if (err) { return reject(err); }

					for (var i = 0; i < response.body.articles.length; i++) {
						response.body.articles[i].description = response.body.articles[i].description.substring(0,145)+"...";
					}
							
					for (var i = 0; i < response.body.articles.length; i++) {
						if (response.body.articles[i].publishedAt) {
						response.body.articles[i].publishedAt = response.body.articles[i].publishedAt.split("T")[0] + " " + response.body.articles[i].publishedAt.split("T")[1].substring(0, 8);
						};
					}
			   
			   		stories.center = response.body.articles;
				   
			   	superagent
				   .get(`https://newsapi.org/v2/${endPoint}?sources=fox-news&apiKey=${NEWSAPI_KEY}${searchQueryParam}`)
				   .end(function(err, response){

				   		if (err) { return reject(err); }

						for (var i = 0; i < response.body.articles.length; i++) {
							response.body.articles[i].description = response.body.articles[i].description.substring(0,145)+"...";
						}
								
						for (var i = 0; i < response.body.articles.length; i++) {
							if (response.body.articles[i].publishedAt) {
							response.body.articles[i].publishedAt = response.body.articles[i].publishedAt.split("T")[0] + " " + response.body.articles[i].publishedAt.split("T")[1].substring(0, 8);
							};
						}
				   
				   		stories.right = response.body.articles;

					   		resolve(stories);
				 	});
			});  
		});
	});
};
