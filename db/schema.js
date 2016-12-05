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
  taskName:     { type: String, required: true },
  taskLength:   { type: Number, required: true },
  complete:     { type: Boolean, default: false }
})

module.exports = {
  User: mongoose.model('User', usersSchema),
  Task: mongoose.model("Task", tasksSchema)
}
