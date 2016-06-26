"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const connection = mongoose.createConnection(process.env.MONGO_URL);

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

          var newId = doc.todos.findIndex(todo => todo == undefined);

          if(newId >= 0) {
            todoItem.id = newId;
            doc.todos = doc.todos.map((todo, index) => {
              if(index == newId) {
                return todoItem;
              } else {
                return todo;
              }
            });
          } else {
            newId = doc.todos.length;
            todoItem.id = newId;
            doc.todos.push(todoItem);
          }

          doc.save(function(err) {
            return resolve({id: todoItem.id, message: todoItem.message});
          });
        });
      });
  },
  getTodos: function(key) {
    return ensureKeyExists(key)
      .then(doc => {
        return doc.todos.filter(todo => todo != undefined);
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
          doc.todos = doc.todos.map((todo, index) => {
            if(index == todoId) {
              return undefined;
            } else {
              return todo;
            }
          });
          doc.save(function(err) {
            return resolve({id: todoItem.id, message: todoItem.message});
          });
        });
      });
  }
};
