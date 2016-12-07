import Backbone from "backbone"

export const TaskModel =  Backbone.Model.extend({
	urlRoot: "/api/tasks",
	idAttribute: "_id",
	defaults: {
		taskStatus: "unscheduled"
	}
})

export const TaskCollection = Backbone.Collection.extend({
	url: "/api/tasks",
	model: TaskModel
})

export const ScheduledEventsCollection = Backbone.Collection.extend({
	url: "/google/calendar/events"
})