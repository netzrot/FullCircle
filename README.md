# FullStory #

# Setup #
## Install Dependencies ##
After pulling the repo, run

	npm install

to install dependencies.

## Local API Keys ##
This app requires local copies of the NewsAPI and RSSJSON API keys. In the top-level directory, create am `apikeys.env` file, populated like so:

    export NEWSAPI_KEY=api_key
    export RSSJSON_KEY=api_key

In local development mode, these will be set automatically by the `start:dev` script, or they can be set manually by running:

    source apikeys.env

# Notes #
It has been noted on several occasions that the call to 

    https://api.rss2json.com/v1/api.json

in `scripts/loadStories.js` would sometimes return an empty array with the success response; this is not exactly an error, but is an unusual condition that needs to be accounted for.

In this initial iteration of the app, we handle that by using conditional rendering in the .ejs views. Although this particular problem has not yet been noticed with the other sources, the condition has been added to those results as well, just in case.