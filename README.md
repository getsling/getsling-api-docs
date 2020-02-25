# Overview

This repository is a collection of integration guides and example scripts to help
you get up and running with the [offical Sling API](https://api.getsling.com/). It
is intended to provide high level information. If you need details on specific
endpoints, please review the [Sling OpenAPI documentation](https://api.getsling.com/).

# Structure

Example scripts in a variety of languages can be found [here](./examples/).
Integration guides can be found [here](./docs/).

# Status

This repository is currently a WIP.

# Getting Started

## Authentication Token

In order to make any request to the API, you must include an Authentication Token.
You can obtain a token by running [this BASH script](./examples/bash/login). If you prefer,you can also use
your web console to examine the request headers being sent to the API while using
the sling web application. Note that tokens obtained in this fashion are session-scoped
and could be invalidated at any time.
