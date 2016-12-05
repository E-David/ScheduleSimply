import STORE from "./store"
import {TaskCollection, TaskModel, scheduledEventsCollection} from "./models/dataModels"
import User from "./models/userModel"
import $ from 'jquery'

const ACTIONS = {
	//add task to STORE and save to database. Added model triggers "update" for STORE re-render
	addTask: function(userInputObj) {
		var mod = new TaskModel(userInputObj)
		mod.save()
			.done(() => {
				STORE._get("taskCollection").add(userInputObj)
				STORE._emitChange()
			})
			.fail((err) => {
				alert("Error when adding task")
				console.log(err)
			})
	},
	countTasksLength: function(){
		var coll = STORE._get("taskCollection")
		var allTaskLength = coll.models.reduce((accumulator,taskModel) => {
			return accumulator + taskModel.get("taskLength")
		},0)
		return allTaskLength
	},
	createEvent: function(eventObj) {
		console.log(eventObj)
		// $.getJSON(`/google/calendar/create?what=${eventObj["whatEvent"]}&when=${eventObj["whenEvent"]}&token=${localStorage.getItem('calendar_token')}`)
		// 	.then((resp)=>console.log(resp))
	},
	fetchAvailability: function(date) {
		var startDate = new Date(date).setHours(0,0,0,0)
	    var endDate = new Date(date).setHours(23,59,59,999)
	    var start = new Date(startDate).toISOString()
	    var end = new Date(endDate).toISOString()

	    console.log("START: ",new Date(startDate).toISOString())
	    console.log("END: ",new Date(endDate).toISOString())

	    STORE._get("scheduledEventsCollection").fetch({
	    	data: {
	    		start: start,
	    		end: end,
	    		token: localStorage.getItem('calendar_token')
	    	}
	    }).done((resp)=> {
	    	ACTIONS.getAvailableTimes()
	    	ACTIONS.getScheduledTimes()
	    })
	      .fail((err)=>console.log(err))
	},
	fetchTasks: function() {
		STORE._get('taskCollection').fetch()
			 .fail(()=> alert("Error fetching tasks"))
	},
	filterAvailableBlocks: function(array) {
		var allTimes = STORE._get("availableTimes")
		var busyTimes = array
		var filteredTimes = allTimes.filter((time)=> {
			for(var i = 0; i < array.length; i++){
				if(time.getMinutes()===array[i].getMinutes() &&
					time.getHours()===array[i].getHours()){
					return false
				} 
			}
			return true
		})
		console.log(STORE._get("availableTimes").length)
		STORE._set({
			availableTimes: filteredTimes
		})

		console.log(STORE._get("availableTimes").length)
	},
	getAvailableTimes: function() {
		var startDate = new Date(new Date().setHours(39,0,0,0))
		var endDate = new Date().setHours(20,0,0,0)
		STORE._set({
			availableTimes: this.getIncrements(startDate,endDate)
		})
	},
	//TODO: FIX problem where today isn't capture by getDates()
	getDates: function() {
	    var now = new Date(),
	        dateToGet = now,
	        weekArr = []
	    
	    for(var i = 0; i < 8; i ++){
	        var oldDate = dateToGet,
	        	rawNewDate = oldDate.setDate(oldDate.getDate() + 1)

	        weekArr.push(dateToGet)
	        dateToGet = new Date(rawNewDate)
	    }
	    return weekArr
	},
	getIncrements: function(start,end) {
	    var timeBlocksArr = []
	        function addMinutes(date, minutes) {
	        return new Date(date.getTime() + minutes*60000);
	    }
	    while(start.getHours() <= new Date(end).getHours()) {
	        timeBlocksArr.push(start)
	    	start = addMinutes(start,30)
	    }
	    return timeBlocksArr
	},
	getScheduledBlocks: function(scheduledEvent){
		console.log(getIncrements)
		
	},
	getScheduledTimes: function() {
		var scheduledColl = STORE._get("scheduledEventsCollection"),
			scheduledTimes = [],
			eventsArr = scheduledColl.models[0].attributes.items

			for(var i = 0; i < eventsArr.length; i++) {
				// scheduledTimes.push({
				// 	start: new Date(eventsArr[i].start.dateTime),
				// 	end: new Date(eventsArr[i].end.dateTime)
				// })
				scheduledTimes.push(new Date(eventsArr[i].start.dateTime))
				scheduledTimes.push(new Date(eventsArr[i].end.dateTime))
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
					alert(`Logged in as ${email}`)
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
					location.hash = "home"
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
	}
}
export default ACTIONS