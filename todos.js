"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const connection = mongoose.createConnection(process.env.MONGODB_URL);

const todoSchema = new Schema({
  id: Number,
  message: String
});
const userSchema = new Schema({
  key: String,
  todos: [todoSchema],
  itemIndex: {type: Number, default: 0}
});
let UserTodos = connection.model('UserTodos', userSchema);

// MVP
let db = {};

function ensureKeyExists(key) {
  return new Promise((resolve, reject) => {
    UserTodos.find({key: key}, function(err, docs) {
      if(!docs.length) {
        let userTodo = new UserTodos({
          key: key,
          todos: [],
          itemIndex: 0
        });
        userTodo.save(function(err) {
          return resolve();
        });
      } else {
        return resolve();
      }
    });
  });
}

module.exports = {
  addTodo: function(key, message) {
    return ensureKeyExists(key)
      .then(() => {
        return new Promise((resolve, reject) => {
          UserTodos.findOne({key: key}, function(err, doc) {
            var todoItem = {
              id: ++doc.itemIndex,
              message: message
            };

            doc.todos.push(todoItem);
            doc.save(function(err) {
              return resolve(todoItem);
            });
          });
        });
      });
  },
  getTodos: function(key) {
    return ensureKeyExists(key)
      .then(() => {
        return new Promise((resolve, reject) => {
          UserTodos.findOne({key: key}, function(err, doc) {
            return resolve(doc.todos.filter(todo => todo.completed === undefined));
          });
        });
      });
  },
  completeTodo: function(key, todoId) {
    return ensureKeyExists(key)
      .then(() => {
        return new Promise((resolve, reject) => {
          UserTodos.findOne({key: key}, function(err, doc) {
            var returnItem;
            for(let todoItem of doc.todos) {
              if(todoItem.id == todoId) {
                todoItem.completed = true;
                returnItem = todoItem;
                break;
              }
            }
            doc.save(function(err) {
              return resolve(returnItem);
            });
          });
        });
      });
  },
  removeTodo: function(key, todoId) {
    return ensureKeyExists(key)
      .then(() => {
        return new Promise((resolve, reject) => {
          UserTodos.findOne({key: key}, function(err, doc) {
            doc.todos = doc.todos.filter(todo => todo.id != todoId);
            doc.save(function(err) {
              return resolve(doc.todos);
            });
          });
        });
      });
  }
};