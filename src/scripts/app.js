import React from 'react'
import ReactDOM from 'react-dom'
import Backbone from 'backbone'
import init from './init'
import ScheduleApp from "./views/scheduleApp"
import LoginView from "./views/loginView"
import UTILS from "./utils"
import $ from "jquery"

const app = function() {

	const Router = Backbone.Router.extend({
		routes: {
			"home": "handleHome",
			'googleAccess/:token': 'setToken',
			'login': 'handleLogin',
			"*default": "redirect"
		},
		handleHome: function() {
			ReactDOM.render(<ScheduleApp />, document.querySelector('.container'))
		},
		handleLogin: function() {
			ReactDOM.render(<LoginView />, document.querySelector('.container'))
		},

		setToken: function(token) {
			localStorage.setItem('calendar_token',token)
			$.getJSON(`/google/calendar/events?token=${token}`)
				.then((resp)=>{
						var userName = resp.summary
						localStorage.setItem('userName',userName)
						location.hash = "home"
					}
				)
		},
		redirect: function(){
			location.hash = "home"
		},
		initialize: function(){
			Backbone.history.start()
			if(!UTILS.getCurrentUser()){
				location.hash = "login"
			}
		}
	})
  new Router()
}

// x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..
// NECESSARY FOR USER FUNCTIONALITY. DO NOT CHANGE. 
export const app_name = init()
app()
// x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..