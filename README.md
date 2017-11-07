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