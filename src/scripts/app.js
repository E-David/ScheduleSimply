import React from 'react'
import ReactDOM from 'react-dom'
import TodoApp from './views/todoApp'
import $ from 'jquery'


const app = function() {
	const googleURL = 'https://accounts.google.com/o/oauth2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.me%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar&response_type=code&client_id=1036212817160-8v3ob7jeto9epb626iore5ided8q5fcr.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost.com%3A3000%2Fgoogle%2Fcalendar%2Fcode'
	const qs = function(sel) {
		return document.querySelector(sel)
	}

	qs(".container").innerHTML = 
		`<a href="${googleURL}">		
			<button>please work</button>
		</a>`
	// qs('button').addEventListener('click',function() {
	// 	$.getJSON('/google/calendar').then((resp)=>console.log(resp))
	// })
}

app()