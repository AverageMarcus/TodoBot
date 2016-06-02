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

    let action = usersText.split(' ')[0].trim().toLowerCase();
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
    helpMessage += `*${validAction}:* ${validActions[validAction]}\n`
  }

  return {
    text: helpMessage,
    response_type: 'ephemeral'
  };
}

function showList(key, toChannel) {
  let usersTodoList = todos.getTodos(key);

  let message = '';

  if(!usersTodoList || !usersTodoList.length) {
    message = 'You currently have an empty todo list! :smile:';
  } else {
    for(let todo of usersTodoList) {
      message += `:white_medium_square: [${todo.id}] ${todo.message}\n`;
    }
  }

  return {
    text: message,
    response_type: toChannel ? 'in_channel' : 'ephemeral'
  };
}

function addTodo(key, message) {
  let newTodo = todos.addTodo(key, message);

  return {
    text: `:white_medium_square: [${newTodo.id}] ${newTodo.message}`,
    response_type: 'ephemeral'
  };
}

function completeTodo(key, todoId) {
  let completedTodo = todos.completeTodo(key, todoId);

  return {
    text: `:ballot_box_with_check: [${completedTodo.id}] ${completedTodo.message}\n`,
    response_type: 'ephemeral'
  };
}

function removeTodo(key, todoId) {
  let usersTodoList = todos.removeTodo(key, todoId);

  let message = 'Removed todo from your list\n';

  if(!usersTodoList || !usersTodoList.length) {
    message = 'You currently have an empty todo list! :smile:';
  } else {
    for(let todo of usersTodoList) {
      message += `:white_medium_square: [${todo.id}] ${todo.message}\n`;
    }
  }

  return {
    text: message,
    response_type: 'ephemeral'
  };
}

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});