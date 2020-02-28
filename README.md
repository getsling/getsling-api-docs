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

## Authentication

In order to make any request to the API, you must include an Authentication Token.
You can obtain a token using the [/account/login](https://api.getsling.com/#/accounts/post_account_login) endpoint.
[This BASH script](./examples/bash/login) provides an example of how to do so, and
can be run to obtain a token.

If you prefer, you can also use your web console to examine the request headers
being sent to the API while using the sling web application. Note that tokens
obtained in this fashion are session-scoped and will be invalidated when you log out.

Once you have obtained your token, you must include it in the headers of all
requests to the API like so:

```
Authorization: <my_super_secret_token>
```

## Authorization

The token that you obtain will be bound to your user. As a result, your token has
the same level of access as your user. As an example, if you are using a token
bound to an administrator to access the list of scheduled shifts, all shifts would
be returned. Conversely, if your token is bound to an employee, only that employee's
shifts would be returned.
