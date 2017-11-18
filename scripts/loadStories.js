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

					   		// response.body.articles.map(
					   		// 	item => shortenDescription(item)
					   		// )

					for (var i = 0; i < response.body.articles.length; i++) {
						response.body.articles[i].description = response.body.articles[i].description.substring(0,145)+"...";
					}
							
					for (var i = 0; i < response.body.articles.length; i++) {
						if (response.body.articles[i].publishedAt) {
						response.body.articles[i].publishedAt = response.body.articles[i].publishedAt.split("T")[0] + " " + response.body.articles[i].publishedAt.split("T")[1].substring(0, 8);
						};
					}
			   
			   		stories.center = response.body.articles;
				   
			   	// SOURCES FROM THE RIGHT HAVE DIFFERENT REQUEST TARGETS,
			   	// DEPENDING ON WHETHER OR NOT THIS IS AN INDEX VIEW OR A SEARCH VIEW
				if (newSearch) {
					request(`http://api.foxnews.com/v1/content/search?fields=description,title,url,image,type,taxonomy,date,&sort=latest${searchQueryParam}&section.path=fnc&type=article&start=0&callback=angular.callbacks._0&cb=201735140`, function (error, response, html) {
						if (!error && response.statusCode == 200) {
							var body = response.body.slice(21, response.body.length-1);
							var bodyObj = JSON.parse(body).response.docs;

							// IN ORDER TO MATCH THE DATA FORMATTING RETURNED FROM rss2json,
							// ADD A pubDate ATTRIBUTE WITH A VALUE OF A SCRUBBED pubDate
							for (let i = 0; i  < bodyObj.length; i++) {
								bodyObj[i].pubDate = bodyObj[i].date.replace(/[A-Z]/g, " ")
							}

							stories.right = bodyObj;

							resolve(stories)				    
						}
					});
				} else {
				 	superagent
					   .get(`https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Ffeeds.foxnews.com%2Ffoxnews%2Fmost-popular&api_key=${RSSJSON_KEY}`)
					   .end(function(err, response){

					   		for (var i = 0; i < response.body.items.length; i++) {
					   			response.body.items[i].description = response.body.items[i].description.split("<img")[0].substring(0,145)+"...";
					   			// IN THIS CONTEXT, THE URL TO THE STORY IS AN ATTRIBUTE CALLED link - 
					   			// HOWEVER, IN ALL OTHER CONTEXTS, WE'RE LOOKING FOR SOMETHING CALLED url.
					   			// JUST ADD A url ATTRIBUTE TO THE OBJECT WITH THE SAME VALUE AS link.
					   			response.body.items[i].url = response.body.items[i].link
					   		}

					   		stories.right = response.body.items; // response.body.items is an array

					   		resolve(stories);
				 	});
				}
			});  
		});
	});
};
