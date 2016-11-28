let Router = require('express').Router;
const SECRETS = require('../client_secret.js')
var google = require('googleapis');
var calendar = google.calendar('v3')

const googleRouter = Router()

var OAuth2 = google.auth.OAuth2

var oauth2Client = new OAuth2(
  SECRETS.client_id ,
  SECRETS.client_secret,
  SECRETS.redirect_uris[0]
)

'http://localhost:3000/google/calendar/code?code=123'
googleRouter
	.get('/calendar/code', function(req,res) {
		var code = req.query.code
		oauth2Client.getToken(code, function (err, tokens) {
		// Now tokens contains an access_token and an optional refresh_token. Save them.
			console.log(tokens,err)
			if (!err) {
				oauth2Client.setCredentials(tokens);
			}
			res.redirect(`/#googleAccess/${oauth2Client.credentials.access_token}`)
		})
		
	})
	.get('/calendar/events', function(req,res) {
		var url = req.query.url
		var token = req.query.token
		console.log(token)
		oauth2Client.setCredentials({
			access_token: token
		})
		calendar.events.list({
				auth: oauth2Client,
				calendarId: 'primary',
				timeMin: (new Date()).toISOString(),
				maxResults: 10,
				singleEvents: true,
				orderBy: 'startTime'
			}, function(err, response) {
			if (err) {
			  console.log('The API returned an error: ' + err);
			  res.status(400).json(err);
			}
			else {
			  res.json(response)
			}
		})
	})

	.get('/calendar/create', function(req,res) {
		oauth2Client.setCredentials({
			access_token: req.query.token
		})
		console.log(req.query.when)
		var event = {
		  'summary': req.query.what,
		  'start': {
		    'dateTime': req.query.when + ':00',
		    timeZone: 'America/Los_Angeles'
		  },
		  end: {
		  	dateTime: req.query.when + ':30',
		  	timeZone: 'America/Los_Angeles'
		  }
		}

		calendar.events.insert({
		  auth: oauth2Client,
		  calendarId: 'primary',
		  resource: event,
		}, function(err, event) {
		  if (err) {
		    console.log('There was an error contacting the Calendar service: ' + err);
		    res.status(400).json(err);
		  }
		  else res.json(event)
		});
	})

module.exports = googleRouter