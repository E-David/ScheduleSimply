import React from "react"
import STORE from "../store"
import ACTIONS from "../actions"
import User from "../models/userModel"

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

const ScheduleApp = React.createClass({
	_bgClick: function() {
		document.querySelector("#darken-bg").style.display = "none"
		document.querySelector(".schedule-pop-up").style.display = "none"
	},
	componentWillMount: function() {
		STORE.on("storeChange", ()=> {
			this.setState(STORE._getData())
		})
		ACTIONS.fetchTasks()
	},
	componentWillUnmount: function() {
		STORE.off("storeChange")
	},
	getInitialState: function() {
		return STORE._getData()
	},
	_handleSubmit: function(event){
		event.preventDefault()
		var userInputObj = {
			taskName: event.target.taskName.value,
			taskLength: event.target.taskLength.value,
		}
		ACTIONS.addTask(userInputObj)
		//clear input fields after sending data to ACTIONS
		event.target.taskName.value = ""
		event.target.taskLength.value = ""
	},
	render: function() {
		var allTasksLength = ACTIONS.countTasksLength()
		console.log(allTasksLength >= STORE._get("scheduleLimiter"))
		var bgStyle = {
			display: allTasksLength >= STORE._get("scheduleLimiter") ? "block" : "none"
		}
		return (
			<div className="schedule-app">
				<span>{`Welcome ${User.getCurrentUser().email}`}</span>
				<button className="logout" onClick={ACTIONS.logoutUser}>Logout</button>
				<form onSubmit={this._handleSubmit}>
					<input name="taskName"  placeholder="Enter task here" />
					<input type="number" min="0" max="30" name="taskLength" placeholder="Length" />
					<button>Add Task</button>
				</form>
				<SchedulePopUp />
				<TaskContainer collection={this.state.taskCollection} />
				<div id="darken-bg" style={bgStyle} onClick={this._bgClick}></div>
			</div>
		)
	}
})

const SchedulePopUp = React.createClass({
	_getAvailableTimes: function() {
		var times = STORE._get("availableTimes")
		if(times){
			var formattedTimes = times.map((time)=>{
				return (
						<button onClick={this._handleSubmitEvent} value={time} name="when">
							{this._formatTime(time)}
						</button>
				)
			})
			return formattedTimes
		}
	},
	_handleSelectDay: function(event) {
		ACTIONS.fetchAvailability(event.target.value)
	},
	_handleSubmitEvent: function(event) {
		event.preventDefault()
		var tasksToSchedule = ACTIONS.getTasksArray()
		var eventDetailsObj = {
			whatEvent: tasksToSchedule,
			whenEvent: event.target.value
		}
		ACTIONS.createEvent(eventDetailsObj)
	},
	_formatDate: function(date) {
		return `${DAYS[date.getDay()]}: ${date.getMonth() % 12 + 1}/${date.getDate()}`
	},
	_formatTime: function(time) {
		var hours = time.getHours() % 12
		var minutes = time.getMinutes()
		if(minutes === 0) minutes = minutes + "0"
		return `${hours}:${minutes}`
	},
	render: function(){
		var allTasksLength = ACTIONS.countTasksLength()
		var popUpStyle = {
			display: allTasksLength >= STORE._get("scheduleLimiter") ? "block" : "none"
		}
		var dateToJsx= (date, index) => {
			return (
				<div className="date-display" key={index} name="dayToSchedule">
					<button name="DAY" value={date} onClick={this._handleSelectDay}>{this._formatDate(date)}</button>
				</div>
			)
		}

		return (
			<div className="schedule-pop-up" style={popUpStyle}>
				<p>Schedule your block of tasks now</p>
				{ACTIONS.getDates().map(dateToJsx)}
				<div className="time-display">
					{this._getAvailableTimes()}
				</div>
			</div>
		)
	}
})

const TaskContainer = React.createClass({
	_handleScheduleNow: function(event) {
		event.preventDefault()
		document.querySelector("#darken-bg").style.display = "block"
		document.querySelector(".schedule-pop-up").style.display = "block"
	},
	render: function(){
		return (
			<div className="task-container">
				{this.props.collection.map(taskMod => <Task model={taskMod} key={taskMod.cid} />)}
				<button onClick={this._handleScheduleNow}>Schedule Now</button>
			</div>
		)
	}
})

const Task = React.createClass({
	_removeTask: function() {
		ACTIONS.removeTask(this.props.model)
	},
	render: function(){
		return (
			<div className="task">
				<span>{this.props.model.get("taskName")}</span>
				<span>{this.props.model.get("taskLength")}</span>
				{/*<p>{this.props.model.get("complete")}</p>*/}
				<button onClick={this._removeTask}>Remove Task</button>
			</div>
		)
	}
})
export default ScheduleApp