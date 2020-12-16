const http = require('http');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Authorization');

    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    if (req.url === '/404') {
        res.statusCode = 404;
        res.end('not found');
        return;
    }

    if (req.url === '/api') {
        res.end(JSON.stringify({ code: 0, message: '', data: 'result' }));
        return;
    }

    if (req.url === '/api/wait') {
        setTimeout(() => {
            res.end(JSON.stringify({ code: 0, message: '', data: 'wait result' }));
        }, 1000);
        return;
    }

    if (req.url === '/api/error') {
        res.end(JSON.stringify({ code: 10010, message: 'error msg', data: 'failed' }));
        return;
    }

    if (req.url === '/api/error/404') {
        res.statusCode = 404;
        res.end(JSON.stringify({ code: 404, message: 'error', data: 'failed' }));
        return;
    }

    if (req.url === '/api/error/500') {
        res.statusCode = 500;
        res.end();
        return;
    }

    if (req.url === '/api/error/502') {
        res.statusCode = 502;
        res.end(JSON.stringify({ code: 502, message: 'error', data: 'failed' }));
        return;
    }

    if (req.url === '/api/auth') {
        res.end(JSON.stringify({ code: 0, message: '', data: req.headers.authorization }));
        return;
    }

    if (req.url === '/api/auth/error') {
        res.statusCode = 401;
        res.end(JSON.stringify({ code: 10020, message: 'auth error', data: 'auth failed' }));
        return;
    }

    res.end('hello world');
});

const port = 7000;
server.listen(port);

console.log('server is on ' + port);
