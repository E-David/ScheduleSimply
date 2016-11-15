import React from 'react'
import STORE from '../store'
import ACTIONS from '../actions'


const TodoApp = React.createClass({

	componentWillMount: function() {
		STORE.on('storeChanged',()=>{
			this.setState(STORE._getData())
		})
		ACTIONS.fetchTasks()
	},

	getInitialState: function() {
		return STORE._getData()
	},

	 render: function() {
	 	var tasksToRender = this.state.todoCollection
	 	if (this.state.currentTasks === 'complete') {
	 		tasksToRender = tasksToRender.filter(mod => mod.get('status') === 'complete')
	 	}
	 	if (this.state.currentTasks === 'incomplete') {
	 		// var isComplete = function(mod) {
	 		// 	if (mod.get('status') === 'complete') {
	 		// 		return true
	 		// 	}
	 		// 	if (mod.get('status') === 'incomplete') {
	 		// 		return false
	 		// 	}
	 		// }
	 		// tasksToRender = tasksToRender.filter(isComplete)
	 		tasksToRender = tasksToRender.filter(mod => mod.get('status') === 'incomplete')
	 	}
	 	return (
	 		<div className={'todo-app'} >
	 			<Buttons currentTasks={this.state.currentTasks} />
	 			<TodoList collection={tasksToRender} />
	 		</div>
	 	)
 	}
})

const Buttons = React.createClass({
	_handleTabClick: function(eventObj) {
		var buttonThatWasClicked = eventObj.target.value
		ACTIONS.changeView(buttonThatWasClicked)
	},

	render: function() {

		var nameToJSX = (buttonName, index) => {
			return <button 
					onClick={this._handleTabClick} 
					value={buttonName} 
					key={index}
					className={this.props.currentTasks === buttonName ? 'active' : ''} >
					{buttonName}
					</button>
		}
		return (
			<div className="buttons">
				{/* map an array of button names into an array of jsx buttons */}
				{["all","complete","incomplete"].map(nameToJSX)}
			</div>
			)
	}
})

const TodoList = React.createClass({
	_inputHandler: function(eventObj) {
		var keyPressed = eventObj.keyCode,
			inputNode = eventObj.target,
			taskName = inputNode.value

		if (keyPressed === 13 && taskName !== '') {
			ACTIONS.createTask(taskName)
			inputNode.value = ''
		}
	},

	_makeTodoItem: function(todoModel) {
		return <TodoItem model={todoModel} key={todoModel.cid} />
	},

	 render: function() {
	 	var coll = this.props.collection
	 	return (
	 		<div className='todo-list' >
	 			<input onKeyDown={this._inputHandler} />
	 			<ul>
	 				{coll.map(this._makeTodoItem)}
	 			</ul>
	 		</div>
	 	)
 	}
})

const TodoItem = React.createClass({

	_toggleTaskStatus: function(eventObj) {
		ACTIONS.toggleComplete(this.props.model.cid)
	},

	render: function() {
		var checkboxValue = this.props.model.get('status') === 'complete' ? '✓' : ' '
		return (
			<li>
				<span className='text'>{this.props.model.get('title')}</span>
				<span className='checkbox' onClick={this._toggleTaskStatus}>
				 {checkboxValue}
				</span>
			</li>
			)
	}
})

export default TodoApp
