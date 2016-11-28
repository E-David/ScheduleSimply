let Router = require('express').Router;
const SECRETS = require('../client_secret.js')
var google = require('googleapis');

const googleRouter = Router()

var OAuth2 = google.auth.OAuth2

var oauth2Client = new OAuth2(
  SECRETS.client_id,
  SECRETS.client_secret,
  SECRETS.redirect_uris[1]
)


googleRouter
	.get('/calendar/code', function(req,res) {
		var code = req.query.code
		console.log(req.body)
		console.log("code retrieved: ", code)
		console.log("THEN", oauth2Client)
		oauth2Client.getToken(code, function (err, tokens) {
		// Now tokens contains an access_token and an optional refresh_token. Save them.
			console.log(tokens)
			if (!err) {
				oauth2Client.setCredentials(tokens);
			}
		})
		console.log("NOW", oauth2Client)
	})

module.exports = googleRouter