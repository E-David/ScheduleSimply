import Backbone from 'backbone'
import _ from 'underscore'
import {TodoCollection,TodoModel} from './models'

const STORE = _.extend(Backbone.Events,{
	_data: {
		todoCollection: new TodoCollection(),
		currentTasks: 'all' // all || complete || incomplete
	},

	_emitChange: function() {
		this.trigger('storeChanged')
	},

	_get: function(prop) {
		return this._data[prop]
	},

	_getData: function() {
		return this._data
	},

	_initialize: function() {
		this._get('todoCollection').on('all',()=>{
			this._emitChange()
		})
	},

	_set: function(newData) {
		this._data = _.extend(this._data,newData)
		this._emitChange()
	}
})

STORE._initialize()

export default STORE