const http = require('http');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');

    if (req.url === '/404') {
        res.statusCode = 404;
        res.end('not found');
        return;
    }

    if (req.url === '/api') {
        res.end(JSON.stringify({ success: true, data: 'result' }));
        return;
    }

    res.end('hello world');
});

const port = 7000;
server.listen(port);

console.log('server is on ' + port);
