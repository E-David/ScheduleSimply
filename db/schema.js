const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ----------------------
// USERS
// ----------------------
const usersSchema = new Schema({
  // required for authentication: DO NOT TOUCH Or You May Get Punched
  email:     { type: String, required: true },
  password:  { type: String, required: true },
  // x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x
  
   // example of optional fields
  name:      { type: String },
  createdAt: { type: Date, default: Date.now }

})

const taskSchema = new Schema({
	title: {type: String, required: true },
	status: {type: String, required: true, default: 'incomplete'}
})

module.exports = {
  User: mongoose.model('User', usersSchema),
  Task: mongoose.model('Task', taskSchema)
}
