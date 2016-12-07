import STORE from "./store"
import {TaskCollection, TaskModel, scheduledEventsCollection} from "./models/dataModels"
import User from "./models/userModel"
import $ from 'jquery'
import UTILS from "./utils"
/*TODO FROM PRESENTATION:
drop down for task length in 5 minute increments
add tasks, if it exceeds thirty, schedule everything but the last task
user preferences for when you are available
date-display: drop down
time-display renders, drop down
responsive web design
potential old model; MAKE SURE IT DELETES
refresh token***
splash page over login view, give some details about the app
no users, everything is tied o data you get back from gmail

*/
const ACTIONS = {
	//add task to STORE and save to database. Added model triggers "update" for STORE re-render
	addTask: function(userInputObj) {
		//adds unique user id to task in order to show only user specific tasks
		userInputObj["userId"] = User.getCurrentUser()._id

		var mod = new TaskModel(userInputObj)
		mod.save()
			.done(() => {
				STORE._get("taskCollection").add(userInputObj)
			})
			.fail((err) => {
				alert("Error when adding task")
				console.log(err)
			})
	},
	changeView: function(viewName) {
		STORE._set({
			currentTasks: viewName
		})
	},
	checkIfOverLimiter: function(newTaskLength) {
		return ACTIONS.countTasksLength() + parseInt(newTaskLength) > STORE._get("scheduleLimiter")
	},
	countTasksLength: function(){
		var coll = STORE._get("taskCollection")
		var allTaskLength = coll.models.reduce((accumulator,taskModel) => {
			return accumulator + parseInt(taskModel.get("taskLength"))
		},0)
		return allTaskLength
	},
	createEvent: function(eventTime) {
		var startTime = new Date(eventTime["whenEvent"])
		var endTime = UTILS.addMinutes(startTime,ACTIONS.countTasksLength())

		$.getJSON(`/google/calendar/create?what=${eventTime["whatEvent"]}&start=${startTime.toISOString()}&end=${endTime.toISOString()}&token=${localStorage.getItem('calendar_token')}`)
			.then(
				function() {
					alert(`Tasks scheduled on ${startTime.getMonth() % 12 + 1}/${startTime.getDate()}`)
					ACTIONS.toggleScheduledStatus()
				},
				function(err) {
					alert("Error scheduling event")
					console.log(err)
				}
			)
	},
	fetchAvailability: function(date) {
		var startDate = new Date(date).setHours(0,0,0,0)
	    var endDate = new Date(date).setHours(23,59,59,999)
	    var start = new Date(startDate).toISOString()
	    var end = new Date(endDate).toISOString()

	    STORE._get("scheduledEventsCollection").fetch({
	    	data: {
	    		start: start,
	    		end: end,
	    		token: localStorage.getItem('calendar_token')
	    	}
	    }).done((resp)=> {
	    	ACTIONS.getAvailableTimes(date)
	    	ACTIONS.getScheduledTimes()
	    })
	      .fail((err)=>console.log(err))
	},
	fetchTasks: function() {
		STORE._get('taskCollection').fetch({
			data: {
				userId: User.getCurrentUser()._id
			}
		})	 .done(()=> console.log(STORE._get('taskCollection')))
			 .fail(()=> alert("Error fetching tasks"))
	},
	//TODO: change this so you have the option to schedule up to start/end time.
	//Ex: you have something at 7. You should be able to schedule something from 6:30-7
	filterAvailableBlocks: function(scheduledEvents) {
		var allTimes = STORE._get("availableTimes")
		var scheduledTimes = scheduledEvents
		var filteredTimes = allTimes.filter((time)=> {
			for(var i = 0; i < scheduledTimes.length; i++){
				if (time >= scheduledTimes[i].start && 
					time <= scheduledTimes[i].end ||
					time < new Date()){
					return false
				} 
			}
			return true
		})
		STORE._set({
			availableTimes: filteredTimes
		})
	},
	getAvailableTimes: function(date) {
		//Need to change this based on user preference
		var startDate = new Date(new Date(date).setHours(15,0,0,0))
		var endDate = new Date(date).setHours(20,0,0,0)
		STORE._set({
			availableTimes: this.getIncrements(startDate,endDate)
		})
	},
	getDates: function() {
	    var dateToGet = new Date(),
	        weekArr = []

	    for(var i = 0; i < 8; i ++){
	    	//pushes copy of date Object, since the copy is not changed when setDate is used
	        weekArr.push(new Date(dateToGet))
	        dateToGet = new Date(dateToGet.setDate(dateToGet.getDate() + 1))
	    }
	    return weekArr
	},
	getIncrements: function(start,end) {
	    var timeBlocksArr = []
	    //TODO: move to utils
	    while(start.getHours() <= new Date(end).getHours()) {
	        timeBlocksArr.push(start)
	    	start = UTILS.addMinutes(start,30)
	    }
	    return timeBlocksArr
	},
	getScheduledTimes: function() {
		var scheduledColl = STORE._get("scheduledEventsCollection"),
			scheduledTimes = [],
			eventsArr = scheduledColl.models[0].attributes.items

			for(var i = 0; i < eventsArr.length; i++) {
				scheduledTimes.push({
					start: new Date(eventsArr[i].start.dateTime),
					end: new Date(eventsArr[i].end.dateTime)
				})
			}
		return this.filterAvailableBlocks(scheduledTimes)
	},
	getTasksArray: function() {
		var coll = STORE._get("taskCollection"),
			taskArray = []

		for(var i = 0; i < coll.models.length; i++) {
			var task = coll.models[i].get("taskName")
			taskArray.push(task)
		}
		return taskArray.join(", ")
	},
	loginUser: function(email,password) {
		const authUrl = "https://accounts.google.com/o/oauth2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar&access_type=offline&response_type=code&client_id=587179870005-4t54t2sn7peb3nf6rcpa6q92ottds8kq.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fgoogle%2Fcalendar%2Fcode"
		User.login(email,password)
			.then(
				function(resp){
					console.log(resp)
					window.location.replace(authUrl)
				},
				function(err){
					console.log(err)
					alert("An error occurred while logging in")
				}
			)
	},
	logoutUser: function() {
		User.logout()
			.then(
				function(){
					alert("You have successfully logged out")
					location.hash = "login"
					STORE._emitChange()
				},
				function(){
					alert("An error occurred while logging out")
				}
			)
	},
	registerUser: function(userInputObj) {
		User.register(userInputObj)
			.then(
				function(){
					alert(`${userInputObj.email} has successfully registered`)
					ACTIONS.loginUser(userInputObj.email,userInputObj.password)
				},
				function(err){
					console.log(err)
					alert("An error occured while registering")
				}
			)
	},
	removeTask: function(taskModel) {
		taskModel.destroy()
				 .then(
				 	function(){
				 		alert("Task removed")
				 	},
				 	function(err){
				 		alert("Error when removing task")
				 		console.log(err)
				 	}
				 )
	},
	toggleScheduledStatus: function() {
		var coll = STORE._get("taskCollection")
		coll.models.map((mod)=>mod.attributes.scheduled = true)
		STORE._set({
			coll: "taskCollection"
		})
	}
}
export default ACTIONS