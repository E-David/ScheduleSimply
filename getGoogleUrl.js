const SECRETS = require('./client_secret.js')
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
  SECRETS.client_id,
  SECRETS.client_secret
);

// generate a url that asks permissions for Google+ and Google Calendar scopes
var scopes = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/calendar'
];

var url = oauth2Client.generateAuthUrl({
	  // If you only need one scope you can pass it as string
	  scope: scopes
	})

console.log(url)
