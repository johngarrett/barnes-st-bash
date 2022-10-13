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
        case "/track-view":
            track_view(req, res);
            break
        case "/view-count":
            view_count(req, res);
            break
        default:
            res.writeHead(404);
            console.log(reqUrl.pathname);
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

    console.log(Date.now() + 'registering user from: ' + req.socket.remoteAddress + ' with: ' + reqUrl.query);
    if (cookies['registered'] == "true") {
        res.writeHead(500, {
            "Set-Cookie": `registered=true; SameSite=None; Secure`,
            "Content-Type": `text/json`,
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "https://garrepi.dev",
            "Access-Control-Allow-Credentials": true 
        });
        res.end(JSON.stringify({
            result: "User already registered" 
        }));
        return;
    }

    if (
        queries["fname"] == undefined || queries["lname"] == undefined 
        || queries["fname"]?.length == 0 || queries["lname"]?.length == 0
    ) {
        res.writeHead(500, {
            "Set-Cookie": `registered=failed; SameSite=None; Secure`,
            "Content-Type": `text/json`,
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "https://garrepi.dev",
            "Access-Control-Allow-Credentials": true 
        });
        res.end(JSON.stringify({
            result: "Invalid registration values" 
        }));
        return;
    }

    const guest = {
        ...queries,
        time: Date.now()
    }

    db.collection('guests').insertOne(guest)
        .then(response => {
            res.writeHead(200, {
                "Set-Cookie": `registered=true; SameSite=None; Secure`,
                "Content-Type": `text/json`,
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "https://garrepi.dev",
                "Access-Control-Allow-Credentials": true 
            });
            res.end(JSON.stringify({
                result: "success" 
            }));
        })
        .catch(err => {
            res.writeHead(500, {
                "Set-Cookie": `registered=failed; SameSite=None; Secure`,
                "Content-Type": `text/json`,
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "https://garrepi.dev",
                "Access-Control-Allow-Credentials": true 
            });
            res.end(JSON.stringify({
                result: err
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
        res.writeHead(200);
        res.end(""+count);
    })
    .catch(err => {
        console.error(err);
        res.writeHead(500);
        res.end("{}")
    });
};

const track_view = (req, res) => {
    const reqUrl = url.parse(req.url);
    const queries = qs.parse(reqUrl.query);
    const cookies = parseCookies(req);

    if (cookies['viewed'] == "true") {
        res.writeHead(418, {
            "Set-Cookie": `viewed=true; SameSite=None; Secure`,
            "Content-Type": `text/json`,
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "https://garrepi.dev",
            "Access-Control-Allow-Credentials": true 
        });
        res.end(JSON.stringify({
            result: "User already accounted for" 
        }));
        return;
    }

    const view = {
        address: req.socket.remoteAddress,
        time: Date.now()
    }

    db.collection('views').insertOne(view)
        .then(response => {
            res.writeHead(200, {
                "Set-Cookie": `viewed=true; SameSite=None; Secure`,
                "Content-Type": `text/json`,
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "https://garrepi.dev",
                "Access-Control-Allow-Credentials": true 
            });
            res.end(JSON.stringify({
                result: "success" 
            }));
        })
        .catch(err => {
            res.writeHead(500, {
                "Set-Cookie": `viewed=failed; SameSite=None; Secure`,
                "Content-Type": `text/json`,
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "https://garrepi.dev",
                "Access-Control-Allow-Credentials": true 
            });
            res.end(JSON.stringify({
                result: err
            }));
        });
};

const view_count = (req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=UTF-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    db.collection("views").count()
    .then(count => {
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
