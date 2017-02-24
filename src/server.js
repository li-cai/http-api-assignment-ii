const http = require('http');
const url = require('url');
const query = require('querystring');

const htmlHandler = require('./htmlResponses.js');
const responseHandler = require('./responses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const GET_URL_STRUCT = {
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCSS,
  '/getUsers': responseHandler.getUsers,
  '/notReal': responseHandler.notFound,
};

const HEAD_URL_STRUCT = {
  '/getUsers': responseHandler.getUsersHead,
  '/notReal': responseHandler.notFoundHead,
};

const onRequest = (request, response) => {
  console.log(request.url);

  const pathname = url.parse(request.url, true).pathname;

  switch (request.method) {
    case 'GET':
      if (!GET_URL_STRUCT[pathname]) {
        responseHandler.notFound(request, response);
      } else {
        GET_URL_STRUCT[pathname](request, response);
      }
      break;

    case 'HEAD':
      if (!HEAD_URL_STRUCT[pathname]) {
        responseHandler.notFound(request, response);
      } else {
        HEAD_URL_STRUCT[pathname](request, response);
      }
      break;

    case 'POST':
      if (pathname === '/addUser') {
        const res = response;
        const body = [];

        request.on('error', (err) => {
          console.dir(err);
          res.statusCode = 400;
          res.end();
        });

        request.on('data', (chunk) => {
          body.push(chunk);
        });

        request.on('end', () => {
          const bodyString = Buffer.concat(body).toString();

          const bodyParams = query.parse(bodyString);

          responseHandler.addUser(request, res, bodyParams);
        });
      }
      break;

    default:
      responseHandler.notFound(request, response);
      break;
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1:${port}`);
