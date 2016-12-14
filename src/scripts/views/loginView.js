import React from "react"
import ACTIONS from "../actions"

const LoginView = React.createClass({
	authUrl: "https://accounts.google.com/o/oauth2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar&access_type=offline&response_type=code&client_id=587179870005-4t54t2sn7peb3nf6rcpa6q92ottds8kq.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fgoogle%2Fcalendar%2Fcode",
	_googleAuth: function(event) {
		event.preventDefault()
		window.location.replace(this.authUrl)
	},
	render: function() {
		return (
			<div className="login-view">
				<div className="delete">
					<h1>Schedule Me Now</h1>
					<h3>Immediate scheduling made simple.</h3>
					<button className="waves-effect waves-light green" onClick={this._googleAuth}>Google Login</button>
				</div>
			</div>
		)
	}
})

export default LoginView