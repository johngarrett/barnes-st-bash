const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const qs = require('node:querystring');
const { MongoClient } = require('mongodb');
const mongoUrl = "mongodb://localhost:27017/bstb";
var db;

const host = 'localhost';
const port = 8000;


// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/drop1.garrepi.dev/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/drop1.garrepi.dev/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/drop1.garrepi.dev/chain.pem', 'utf8');

const credentials = {
   key: privateKey,
    cert: certificate,
    ca: ca
};

MongoClient.connect(mongoUrl, function (err, client) {
    if (err) {
        throw err;
    } else {
        db = client.db('bstb');
        console.log('Connected to MongoDB');
        startServer();
    }
});

const requestListener = (req, res) => {
    const reqUrl = url.parse(req.url);
    console.log(reqUrl.pathname)
    switch(reqUrl.pathname) {
        case "/":
            index(req, res);
            break
        case "/index.js":
            indexjs(req, res);
            break
        case "/register":
            register(req, res);
            break
        case "/guests":
            guests(req, res);
            break
        case "/guest-count":
            guest_count(req, res);
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

const indexjs = (req, res) => {
    fs.readFile(__dirname + "/index.js")
    .then(content => {
        res.setHeader("Content-Type", "application/javascript");
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
    const guest = {
        ...queries,
        time: Date.now()
    }

    db.collection('guests').insertOne(guest, function (err, res) {
        if (err) {
            console.error(err)
        } else {
            console.log(res)
        }
    })

    res.end(JSON.stringify(queries));
}

// return json of all guests on GET
const guests = (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const options = {
        // TODO: date
   //   sort: { date: 1 },
      projection: { _id: 0, fname: 1, lname: 1 },
    };

    const entries = db.collection("guests").find({}, options);
    entries.toArray().then(array => {
        res.writeHead(200);
        res.end(JSON.stringify(array))
    }).catch(err => {
        console.error(err);
        res.writeHead(500);
        res.end("{}")
    })
};

// return plain text number of guest count
const guest_count = (req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=UTF-8");
    db.collection("guests").count()
    .then(count => {
        console.log(count)
        res.writeHead(200);
        res.end(""+count);
    })
    .catch(err => {
        console.error(err);
        res.writeHead(500);
        res.end("{}")
    });
};

const startServer = () => {
    const server = http.createServer(requestListener);

    server.listen(port, host, () => {
        console.log(`Server is running on http://${host}:${port}`);
    });
};
