import React from "react"
import STORE from "../store"
import ACTIONS from "../actions"
import User from "../models/userModel"
import UTILS from "../utils"
import $ from 'jquery'

const ScheduleApp = React.createClass({
	_bgClick: function() {
		STORE._set("showPopUp",false)
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
	_dropdownOptionsToRender: function() {
		var i = 0,
			optionsHtmlArr = []
		while(i <= this.state.scheduleLimiter){
			optionsHtmlArr.push(<option value={i} key={i}>{i}</option>)
			i += 5
		}
		return optionsHtmlArr
	},
	_viewToRender: function(coll) {
		var currentView = this.state.currentView
		if(currentView === "Scheduled") {
			return coll.filter(mod => mod.get('taskStatus') === "scheduled")
		} else if(currentView === "Completed") {
			return coll.filter(mod => mod.get('taskStatus') === "completed")
		} else {
			return coll.filter(mod => mod.get('taskStatus') === "unscheduled")
		}
	},
	render: function() {
		var popUpStyle = {
			visibility: this.state.showPopUp ? "visible" : "hidden"
		}
		var tasksToRender = this._viewToRender(this.state.taskCollection)
		return (
			<div className="schedule-app">
				<span>{`Welcome ${UTILS.getCurrentUser()}`}</span>
				<button className="logout" onClick={ACTIONS.logoutUser}>Logout</button>
				<form onSubmit={this._handleSubmit}>
					<input name="taskName"  placeholder="Enter task here" />
					<select name="taskLength" className="browser-default">
						{this._dropdownOptionsToRender()}
					</select>
					<button>Add Task</button>
				</form>
				<SchedulePopUp availability={this.state.availableTimes} style={popUpStyle} />
				<Buttons currentTasks={this.state.currentTasks} />
				<TaskContainer collection={tasksToRender} />
				<div id="darken-bg" style={popUpStyle} onClick={this._bgClick}></div>
			</div>
		)
	}
})

const SchedulePopUp = React.createClass({
	//Ask if this is okay. Another potential solution: render only if a day is selected
	//we don't want an empty select.
	_getAvailableTimes: function() {
		var times = this.props.availability
		if(times){
			var formattedTimes = times.map((time,index)=>{
				//IMPORTANT: it's blank when there are no times. FIX THIS
				return (
					<option value={time} key={index}>
						{UTILS.formatTime(time)}
					</option>
				)
			})
			return (
				<select className="browser-default time-display" name="when">
					{formattedTimes}
				</select>
				)
		}
	},
	_handleSelectDay: function(event) {
		ACTIONS.fetchAvailability(event.target.value)
	},
	_handleSubmitEvent: function(event) {
		event.preventDefault()

		var tasksToSchedule = ACTIONS.getTasksToScheduleString()
		var eventDetailsObj = {
			whatEvent: tasksToSchedule,
			whenEvent: event.target.when.value
		}
		ACTIONS.createEvent(eventDetailsObj)
	},
	render: function(){
		var dateToJsx= (date, index) => {
			return (
				<option className="date-display" 
						key={index}
						value={date}>
						{UTILS.formatDate(date)}
				</option>
			)
		}
		return (
			<div className="schedule-pop-up" style={this.props.style}>
				<p>Schedule your block of tasks now</p>
				<form onSubmit={this._handleSubmitEvent}>
					<select onChange={this._handleSelectDay} name="dayToSchedule" className="browser-default date-display">
						{UTILS.getNextWeek().map(dateToJsx)}
					</select>
						{this._getAvailableTimes()}
					<button>Schedule</button>
				</form>
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
		STORE._set("showPopUp",true)
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
	_removeTask: function(event) {
		event.preventDefault()
		ACTIONS.removeTask(this.props.model)
	},
	render: function(){
		return (
			<div className="task">
				<span>{this.props.model.get("taskName")}</span>
				<span>{this.props.model.get("taskLength")}</span>
				<button onClick={this._removeTask}>Remove Task</button>
			</div>
		)
	}
})
export default ScheduleApp