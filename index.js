var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var fs = require('fs');

var config = require('./lib/config');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

var httpServer = http.createServer(function (req, res) {
    server(req, res);
});

var httpsServerOptions = {
    'key': fs.readFileSync('./https/server.key'),
    'cert': fs.readFileSync('./https/server.cert')
}
var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
    server(req, res);
});

var server = function (req, res) {
    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');
    var queryString = parsedUrl.query;
    var method = req.method.toLowerCase();
    var headers = req.headers;
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function (data) {
        //console.log('index data: ', data);
        buffer += decoder.write(data);
    });

    req.on('end', function () {
        buffer += decoder.end();

        var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        //console.log('index buffer ', buffer);

        var data = {
            'trimmedPath': trimmedPath,
            'queryString': queryString,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        chosenHandler(data, function (statusCode, payload) {
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
            payload = typeof (payload) == 'object' ? payload : {};

            var payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('Response: ', statusCode, payloadString);
        });

        //res.end('Hello Node Rest JS API');

        //console.log(`Requested path on ${trimmedPath} or ${otherPath} with method ${method} and `, queryString);
        //console.log(`With headers: ${JSON.stringify(headers)}`);
        //console.log('With payload: ', buffer);
    })
}

httpServer.listen(config.httpPort, function () {
    console.log(`The server is listening on ${config.httpPort} in ${config.envName}`)
});

httpsServer.listen(config.httpsPort, function () {
    console.log(`The server is listening on ${config.httpsPort} in ${config.envName}`)
});

var router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
}