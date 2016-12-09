const mongoose = require('mongoose');

// ----------------------
// USERS
// ----------------------
const usersSchema = new mongoose.Schema({
  // required for authentication: DO NOT TOUCH Or You May Get Punched
  email:     { type: String, required: true },
  password:  { type: String, required: true },
  // x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x
  
   // example of optional fields
  name:      { type: String },
  createdAt: { type: Date, default: Date.now }

})

const tasksSchema = new mongoose.Schema({
  userName:     { type: String, required: true },
  taskName:     { type: String, required: true },
  taskLength:   { type: Number, required: true },
  taskStatus:   { type: String },
  scheduledDate:{ type: Date },
  createdAt:    { type: Date, default: Date.now }
})

module.exports = {
  User: mongoose.model('User', usersSchema),
  Task: mongoose.model("Task", tasksSchema)
}
