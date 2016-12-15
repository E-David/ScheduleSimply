import STORE from "./store"
import {TaskCollection, TaskModel, ScheduledEventsCollection} from "./models/dataModels"
import User from "./models/userModel"
import $ from 'jquery'
import UTILS from "./utils"
import toastr from "toastr"
/*TODO FROM PRESENTATION:
add tasks, if it exceeds thirty, schedule everything but the last task
user preferences for when you are available
responsive web design
refresh token***
WHEN TO CHECK??
feedback for what you're doing now
when presenting, say what happens once you've added something to google
popup if you try to add something. Field does't empty, but pop up asks if you want to schedule now
more than 30
prepare for worst case scnario
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
				toastr.error("Error when adding task")
				
			})
	},
	//Once event is scheduled, save task status and when it was scheduled, then reset app:
	// 1. set pop up state to false 2. reset tasksToBeScheduled 3. remove collection from tasks
	// scheduled
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
				 		toastr.error("Error when updating task")
				 		
				 	  })
		}

		STORE._set({
			tasksToBeScheduled: [],
			showConfirm: false,
			showTime: false,
			showPopUp: false
		})

	},
	countTasksLength: function(){
		var coll = STORE._get("taskCollection")
		var tasksLength = coll.reduce((accumulator,taskModel) => {
			return accumulator + taskModel.get("taskLength")
		},0)
		return tasksLength
	},
	// with limiter and task Collection, check if the newest task will exceed limiter
	// If not, add task to be scheduled. If not but equals limiter, go ahead and have user
	// schedule the task (show pop up). If yes, don't add newest task, have pop up show up
	countTasksToBeScheduled: function() {
		var coll = STORE._get("taskCollection"),
			limiter = STORE._get("scheduleLimiter"),
			lengthIfTaskAdded = 0,
			toBeScheduledArr = [],
			propsToUpdate = {}

		for(var i = 0; i < coll.models.length; i++){
			lengthIfTaskAdded += coll.models[i].get("taskLength")

			if(lengthIfTaskAdded > limiter) {
				propsToUpdate["showPopUp"] = true
			} else if (lengthIfTaskAdded === limiter) {
				toBeScheduledArr.push(coll.models[i])
				propsToUpdate["showPopUp"] = true
			} else {
				toBeScheduledArr.push(coll.models[i])
			}
		}
		propsToUpdate["tasksToBeScheduled"] = toBeScheduledArr
		STORE._set(propsToUpdate)
	},
	createEvent: function() {
		var whatEvent = this.getTasksToBeScheduledString(),
			whenEvent = STORE._get("schedulingDetails"),
			startTime = new Date(whenEvent["time"]),
			endTime = UTILS.addMinutes(startTime,STORE._get("scheduleLimiter"))

		$.getJSON(`/google/calendar/create?what=${whatEvent}&start=${startTime.toISOString()}&end=${endTime.toISOString()}&token=${localStorage.getItem('calendar_token')}`)
			.then(
				function() {
					toastr.success(`Tasks scheduled on ${startTime.getMonth() % 12 + 1}/${startTime.getDate()} at ${UTILS.formatTime(startTime)}`)
					ACTIONS.changeTasksToScheduled()
				},
				function(err) {
					toastr.error("Error scheduling event")
					
				}
			)
	},
	fetchAvailability: function(date) {
		var startOfDayRaw = new Date(date).setHours(0,0,0,0),
			startOfDay 	  = new Date(startOfDayRaw).toISOString(),
	    	endOfDayRaw   = new Date(date).setHours(23,59,59,999),
	    	endOfDay 	  = new Date(endOfDayRaw).toISOString()

	    var schEvColl = new ScheduledEventsCollection()
	    schEvColl.fetch({
	    	data: {
	    		start: startOfDay,
	    		end: endOfDay,
	    		token: localStorage.getItem('calendar_token')
	    	}
	    }).done((resp)=> {
	    	// pass date and response of occupied times and filter for available time blocks
	    	var openTimes = ACTIONS.getOpenTimeBlocks(date,resp)
	    	STORE._set({
	    		showTime: true,
	    		availableTimes: openTimes
	    	})
	    })
	      .fail((err)=> {
	      	toastr.error("Error retrieving tasks")
	      	
	    })
	},
	fetchTasks: function() {
		STORE._get('taskCollection').fetch({
			data: {
				userName: UTILS.getCurrentUser(),
				taskStatus: "unscheduled"
			}
		})	 .done(()=> ACTIONS.countTasksToBeScheduled())
			 .fail(()=> toastr.error("Error fetching tasks"))
	},
	//TODO: change this so you have the option to schedule up to start/end time.
	//Ex: you have something at 7. You should be able to schedule something from 6:30-7
	filterAvailableBlocks: function(dateToSchedule,scheduledTimes) {
		var potentialTimes = ACTIONS.getPotentialTimes(dateToSchedule)
		var filteredTimes = potentialTimes.filter((time)=> {
			if (time < new Date()){
				return false
			} else {
				for(var i = 0; i < scheduledTimes.length; i++){
					if(time >= scheduledTimes[i].start && time <= scheduledTimes[i].end){
						return false
					} 
				}
			}
			return true
		})
		return filteredTimes
	},
	getOpenTimeBlocks: function(dateToSchedule,occupiedTimes) {
		var scheduledTimes = [],
			occupiedTimesArr = occupiedTimes.items

			for(var i = 0; i < occupiedTimesArr.length; i++) {
				scheduledTimes.push({
					start: new Date(occupiedTimesArr[i].start.dateTime),
					end: new Date(occupiedTimesArr[i].end.dateTime)
				})
			}
		return this.filterAvailableBlocks(dateToSchedule,scheduledTimes)
	},
	//Get thirty min increments from when you set startDate to when you set endDate
	getPotentialTimes: function(date) {
		//Need to change this based on user preference
		var startDate = new Date(new Date(date).setHours(0,0,0,0))
		var endDate = new Date(date).setHours(14,0,0,0)
		return UTILS.getThirtyMinIncrements(startDate,endDate)
	},
	// string used to add to calendar
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
				 	toastr.error("Error when removing task")
				 	
				 })
	},
	setDetail: function(prop,val) {
		var schedulingDetails = STORE._get('schedulingDetails')
		if(!schedulingDetails.hasOwnProperty(prop) && val !== schedulingDetails["day"])
			schedulingDetails[prop] = val
	},
	showDetails: function(val){
		if(val !== STORE._get("schedulingDetails")["day"]) {
			STORE._set("showConfirm",true)
		}
	}

}
export default ACTIONS