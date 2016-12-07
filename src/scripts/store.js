import Backbone from "backbone"
import _ from "underscore"
import {TaskCollection, TaskModel, ScheduledEventsCollection} from "./models/dataModels"
import ACTIONS from "./actions"

const STORE = _.extend(Backbone.Events,{
	_data: {
		taskCollection: new TaskCollection(),
		scheduleLimiter: 30,
		scheduledEventsCollection: new ScheduledEventsCollection(),
		availableTimes: undefined,
		currentView: "Unscheduled"
	},
	_emitChange: function() {
		this.trigger("storeChange")
	},
	_getData: function() {
		return this._data
	},
	_get: function(prop) {
		return this._data[prop]
	},
	//when model is added/removed from collection, STORE causes re-render
	_initialize: function() {
		this._get("taskCollection").on("update sync", ()=> {
			this._emitChange()
		})
	},
	_set: function(input1,value){
		//allows programmer to add STORE data using an obj or key/value pair
		if(typeof input1 === "object") {
			var objToAdd = input1
			this._data = _.extend(this._data,objToAdd)
		} else {
			var key = input1
			this._data[key] = value
		}
		this._emitChange()
	}
})

STORE._initialize()
export default STORE