'use strict';
const todos = require('./todos');
const Hapi = require('hapi');
const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 3000 });

const validActions = {
  'list': 'Display your list of todos visible only to you `/todo list`',
  'show': 'Display your list of todos to the current channel `/todo show`',
  'add': 'Add a new todo item `/todo add Buy some milk`',
  'complete': 'Mark a todo item as complete `/todo complete 123`',
  'remove': 'Remove a todo item `/todo remove 123`',
  'help': 'Show this help text `/todo help`'
};

server.route({
  method: 'POST',
  path: '/todo',
  handler: (request, reply) => {
    let userId = request.payload.user_id;
    let teamId = request.payload.team_id;
    let key = `${teamId}_${userId}`;
    let usersText = (request.payload.text || '').trim();

    let action = usersText.substring(0, usersText.indexOf(' ')).trim().toLowerCase();
    let message = usersText.substring(usersText.indexOf(' ')).trim();

    let response;

    if(validActions.hasOwnProperty(action)) {
      switch(action) {
        case 'help':
          response = showHelp();
          break;
        case 'list':
          response = showList(key);
          break;
        case 'show':
          response = showList(key, true);
          break;
        case 'add':
          response = addTodo(key, message);
          break;
        case 'complete':
          response = completeTodo(key, message);
          break;
        case 'remove':
          response = removeTodo(key, message);
          break;
      }
    } else {
      response = showHelp(true);
    }

    reply(response).header('Content-Type', 'application/json');
  }
});

function showHelp(unknownCommand) {
  let helpMessage = ``;
  if(unknownCommand) {
    helpMessage += `I don't understand what you mean.\n\n`;
  }

  for(let validAction in validActions) {
    helpMessage += `*${validAction}:* ${validActions[validAction]}`
  }

  return {
    text: helpMessage,
    in_channel: false
  };
}

function showList(key, toChannel) {
  let usersTodoList = todos.getTodos(key);

  // TODO: Format todos

  return {
    text: '',
    in_channel: toChannel
  };
}

function addTodo(key, message) {
  let newTodo = todos.addTodo(key, message);

  // TODO: Display new todo

  return {
    text: '',
    in_channel: false
  };
}

function completeTodo(key, todoId) {
  todos.completeTodo(key, todoId);

  // TODO: Show completed todo

  return {
    text: '',
    in_channel: false
  };
}

function removeTodo(key, todoId) {
  todos.removeTodo(key, todoId);

  // TODO: Confirm remove

  return {
    text: '',
    in_channel: false
  };
}

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});