import React from "react"
import STORE from "../store"
import ACTIONS from "../actions"
import User from "../models/userModel"
import UTILS from "../utils"
import MaterialSelect from './materialSelect'

const ScheduleApp = React.createClass({
	_bgClick: function() {
		STORE._set({
			showPopUp: false,
			showConfirm: false
		})
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
	render: function() {
		var popUpStyle = {
			visibility: this.state.showPopUp ? "visible" : "hidden",
			width: this.state.showTime ? "375px" : "200px",
			height: this.state.showConfirm ? "250px" : "100px"
		}
		var bgStyle = {
			visibility: this.state.showPopUp ? "visible" : "hidden"
		}
		return (
			<div className="schedule-app">
				<Header />
				<SchedulePopUp availability={this.state.availableTimes} 
							   showTime={this.state.showTime} 
							   showConfirm={this.state.showConfirm}
							   schedulingDetails={this.state.schedulingDetails} 
							   popUpStyle={popUpStyle} />
				<BodyContainer scheduleLimiter={this.state.scheduleLimiter} collection={this.state.taskCollection} />
				<div className="darken-bg" style={bgStyle} onClick={this._bgClick}></div>
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
							<button className="logout waves-effect waves-light green" onClick={ACTIONS.logoutUser}>Logout</button>
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
				return (<option value={new Date(time)}>
							{UTILS.formatTime(time)}
						</option>
				)
			})
			return formattedTimes
		}
		else {
			
			return []
		}
	},
	// _handleSelectDay: function() {
	// 	ACTIONS.fetchAvailability(STORE._get("schedulingDetails")["day"])
	// },
	_handleSelectTime: function(event) {
		var tasksToSchedule = ACTIONS.getTasksToBeScheduledString()
		var eventDetailsObj = {
			whatEvent: tasksToSchedule,
			whenEvent: event.target.value
		}
		ACTIONS.showConfirmDetails(eventDetailsObj)
	},
	_handleSubmitEvent: function(event) {
		event.preventDefault()
		ACTIONS.createEvent()
	},
	_showDetails: function() {
		if(this.props.showConfirm){
			var timeDetails = this.props.schedulingDetails
			return `Schedule tasks below on ${UTILS.formatDate(timeDetails["day"])} at ${UTILS.formatTime(timeDetails["time"])}?`
		}
	},
	render: function(){
		var timeStyle = {
			opacity: this.props.showTime ? "1" : "0"
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
							displayValues={UTILS.getNextWeek().map(val=>UTILS.formatDate(val))} 
							optionValues={UTILS.getNextWeek()}
							detailProp="day" 
							/>
					</div>
					<div className="time-select input-field" >
						<MaterialSelect
							showing={this.props.showTime}
							displayValues={this.props.availability.map(val=>UTILS.formatTime(val))} 
							optionValues={this.props.availability}
							detailProp="time"
							/>
					</div>
					<div className="confirm" style={confirmStyle} >
						<p className="details">{this._showDetails}</p>
					</div>
					<div className="schedule" style={confirmStyle}>
						<button>Schedule Tasks</button>
					</div>
				</form>
			</div>
		)
	}
})

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
		var tasksLength = ACTIONS.countTasksLength() > 30 ? 30 : ACTIONS.countTasksLength()
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
				<div className="delete-this">
					<form className="add-task hoverable" onSubmit={this._handleSubmit}>
						<input className="task-name" name="taskName"  placeholder="Task Name" required />
						<input className="task-length" name="taskLength" placeholder="Time" type="number" step="5" min="5" max="30"/>
						<button className="btn-floating waves-effect waves-light green"><i className="material-icons">add</i></button>
					</form>
				</div>
				<break></break>
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