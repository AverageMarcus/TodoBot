"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const connection = mongoose.createConnection(process.env.MONGODB_URL);

const todoSchema = new Schema({
  message: String,
  completed: Boolean
});
const userSchema = new Schema({
  key: String,
  todos: [todoSchema]
});
let UserTodos = connection.model('UserTodos', userSchema);

function ensureKeyExists(key) {
  return new Promise((resolve, reject) => {
    UserTodos.findOne({key: key}, function(err, doc) {
      if(!doc) {
        let userTodo = new UserTodos({
          key: key,
          todos: [],
          itemIndex: 0
        });
        userTodo.save(function(err) {
          return resolve(userTodo);
        });
      } else {
        return resolve(doc);
      }
    });
  });
}

module.exports = {
  addTodo: function(key, message) {
    return ensureKeyExists(key)
      .then(doc => {
        return new Promise((resolve, reject) => {
          var todoItem = {
            message: message
          };

          doc.todos.push(todoItem);
          doc.save(function(err) {
            return resolve({id: doc.todos.length, message: todoItem.message});
          });
        });
      });
  },
  getTodos: function(key) {
    return ensureKeyExists(key)
      .then(doc => {
        return doc.todos.filter(todo => todo.completed === undefined);
      });
  },
  completeTodo: function(key, todoId) {
    return ensureKeyExists(key)
      .then(doc => {
        return new Promise((resolve, reject) => {
          var todoItem = doc.todos[todoId];
          doc.todos.splice(todoId, 1);
          doc.save(function(err) {
            return resolve(todoItem);
          });
        });
      });
  }
};