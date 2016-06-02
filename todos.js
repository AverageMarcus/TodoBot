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

// MVP
let db = {};

function ensureKeyExists(key) {
  if(!db.hasOwnProperty(key)) {
    db[key] = {
      itemIndex: 0,
      todos: []
    };
  }
}

module.exports = {
  addTodo: function(key, message) {
    ensureKeyExists(key);

    let todoItem = {
      id: ++db[key].itemIndex,
      message: message
    };

    db[key].todos.push(todoItem);

    return todoItem;
  },
  getTodos: function(key) {
    ensureKeyExists(key);

    let usersTodos = db[key].todos.filter(todo => todo.completed === undefined);

    return usersTodos;
  },
  completeTodo: function(key, todoId) {
    ensureKeyExists(key);

    let todoItem = db[key].todos.find(todo => todo.id == todoId);
    todoItem.completed = true;

    return todoItem;
  },
  removeTodo: function(key, todoId) {
    ensureKeyExists(key);

    db[key].todos = db[key].todos.filter(todo => todo.id != todoId);

    return this.getTodos(key);
  }
};