import React from "react"
import STORE from "../store"
import ACTIONS from "../actions"
import User from "../models/userModel"
import UTILS from "../utils"

console.log(UTILS.getCurrentUser())
const ScheduleApp = React.createClass({
	//refactor
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
	_viewToRender: function(coll) {
		var currentView = this.state.currentTasks
		if(currentView === "Scheduled") {
			return coll.filter(mod => mod.get('taskStatus') === "scheduled")
		} else if(currentView === "Completed") {
			return coll.filter(mod => mod.get('taskStatus') === "completed")
		} else {
			return coll.filter(mod => mod.get('taskStatus') === "unscheduled")
		}
	},
	render: function() {
		var allTasksLength = ACTIONS.countTasksLength()
		var bgStyle = {
			display: allTasksLength >= STORE._get("scheduleLimiter") ? "block" : "none"
		}
		var tasksToRender = this._viewToRender(this.state.taskCollection)

		return (
			<div className="schedule-app">
				<span>{`Welcome ${UTILS.getCurrentUser()}`}</span>
				<button className="logout" onClick={UTILS.logoutUser}>Logout</button>
				<form onSubmit={this._handleSubmit}>
					<input name="taskName"  placeholder="Enter task here" />
					<input type="number" min="0" max="30" name="taskLength" placeholder="Length" />
					<button>Add Task</button>
				</form>
				<SchedulePopUp />
				<Buttons currentTasks={this.state.currentTasks} />
				<TaskContainer collection={tasksToRender} />
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
						{UTILS._formatTime(time)}
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
	render: function(){
		var allTasksLength = ACTIONS.countTasksLength()
		var popUpStyle = {
			display: allTasksLength >= STORE._get("scheduleLimiter") ? "block" : "none"
		}
		var dateToJsx= (date, index) => {
			return (
				<div className="date-display" key={index} name="dayToSchedule">
					<button value={date} 
							onClick={this._handleSelectDay}>
							{UTILS.formatDate(date)}
					</button>
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

const Buttons = React.createClass({
	_handleTabClick: function(eventObj) {
		var tabClicked = eventObj.target.value
		ACTIONS.changeView(tabClicked)
	},
	render: function() {
		var nameToJSX = (buttonName, index) => {
			return <button 
					onClick={this._handleTabClick} 
					value={buttonName} 
					key={index}
					className={this.props.currentTasks === buttonName ? 'active' : ''} >
					{buttonName}
					</button>
		}
		return (
			<div className="buttons">
				{/* map an array of button names into an array of jsx buttons */}
				{["Unscheduled","Scheduled","Completed"].map(nameToJSX)}
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