import Backbone from 'backbone'


export const TodoModel = Backbone.Model.extend({
	defaults: {
		status: 'incomplete'
	},
	idAttribute: '_id',
	urlRoot: '/api/tasks'
})

export const TodoCollection = Backbone.Collection.extend({
	model: TodoModel,
	url: '/api/tasks'
})
