# How to Oauth

Sling's OAuth provider enables org admins to create OAuth clients aka OAuth apps, that are basically entry points to Sling API and can be utilized by any Sling user. Each OAuth client has a couple of things attached to it: credentials, scopes, redirect uris, grant type and response type. Different OAuth grant flows would require different configurations. Currently Sling supports OAuth Authorization Code Grant as well as OpenID Connect Authorization Code Grant (for SSO purposes).

Standard-wise, there's no better resource than [the OAuth2 RFC](https://datatracker.ietf.org/doc/html/rfc6749). This document aims to explain how it all works in practice with Sling.

## Prerequisites

We need an OAuth2 client available, so we need to create one first. Unfortunately there's no UI for doing that yet, so one needs to hit Sling API directly to do so. Org admin access token can be taken from the browser's console API requests, when logged in as admin (see the instructions how to do that [here](https://github.com/getsling/getsling-api-docs#authentication)).

```
curl https://api.getsling.com/oauth2/client
 -X POST
 -H 'Authorization: ORG_ADMIN_ACCESS_TOKEN'
 -d '{"grantType": "authorization_code", "grantType": "authorization_code", "scopes": [], "redirectUris": ["https://my.redirect.uri"]}'
 -H 'Content-type: application/json'
```

The request will return client credentials and this is the only moment when the end user would actually see client secret complimenting client id. In case he needs new credentials, he will be able to rotate those, but this functionality is pending implementation.

## Oauth2 Bearer Token

This flow offers means for safely acquiring Sling access token, which would have authenticated user context attached to it, so all the requests made with OAuth2 access token would resemble those made by Sling client app, just using authorization Bearer token type.


## OAuth2 Bearer Token vs OAuth2 access token

Think of Bearer Token as a container for the access token. What API returns in the result of OAuth dance would be the access token (a string you can use with Authorization header and Bearer type), but in the db it is kept with some additional metadata. Those would be: client id (referencing OAuth2 client), user id (the user this token represents), scopes (defining permissions to different elements of the system, taken from the OAuth2 client definition), expiration time (token is active for maximum of 1 hour) and refresh token (allowing to issue new access token - refresh token flow is not implemented yet).

## Scopes

OAuth2 token would have scopes assigned to it - the same ones which are defined on the OAuth2 client used to obtain the token. That means, if there's a request being made to Sling endpoint which requires some set of scopes, those scopes need to be available for this access token. If the endpoint doesn't explicitly require any scopes, it would be available for any OAuth2 access token.

## OAuth2 Authorization Code flow

This is the most popular flow of obtaining the access token. It requires the end user to take action - during the flow user needs to authenticate with Sling and then approve scopes that would be granted to the generated token.

Steps to be taken:

1. Use valid OAuth2 client credentials to create authorization url, which the end user needs to access to initiate grant flow. `client_id`, `redirect_uri`, `response_type` and `scope` query parameters provided within the url need to match with what is set in the db for this concrete OAuth2 Client ID. `state` parameter is used to protect against Cross Site Request Forgery attacks.

`https://api.getsling.com/oauth2/authorize?client_id=OAUTH_CLIENT_ID&redirect_uri=https://my.redirect.uri&response_type=code&state=MY_STATE_VALUE`

2. At this point the end user needs to authenticate with Sling. When this happens, user is redirected to the OAuth2 client authorization screen, when he can inspect some data about the application, but most importantly it presents scopes OAuth2 app is requesting access for (if any).

3. When you approve authorization, you will get authorization code in the result of redirection to redirect uri defined within the url in step 1. Authorization code is available as a query param, it would look something like

`https://redirect.uri/?code=1vAWLbsxOBY4CI3PvR1WCAbT990yND&state=MY_STATE_VALUE`

`state` parameter is also returned, allowing client to verify if authorization request is tied to 3rd party user session.

4. The authorization code obtained with the redirection would then be passed by the client to the backend of the service requesting for access to Sling APIs. 3rd party backend service would then make a request to the Sling API, exchanging the authorization code to the access token. If one of the scopes selected in the approval step is `openid`, there will also be an ID token returned with server response, together with access token. ID token is specific to OpenID Connect standard. The request would look like this

```
curl https://api.getsling.com/oauth2/token
   -X POST
   -d '{"code": "AUTHORIZATION_CODE_WE_GOT_IN_THE_LAST_STEP", "client_id": "OAUTH_CLIENT_ID", "client_secret": "OAUTH_CLIENT_SECRET", "grant_type": "authorization_code", "redirect_uri": "https://my.redirect.uri"}' -H 'Content-type: application/json'
```

This request would be authorized by Sling using provided client ID, client secret and authorization code. Redirect uri must match one of the uris defined for the referenced OAuth2 app. Here's how the response would look like

```
{
   "access_token": "fe44efab086db02423eaf02fc54402d9",
   "expires_in": 3600,
   "refresh_token": "cde6dbfe47a241e6f5de301132ef867f",
   "token_type": "Bearer"
}
```

5. 3rd party services can now use obtained access tokens to issue requests to the Sling API.


## OpenID Connect

This uses Authorization Code Grant and adds a few things on top of it. To use OIDC, you need to set `openid` scope on the OAuth client as well as during the authorization step. One additional thing you will get when providing `openid` scope, apart from the access token, is the so called ID token. This token is encrypted with `openssl` private key of the keypair generated for every Sling environment separately. 3rd party can then decrypt the ID token using the public key available under `https://api.getsling.com/oauth2/openid-keys`.

It's not mandatory for 3rd party services to rely on an ID token, but it follows the standard, hence the implementation. What 3rd party service would usually do is issue a request to `UserInfo` endpoint, getting information about the user authorized with the access token sent with the request. The information returned by the endpoint would vary depending on scopes available on the access token. Returning email and additional user data (besides the very basic info) requires `email` and `profile` scopes.

`curl -H 'Authorization: Bearer MY_ACCESS_TOKEN'  https://api.getsling.com/oauth2/userinfo`

and the response

```
{
   "birthdate": null,
   "email": "my@email.com",
   "family_name": "Doe",
   "given_name": "John",
   "iss": "https://app.getsling.com",
   "name": "John Doe",
   "sub": 57810,
   "zoneinfo": "America/New_York"
}
```

Vast majority of properties returned are [standard OAuth2 claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims), so the naming is not accidental.


