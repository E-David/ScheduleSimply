const SECRETS = require('./client_secret_2.js')
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
  SECRETS.client_id,
  SECRETS.client_secret,
  SECRETS.redirect_uris[1]
);

// generate a url that asks permissions for Google Calendar scopes
var url = oauth2Client.generateAuthUrl({
	  scope: 'https://www.googleapis.com/auth/calendar',
	  access_type: 'offline'
})

console.log(url)
