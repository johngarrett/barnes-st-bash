const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs').promises;
const _fs = require('fs');
const qs = require('node:querystring');
const { MongoClient } = require('mongodb');
const mongoUrl = "mongodb://localhost:27017/bstb";
var db;



// Certificate
const privateKey = _fs.readFileSync('/etc/letsencrypt/live/drop1.garrepi.dev/privkey.pem', 'utf8');
const certificate = _fs.readFileSync('/etc/letsencrypt/live/drop1.garrepi.dev/cert.pem', 'utf8');
const ca = _fs.readFileSync('/etc/letsencrypt/live/drop1.garrepi.dev/chain.pem', 'utf8');

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

const parseCookies = (request) => {
    const list = {};
    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function(cookie) {
        let [ name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}


const register = (req, res) => {
    const reqUrl = url.parse(req.url);
    const queries = qs.parse(reqUrl.query);
    const cookies = parseCookies(req);
    console.log(cookies);

    if (cookies['registered'] == "true") {
        console.log('already registered')
        res.writeHead(500, {
            "Set-Cookie": `registered=true`,
            "Content-Type": `text/json`,
            "Access-Control-Allow-Origin": "https://garrepi.dev"
        });
        res.end(JSON.stringify({
            error: "User already registered" 
        }));
    }

    const guest = {
        ...queries,
        time: Date.now()
    }

    db.collection('guests').insertOne(guest)
        .then(response => {
            res.writeHead(200, {
                "Set-Cookie": `registered=true`,
                "Content-Type": `text/json`,
                "Access-Control-Allow-Origin": "https://garrepi.dev"
            });
            res.end(JSON.stringify({
                success: true 
            }));
        })
        .catch(err => {
            res.writeHead(500, {
                "Set-Cookie": `registered=failed`,
                "Content-Type": `text/json`,
                "Access-Control-Allow-Origin": "https://garrepi.dev"
            });
            res.end(JSON.stringify({
                error: err
            }));
        });
}

// return json of all guests on GET
const guests = (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
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
    res.setHeader("Access-Control-Allow-Origin", "*");
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
        const httpServer = http.createServer(requestListener);
        const httpsServer = https.createServer(credentials, requestListener);

        httpServer.listen(80, () => {
            console.log("HTTP Server running on port 80");
        });
        httpsServer.listen(443, () => {
                console.log("HTTPS Server running on port 443");
            });
};
