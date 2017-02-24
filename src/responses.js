const crypto = require('crypto');

const users = {};

let etag = crypto.createHash('sha1').update(JSON.stringify(users));
let digest = etag.digest('hex');

const updateDigest = () => {
  etag = crypto.createHash('sha1').update(JSON.stringify(users));
  digest = etag.digest('hex');
};

const sendResponse = (request, response, status, obj) => {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    etag: digest,
  });

  response.write(JSON.stringify(obj));
  response.end();
};

const sendResponseHead = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, headers);
  response.end();
};

const addUser = (request, response, body) => {
  const responseJSON = {
    message: 'Name and age are both required.',
  };

  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return sendResponse(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (users[body.name]) {
    responseCode = 204;
  } else {
    users[body.name] = {};
  }

  users[body.name].name = body.name;
  users[body.name].age = body.age;

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return sendResponse(request, response, responseCode, responseJSON);
  }

  return sendResponseHead(request, response, responseCode);
};

const getUsers = (request, response) => {
  updateDigest();

  if (request.headers['if-none-match'] === digest) {
    return sendResponseHead(request, response, 304);
  }

  return sendResponse(request, response, 200, { users });
};

const getUsersHead = (request, response) => {
  updateDigest();

  if (request.headers['if-none-match'] === digest) {
    return sendResponseHead(request, response, 304);
  }

  return sendResponseHead(request, response, 200);
};

const notFound = (request, response) => {
  const resjson = {
    message: 'The page you are looking for was not found.',
    id: 'notReal',
  };

  sendResponse(request, response, 404, resjson);
};

const notFoundHead = (request, response) => {
  sendResponseHead(request, response, 404);
};

module.exports = {
  addUser,
  getUsers,
  getUsersHead,
  notFound,
  notFoundHead,
};
