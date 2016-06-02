"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const connection = mongoose.createConnection(process.env.MONGODB_URL);

const userSchema = new Schema({
  key: String,
  todos: Array
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
          let newId = doc.todos.indexOf(-1);
          if(newId >= 0) {
            doc.todos[newId] = todoItem;
          } else {
            doc.todos.push(todoItem);
            newId = doc.todos.length - 1;
          }
          doc.save(function(err) {
            return resolve({id: newId, message: todoItem.message});
          });
        });
      });
  },
  getTodos: function(key) {
    return ensureKeyExists(key)
      .then(doc => {
        return doc.todos.filter(todo => todo != -1);
      });
  },
  completeTodo: function(key, todoId) {
    return ensureKeyExists(key)
      .then(doc => {
        return new Promise((resolve, reject) => {
          if(todoId >= doc.todos.length) {
            return reject();
          }
          var todoItem = doc.todos[todoId];
          doc.todos[todoId] = -1;
          doc.save(function(err) {
            return resolve({id: todoId, message: todoItem.message});
          });
        });
      });
  }
};