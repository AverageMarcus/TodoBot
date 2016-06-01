"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema({
  id: Number,
  message: String
});
const userSchema = new Schema({
  key: String,
  todos: [todoSchema],
  itemIndex: {type: Number, default: 0}
});

module.exports = {
  addTodo: function(key, message) {

  },
  getTodos: function(key) {

  },
  completeTodo: function(key, todoId) {

  },
  removeTodo: function(key, todoId) {

  }
};