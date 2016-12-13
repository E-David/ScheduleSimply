import STORE from "./store"
import {TaskCollection, TaskModel, scheduledEventsCollection} from "./models/dataModels"
import User from "./models/userModel"
import $ from 'jquery'
import UTILS from "./utils"
/*TODO FROM PRESENTATION:
add tasks, if it exceeds thirty, schedule everything but the last task
user preferences for when you are available
responsive web design
refresh token***
WHEN TO CHECK??
*/
const ACTIONS = {
	//add task to STORE and save to database. Added model triggers "update" for STORE re-render
	addTask: function(userInputObj) {
		//adds unique user id to task in order to show only user specific tasks
		userInputObj["userName"] = UTILS.getCurrentUser()

		var taskModel = new TaskModel(userInputObj)
		taskModel.save()
			.done((resp) => {
				STORE._get("taskCollection").add(taskModel)
				ACTIONS.countTasksToBeScheduled()
			})
			.fail((err) => {
				alert("Error when adding task")
				console.log(err)
			})
	},
	changeTasksToScheduled: function(date) {
		var  toBeScheduledArr = STORE._get("tasksToBeScheduled")

		for(var i = 0; i < toBeScheduledArr.length; i++){
			var taskModel = toBeScheduledArr[i]

			taskModel.set({
				taskStatus: "scheduled",
				scheduledDate: date
			})

			taskModel.save()
				 	 .fail((err)=>{
				 		alert("Error when updating task")
				 		console.log(err)
				 	  })
		}

		STORE._set({
			tasksToBeScheduled: []
		})
	},
	// changeView: function(viewName) {
	// 	STORE._set({
	// 		currentView: viewName
	// 	})
	// },
	// // checkIfOverLimiter: function() {
	// 	var taskCount = ACTIONS.countUnscheduledTasksLength(),
	// 		limiter = STORE._get("scheduleLimiter")

	// 	if (taskCount === limiter ){
	// 		STORE._set("showPopUp",true)
	// 	} else if (taskCount > limiter) {
	// 		ACTIONS.removeTaskOverflow()
	// 		STORE._set("showPopUp",true)
	// 	} else {
	// 		STORE._set("showPopUp",false)
	// 	}
	// 	console.log(ACTIONS.countUnscheduledTasksLength())
	// },
	confirmDetails: function(eventDetails) {
		console.log(eventDetails)
		STORE._set({
			schedulingDetails: eventDetails,
			showConfirm: true
		})
	},
	countTasksLength: function(){
		var coll = STORE._get("taskCollection")
		var tasksLength = coll.reduce((accumulator,taskModel) => {
			return accumulator + taskModel.get("taskLength")
		},0)
		return tasksLength
	},
	countTasksToBeScheduled: function() {
		var coll = STORE._get("taskCollection"),
			limiter = STORE._get("scheduleLimiter"),
			lengthIfTaskAdded = 0,
			toBeScheduledArr = []

		for(var i = 0; i < coll.models.length; i++){
			lengthIfTaskAdded += coll.models[i].get("taskLength")

			if(lengthIfTaskAdded > limiter) {
				return STORE._set({
					showPopUp: true,
					tasksToBeScheduled: toBeScheduledArr
				})
			} else if (lengthIfTaskAdded === limiter) {
				toBeScheduledArr.push(coll.models[i])
				return STORE._set({
					showPopUp: true,
					tasksToBeScheduled: toBeScheduledArr
				})
			} else {
				toBeScheduledArr.push(coll.models[i])
			}
		}
		STORE._set("tasksToBeScheduled",toBeScheduledArr)
	},
	createEvent: function() {
		var eventTime = STORE._get("schedulingDetails"),
			startTime = new Date(eventTime["whenEvent"]),
			endTime = UTILS.addMinutes(startTime,STORE._get("scheduleLimiter"))

		$.getJSON(`/google/calendar/create?what=${eventTime["whatEvent"]}&start=${startTime.toISOString()}&end=${endTime.toISOString()}&token=${localStorage.getItem('calendar_token')}`)
			.then(
				function() {
					alert(`Tasks scheduled on ${startTime.getMonth() % 12 + 1}/${startTime.getDate()}`)
					ACTIONS.changeTasksToScheduled()
				},
				function(err) {
					alert("Error scheduling event")
					console.log(err)
				}
			)
	},
	fetchAvailability: function(date) {
		var startOfDayRaw = new Date(date).setHours(0,0,0,0),
			startOfDay 	  = new Date(startOfDayRaw).toISOString(),
	    	endOfDayRaw   = new Date(date).setHours(23,59,59,999),
	    	endOfDay 	  = new Date(endOfDayRaw).toISOString()

	    STORE._get("scheduledEventsCollection").fetch({
	    	data: {
	    		start: startOfDay,
	    		end: endOfDay,
	    		token: localStorage.getItem('calendar_token')
	    	}
	    }).done((resp)=> {
	    	ACTIONS.getAvailableTimes(date)
	    	ACTIONS.getScheduledTimes()
	    	STORE._set("showTime",true)
	    })
	      .fail((err)=> {
	      	alert("Error retrieving tasks")
	      	console.log(err)
	    })
	},
	fetchTasks: function() {
		STORE._get('taskCollection').fetch({
			data: {
				userName: UTILS.getCurrentUser(),
				taskStatus: "unscheduled"
			}
		})	 .done(()=> ACTIONS.countTasksToBeScheduled())
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
	// filterUnscheduledTasks: function() {
	// 	var coll = STORE._get("taskCollection")
	// 	return coll.filter((mod) => mod.get("taskStatus") === "unscheduled")
	// },
	getAvailableTimes: function(date) {
		//Need to change this based on user preference
		var startDate = new Date(new Date(date).setHours(15,0,0,0))
		var endDate = new Date(date).setHours(20,0,0,0)
		STORE._set({
			availableTimes: UTILS.getThirtyMinIncrements(startDate,endDate)
		})
		console.log("TIMES",STORE._get("availableTimes"))
	},
	getScheduledTimes: function() {
		console.log(STORE._get("scheduledEventsCollection"))
		var scheduledColl = STORE._get("scheduledEventsCollection"),
			scheduledTimes = [],
			eventsArr = scheduledColl.models[0].get("items")

			for(var i = 0; i < eventsArr.length; i++) {
				scheduledTimes.push({
					start: new Date(eventsArr[i].start.dateTime),
					end: new Date(eventsArr[i].end.dateTime)
				})
			}
		return this.filterAvailableBlocks(scheduledTimes)
	},
	getTasksToBeScheduledString: function() {
		var toBeScheduledArr = STORE._get("tasksToBeScheduled"),
			taskArray = []

		for(var i = 0; i < toBeScheduledArr.length; i++) {
			var task = toBeScheduledArr[i].get("taskName")
			taskArray.push(task)
		}
		return taskArray.join(", ")
	},
	logoutUser: function() {
		localStorage.clear()
		location.hash = "login"
	},
	removeTask: function(taskModel) {
		taskModel.destroy()
				 .fail((err) => {
				 	alert("Error when removing task")
				 	console.log(err)
				 })
	},

	setDetail: function(prop,val) {
		var schedulingDetails = STORE._get('schedulingDetails')
		schedulingDetails[prop] = val
		STORE._set({
			schedulingDetails: schedulingDetails
		})
		ACTIONS.fetchAvailability(val)
	}
}
export default ACTIONS