import React from "react"
import ACTIONS from "../actions"

const EventCreateView = React.createClass({

	render: function(){
		return (
			<div className="event-create-view">
				<form onSubmit={this._handleSubmitEvent}>
					<input name="what" placeholder="event name" />
					<input name="when" type="datetime-local" />
					<button type="submit">submit</button>
				</form>
			</div>
		)
	}
})

export default EventCreateView