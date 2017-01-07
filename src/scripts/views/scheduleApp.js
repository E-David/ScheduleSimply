import React from "react"
import STORE from "../store"
import ACTIONS from "../actions"
import User from "../models/userModel"
import UTILS from "../utils"
import MaterialSelect from './materialSelect'
import toastr from "toastr"

const ScheduleApp = React.createClass({
	_bgClick: function() {
		STORE._set({
			showPopUp: false,
			showConfirm: false,
			showTime: false
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
			width: this.state.showTime ? "320px" : "180px",
			height: this.state.showConfirm ? "240px" : "120px"
		}
		var popUpShowClass = this.state.showPopUp ? "make-visible" : "make-hidden"
		var bgShowClass = this.state.showPopUp ? "make-visible" : "make-hidden"
		return (
			<div className="schedule-app">
				<Header />
				<SchedulePopUp availability={this.state.availableTimes} 
							   showPopUp={this.state.showPopUp}
							   showTime={this.state.showTime} 
							   showConfirm={this.state.showConfirm}
							   schedulingDetails={this.state.schedulingDetails} 
							   popUpStyle={popUpStyle} 
							   showClass={popUpShowClass} />
				<BodyContainer scheduleLimiter={this.state.scheduleLimiter} collection={this.state.taskCollection} />
				<div className={`darken-bg ${bgShowClass}`} onClick={this._bgClick}></div>
			</div>
		)
	}
})

const Header = React.createClass({
	render: function() {
		return (
			<header>
				<div className="header-wrapper group">
					<h2 className="logo">ScheduleSimply</h2>
					<div className="user-details">
						<h6>{`Signed in as ${UTILS.getCurrentUser()}`}</h6>
						<div className="logout">
							<span>Not you?</span>
							<span className="logout-button" onClick={ACTIONS.logoutUser}>Logout</span>
						</div>
					</div>
				</div>
			</header>
		)
	}
})

const SchedulePopUp = React.createClass({
	_handleSubmitEvent: function(event) {
		event.preventDefault()
		ACTIONS.createEvent()
	},
	_showDetails: function() {
		if(this.props.showConfirm){
			var details = new Date(this.props.schedulingDetails["time"])
			return `Schedule tasks below on ${UTILS.formatDate(details)} at ${UTILS.formatTime(details)}?`
		}
	},
	render: function(){
		var timeStyle = {
			opacity: this.props.showTime ? "1" : "0"
		}
		var confirmStyle = {
			opacity: this.props.showConfirm ? "1" : "0"
		}
		var transitionClass = this.props.showPopUp ? "slow-appear" : "fast-disappear"
		return (
			<div className={`schedule-pop-up ${this.props.showClass}`} style={this.props.popUpStyle}>
				<div className="pop-instructions center-align">
				</div>
				<form onSubmit={this._handleSubmitEvent}>
					<div className="date-select input-field">
						<p className="left left-align">Schedule a day</p>
						<MaterialSelect
							showing={true}
							displayValues={UTILS.getNextWeek().map(val=>UTILS.formatDate(val))} 
							optionValues={UTILS.getNextWeek()}
							detailProp="day" 
							/>
					</div>
					<div className={`time-select input-field ${transitionClass}`}  style={timeStyle} >
						<p className="right right-align">Schedule a time</p>
						<MaterialSelect
							showing={this.props.showTime}
							displayValues={this.props.availability.map(val=>UTILS.formatTime(val))} 
							optionValues={this.props.availability}
							detailProp="time"
							/>
					</div>
					<div className={`confirm ${transitionClass}`} style={confirmStyle}>
						<p>{this._showDetails()}</p>
					</div>
					<div className={`schedule ${transitionClass}`} style={confirmStyle}>
						<button className="btn waves-effect waves-light">Schedule Tasks</button>
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
		if(ACTIONS.countTasksLength() > 0) {
			STORE._set("showPopUp",true)
		}  else {
			toastr.error("Add a task below before scheduling")
		}
	},
	render: function() {
		var tasksLength = ACTIONS.countTasksLength() > 30 ? 30 : ACTIONS.countTasksLength()
		var limiterProgressStyle = {
			height: `${(tasksLength / this.props.maxLength) * 100}%`,
			width: `${(tasksLength / this.props.maxLength) * 100}%`,
			border: tasksLength > 0 ? "3px solid lighten(#3f51b5,30)" : "none"
		}
		return (
			<div className="limiter-container">
				<div className="instructions">
					<p>Time Scheduled</p>
					<p>(press to schedule now)</p>
				</div>
				<div className="limiter hoverable" onClick={this._handleScheduleNow}>
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
			<div className="task-container z-depth-4">
				<div className="add-task-form">
					<form className="add-task" onSubmit={this._handleSubmit}>
						<input className="task-name" name="taskName" placeholder="Task Name" required />
						<input className="task-length" name="taskLength" placeholder="Mins" type="number" step="5" min="5" max="30" required/>
						<button className="add btn-floating waves-effect waves-light"><i className="material-icons">add</i></button>
					</form>
				</div>
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
				<button className="remove btn-floating waves-effect waves-light" onClick={this._removeTask}><i className="material-icons">clear</i></button>
			</li>
		)
	}
})
export default ScheduleApp