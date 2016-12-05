import React from "react"
import STORE from "../store"
import ACTIONS from "../actions"
import User from "../models/userModel"

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

const ScheduleApp = React.createClass({
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
	_bgClick: function(){
		document.getElementById("darken-bg").style.zIndex = "-2"
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
		var bgStyle = {
			opacity: allTasksLength >= STORE._get("scheduleLimiter") ? "0.5" : "0"
		}
		return (
			<div className="schedule-app">
				<span>{`Welcome ${User.getCurrentUser().email}`}</span>
				<form onSubmit={this._handleSubmit}>
					<input name="taskName" min="0" max="24" placeholder="Enter task here" />
					<input type="number" name="taskLength" />
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
				return <li>{this._formatTime(time)}</li>
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
		console.log(tasksToSchedule)
		var eventDetailsObj = {
			whatEvent: tasksToSchedule,
			whenEvent: event.target.when.value
		}
		ACTIONS.createEvent(eventDetailsObj)
	},
	_formatDate: function(date) {
		return `${DAYS[date.getDay()]}: ${date.getMonth() % 12 + 1}/${date.getDate()}`
	},
	_formatTime: function(time) {
		var hours = time.getHours()
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
				<p>Schedule your 30 min block of tasks now</p>
				{ACTIONS.getDates().map(dateToJsx)}
				<ul>
					{this._getAvailableTimes}
				</ul>
			</div>
		)
	}
})

const TaskContainer = React.createClass({
	render: function(){
		return (
			<div className="task-container">
				{this.props.collection.map(taskMod => <Task model={taskMod} key={taskMod.cid} />)}
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