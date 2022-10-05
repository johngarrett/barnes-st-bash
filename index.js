const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const qs = require('node:querystring');

const host = 'localhost';
const port = 8000;

const requestListener = (req, res) => {
    const reqUrl = url.parse(req.url);
    switch(reqUrl.pathname) {
        case "/":
            index(req, res);
            break
        case "/register":
            register(req, res);
            break
        default:
            res.writeHead(404);
            res.end("404");
            break
    }
}

const index = (req, res) => {
    fs.readFile(__dirname + "/index.html")
    .then(content => {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(content);
    })
    .catch(err => {
        res.writeHead(500);
        res.end(err);
        return;
    });
}

const register = (req, res) => {
    const reqUrl = url.parse(req.url);
    //res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    const queries = qs.parse(reqUrl.query);
    const fname = queries.fname;
    const lname = queries.lname;

    console.log(fname, lname);
    res.end(JSON.stringify(queries));
}

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
