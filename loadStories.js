var request = require('superagent');

module.exports = function loadStories(apiKeys) {
	console.log('loading stories...');

	var stories = {
		left: [],
		center: [],
		right: []
	};

	return new Promise(function(resolve, reject) {
		request
		    .get('https://newsapi.org/v1/articles?source=the-huffington-post&sortBy=top&apiKey='+ apiKeys.NEWSAPI_KEY)
		    .end(function(err, response){

		    	if (err) { return reject(err); }

		   		stories.left = response.body.articles;

			 	request
				   .get('https://newsapi.org/v1/articles?source=associated-press&sortBy=top&apiKey=' + apiKeys.NEWSAPI_KEY)
				   .end(function(err, response){

				   		if (err) { return reject(err); }

				   		// response.body.articles.map(
				   		// 	item => shortenDescription(item)
				   		// )

						for (var i = 0; i < response.body.articles.length; i++) {
							response.body.articles[i].description = response.body.articles[i].description.substring(0,145)+"...";
						}
		   
				   		stories.center = response.body.articles; // pushed array into object
			   
						   	
					  	request
						   .get('https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Ffeeds.foxnews.com%2Ffoxnews%2Fmost-popular&api_key=' + apiKeys.RSSJSON_KEY)
						   .end(function(err, response){

						   		for (var i = 0; i < response.body.items.length; i++) {
						   			response.body.items[i].description = response.body.items[i].description.split("<img")[0].substring(0,145)+"...";
						   		}

						   		stories.right = response.body.items; // response.body.items is an array

						   		resolve(stories);
					   	})
				});  
		});
	});
};