let Router = require('express').Router;
const apiRouter = Router()
let helpers = require('../config/helpers.js')

let User = require('../db/schema.js').User
let Task = require('../db/schema.js').Task

  
  apiRouter
    .get('/users', function(req, res){
      User.find(req.query , "-password", function(err, results){
        if(err) return res.json(err) 
        res.json(results)
      })
    })

  apiRouter
    .get('/users/:_id', function(req, res){
      User.findById(req.params._id, "-password", function(err, record){
        if(err || !record ) return res.json(err) 
        res.json(record)
      })
    })
    .put('/users/:_id', function(req, res){

      User.findByIdAndUpdate(req.params._id, req.body, function(err, record){
          if (err) {
            res.status(500).send(err)
          }
          else if (!record) {
            res.status(400).send('no record found with that id')
          }
          else {
            res.json(Object.assign({},req.body,record))
          }
      })
    })

    .delete('/users/:_id', function(req, res){
      User.remove({ _id: req.params._id}, (err) => {
        if(err) return res.json(err)
        res.json({
          msg: `record ${req.params._id} successfully deleted`,
          _id: req.params._id
        })
      })  
    })

    // Routes for a Model(resource) should have this structure
    apiRouter
      .get('/tasks', function(req,res){
        Task.find(req.query, function(err,results) {
          if (err) {
            res.status(500).send(err)
          }
          else {
            res.json(results)
          }
        })
      })
      .post('/tasks', function(req,res){
        var task = new Task(req.body)
        task.save(function(err) {
          if (err) {
            console.log(err)
            res.status(500).send(err)
          }
          else {
            res.json(task)
          }
        })
      })
      .put('/tasks/:_id', function(req, res){
        Task.findByIdAndUpdate(req.params._id, req.body, function(err, record){
              console.log(req.body)
              console.log('\n')
            if (err) {
              console.log(req.body)
              console.log('\n')
              console.log(err)
              res.status(500).send(err)
            }
            else if (!record) {
              res.status(400).send('no record found with that id')
            }
            else {
              res.json(req.body)
            }
        })
      })

module.exports = apiRouter