import React from "react"
import STORE from "../store"
import ACTIONS from "../actions"
import User from "../models/userModel"
import UTILS from "../utils"
import MaterialSelect from './materialSelect'

// import MaterializeFormsJS from "../../../node_modules/materialize-css/js/forms"

const ScheduleApp = React.createClass({
	_bgClick: function() {
		STORE._set("showPopUp",false)
	},
	componentWillMount: function() {
		STORE.on("storeChange", ()=> {
			this.setState(STORE._getData())
		})
		ACTIONS.fetchTasks()
		// $('select').material_select();
	},
	componentWillUnmount: function() {
		STORE.off("storeChange")
	},
	getInitialState: function() {
		return STORE._getData()
	},
	// _viewToRender: function(coll) {
	// 	var currentView = this.state.currentView
	// 	if(currentView === "Scheduled") {
	// 		return coll.filter(mod => mod.get('taskStatus') === "scheduled")
	// 	} else if(currentView === "Completed") {
	// 		return coll.filter(mod => mod.get('taskStatus') === "completed")
	// 	} else {
	// 		return coll.filter(mod => mod.get('taskStatus') === "unscheduled")
	// 	}
	// },
	render: function() {
		var popUpStyle = {
			visibility: this.state.showPopUp ? "visible" : "hidden"
		}
		// var tasksToRender = this._viewToRender(this.state.taskCollection)
		return (
			<div className="schedule-app">
				<Header />
				<SchedulePopUp availability={this.state.availableTimes} 
							   showTime={this.state.showTime} 
							   showConfirm={this.state.showConfirm}
							   schedulingDetails={this.state.schedulingDetails} 
							   popUpStyle={popUpStyle} />
				<BodyContainer scheduleLimiter={this.state.scheduleLimiter} collection={this.state.taskCollection} />
				{/*<Buttons currentTasks={this.state.currentTasks} />*/}
				{/*<TaskContainer collection={tasksToRender} />*/}
				<div className="darken-bg" style={popUpStyle} onClick={this._bgClick}></div>
			</div>
		)
	}
})

const Header = React.createClass({
	render: function() {
		return (
			<header>
				<div className="header-wrapper group">
					<p className="logo left">ScheduleMeNow</p>
					<div className="user-details right">
						<p>{`Signed in as: ${UTILS.getCurrentUser()}`}</p>
						<div className="logout">
							<span>Not you?</span>
							<button className="logout" onClick={ACTIONS.logoutUser}>Logout</button>
						</div>
					</div>
				</div>
			</header>
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
						UTILS.formatTime(time)
				)
			})
			console.log(formattedTimes)
			return formattedTimes
		}
		else {
			console.log('no times')
			return []
		}
	},
	_handleSelectDay: function(event) {
		ACTIONS.fetchAvailability(event.target.value)
	},
	_handleSelectTime: function(event) {
		var tasksToSchedule = ACTIONS.getTasksToBeScheduledString()
		var eventDetailsObj = {
			whatEvent: tasksToSchedule,
			whenEvent: event.target.value
		}
		ACTIONS.confirmDetails(eventDetailsObj)
	},
	_handleSubmitEvent: function(event) {
		event.preventDefault()
		ACTIONS.createEvent()
	},
	_showDetails: function() {
		if(this.props.schedulingDetails){
			var timeDetails = this.props.schedulingDetails["whenEvent"]
			return `Schedule tasks below on ${UTILS.formatDate(timeDetails)} at ${UTILS.formatTime(timeDetails)}?`
		}
	},
	render: function(){
		var timeStyle = {
			visibility: this.props.showTime ? "visible" : "hidden"
		}
		var confirmStyle = {
			visibility: this.props.showConfirm ? "visible" : "hidden"
		}
		return (
			<div className="schedule-pop-up" style={this.props.popUpStyle}>
				<form onSubmit={this._handleSubmitEvent}>
					<div className="date-select input-field">
						<MaterialSelect
							showing={true}
							optionValues={UTILS.getNextWeek()} 
							detailProp="day" />
	{/*						<select className="browser-default date-display" 
								name="dayToSchedule" 
								onChange={this._handleSelectDay}>
							{UTILS.getNextWeek().map(dateToJsx)}
						</select>*/}
					</div>
					<div className="time-select input-field" style={timeStyle}>
						<MaterialSelect
							showing={this.props.showTime}
							optionValues={this._getAvailableTimes()} 
							detailProp="time"
							 />
{/*						<select className="browser-default time-display" 
								name="when" 
								onChange={this._handleSelectTime} 
								style={timeStyle}>
							{this._getAvailableTimes()}
						</select> */}
					</div>
					<div className="confirm" style={confirmStyle} >
						<p>{this._showDetails}</p>
						<button>Schedule Tasks</button>
					</div>
				</form>
			</div>
		)
	}
})

// const Buttons = React.createClass({
// 	_handleTabClick: function(eventObj) {
// 		var tabClicked = eventObj.target.value
// 		ACTIONS.changeView(tabClicked)
// 	},
// 	render: function() {
// 		var nameToJSX = (buttonName, index) => {
// 			return <button 
// 					onClick={this._handleTabClick} 
// 					value={buttonName} 
// 					key={index}
// 					className={this.props.currentTasks === buttonName ? 'active' : ''} >
// 					{buttonName}
// 					</button>
// 		}
// 		return (
// 			<div className="buttons">
// 				{/* map an array of button names into an array of jsx buttons */}
// 				{["Unscheduled","Scheduled","Completed"].map(nameToJSX)}
// 			</div>
// 		)
// 	}
// })

const BodyContainer = React.createClass({
	render: function() {
		return (
			<div className="body-container">
				<Limiter maxLength={this.props.scheduleLimiter} />
				<TaskContainer collection={this.props.collection} />
			</div>
			)
	}
})

const Limiter = React.createClass({
	_handleScheduleNow: function() {
		STORE._set("showPopUp",true)
	},
	render: function() {
		var tasksLength = ACTIONS.countTasksLength()
		var limiterProgressStyle = {
			height: `${(tasksLength / this.props.maxLength) * 100}%`,
			width: `${(tasksLength / this.props.maxLength) * 100}%`,
			border: tasksLength > 0 ? "2px solid black" : "none"
		}
		return (
			<div className="limiter-container ">
				<p>Time Scheduled</p>
				<p>(press to schedule now)</p>
				<div className="limiter" onClick={this._handleScheduleNow}>
					<p>{tasksLength}</p>
					<div className="tasks-length" style={limiterProgressStyle}></div>
				</div>
			</div>
		)
	}
})

const TaskContainer = React.createClass({
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
	render: function(){
		return (
			<div className="task-container">
				<form className="add-task hoverable" onSubmit={this._handleSubmit}>
					<input className="task-name" name="taskName"  placeholder="Task Name" required />
					<input className="task-length" name="taskLength" type="number" step="5" min="5" max="30"/>
					<button className="btn-floating waves-effect waves-light green"><i className="material-icons">add</i></button>
				</form>
				<TaskList collection={this.props.collection}/>
			</div>
		)
	}
})

const TaskList = React.createClass({
	render: function(){
		return (
			<ul className="task-list collection">
				{this.props.collection.map(taskMod => <Task model={taskMod} key={taskMod.cid} />)}
			</ul>
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
			<li className="task collection-item">
				<p className="task-name">{this.props.model.get("taskName")}</p>
				<p className="task-length">{this.props.model.get("taskLength")}</p>
				<button className="remove btn-floating waves-effect waves-light red" onClick={this._removeTask}><i className="material-icons">clear</i></button>
			</li>
		)
	}
})
export default ScheduleApp