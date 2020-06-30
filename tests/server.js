const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/404') {
        res.statusCode = 404;
        res.end('not found');
        return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.end('hello world');
});

const port = 7000;
server.listen(port);

console.log('server is on ' + port);
