import Backbone from 'backbone'
import STORE from './store'
import React from 'react'
import ReactDOM from 'react-dom'
import TodoApp from './views/todoApp'
import $ from 'jquery'


const app = function() {
	const googleURL = 'https://accounts.google.com/o/oauth2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.me%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar&response_type=code&client_id=509881380831-m7krgqqr2g77l1fe509duhaipi4jc4gf.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fgoogle%2Fcalendar%2Fcode'	
	const qs = function(sel) {
		return document.querySelector(sel)
	}

	var submitEvent = function(e) {
		e.preventDefault()
		$.getJSON(`/google/calendar/create?what=${e.target.what.value}&when=${e.target.when.value}&token=${localStorage.getItem('calendar_token')}`)
			.then((resp)=>console.log(resp))
	}
	var creationForm = `
		<form>
			<input name="what" placeholder="event name">
			<input name="when" type="datetime-local">
			<button type="submit">submit</button>
		</form>
	`

	var lynx = 
		`<a href="#createEvent">create</a>
		<a href="${googleURL}">		
			<button>please work</button>
		</a>`


	var writeView = (content) => qs('.container').innerHTML = content

	const CalendarRouter = Backbone.Router.extend({
		routes: {
			'createEvent': 'handleCreator',
			'googleAccess/:token': 'setToken',
			'*default': 'handleDefault'
		},
		handleCreator: function() {
			writeView(creationForm)
			qs('form').onsubmit = submitEvent
		},

		handleDefault: function() {
			writeView(lynx)

		},

		setToken: function(token) {
			console.log('setting token')
			localStorage.setItem('calendar_token',token)
			$.getJSON(`/google/calendar/events?token=${token}`)
				.then((resp)=>console.log(resp))
		},

		initialize: function() {
			Backbone.history.start()
		}
	})

	new CalendarRouter
}

app()