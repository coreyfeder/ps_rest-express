const express = require("express");
const bodyParser = require("body-parser");

const router = express.Router();
const app = express();
const port = 3000; // try 5000 if troubles
const host = "localhost";
const protocol = "http";
const root = "/api";
const url = `${protocol}://${host}:${port}${root}`;

const users = require("./data/users");
const posts = require("./data/posts");

// CONNECTION TO DB

// MIDDLEWARE

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

// `pass()` => pass control to the next middleware function
// `pass("router")` => pass control back out of the router instance => skip the rest of the router’s middleware functions

// a middleware function with no mount path => code executed for every request to the router
router.use((req, res, next) => {
    console.log([
            Date.now(), 
            req.method, 
            req.originalUrl,
        ].join(' : '))
    next()

    /* oooh, can I postlog? */
    console.log([
            Date.now(), 
            req.method,  // why doesn't res.method have this?
            res.statusCode,  // this doesn't work for some errors?
            res.statusMessage,  // blanks?
            // JSON.stringify(res.json()),  // goddamn "[object Object]". How does .json() not know it's JSON?
        ].join(' : '))
    // console.log(res.json());  // works, but is huge
})

// mount the router on the app
app.use('/', router)


// ROUTES

//  - ulost?
app.get("/", (req, res) => {
    res.send("Hello from ps_rest-express!");
});

//  - 404 to other users
app.get(`/users`, (req, res) => {
    res.status(404);
    res.send(`Don't talk to me like I'm some kind of API. Go tell it to ${root}/users.`);
    res.json({ error: `APIs are found in the ${root} folder.`})
});

// users
app.get(`${root}/users`, (req, res) => {
    res.json(users)
});

// user
app.get(`${root}/user/:userid`, (req, res, next) => {
    try {
        const user = users.find((u) => u.userid == req.params.userid);
        if (user) res.json(user);
        next()
    } catch (error) {
        console.error(error)
    }
});

// POST -> user = make a new user
app.post(`${root}/user`, (req, res) => {
    // if (toString(req.body) != '{}') {console.log("HEY! HEY!! LOOK AT THIS!")};
    // console.log(`log req.body: ${req.body}`)  // [object Object]
    // console.log(req.body)  // {}
    // console.log(req.body[0])  // undefined
    // console.log(req.body=={})  // false
    // console.log(req.body=='{}')  // false
    // console.dir(`dir req.body: ${req.body}`)  // [object Object]
    // console.dir(req.body)  // {}
    // console.log(Array.isArray(req.body))  // falser
    // console.log(Object.keys(req.body))  // (0) []
    // console.log(Object.values(req.body))  // (0) []
    // 
    // console.dir(Object.keys(req))
    // (29) ['_events', '_readableState', '_maxListeners', 'socket', 'httpVersionMajor', 'httpVersionMinor', 'httpVersion', 'complete', 'rawHeaders', 'rawTrailers', 'joinDuplicateHeaders', 'aborted', 'upgrade', 'url', 'method', 'statusCode', 'statusMessage', 'client', '_consuming', '_dumped', 'next', 'baseUrl', 'originalUrl', '_parsedUrl', 'params', 'query', 'res', 'body', 'route']
    // console.dir(req.headers)
    // {user-agent: 'PostmanRuntime/7.36.3', accept: '*/*', postman-token: '9238024e-1a9f-45e1-866a-1b6875eb7856', host: 'localhost:3000', accept-encoding: 'gzip, deflate, br', …}
    // console.dir(req.readable)  // true
    // console.dir(req.params)  // blank
    // console.dir(req.body)  // blank
    if (!req.body.name || !req.body.username || !req.body.email) {
        res.status(400)
        res.json({error: "Insufficient data."})
        return
    } else if (users.find((u) => u.username == req.body.username )) {
        res.status(428)
        res.json({error: "Username is in use."})
        return
    } else {
        const newUser = {
            // userid: users[users.length - 1].userid + 1,
            userid: Math.max(users.forEach((u) => u.userid)) + 1,
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
        }
        users.push(newUser);
        res.json(users[users.length - 1])
    }
});

app.patch(`${root}/user`, (req, res) => { res.send("Received a PATCH request for user! If only it were that easy, eh?"); });

app.delete(`${root}/user`, (req, res) => { res.send("HAHA! It actually IS that easy! But don't do that. People, don't do murders."); });

// user, weird shit
app.get(`${root}/user/:userid/profile`, (req, res) => {
    res.send(`${req.params.userid} is great. We laugh. We cry. Better than <i>Cats</i>.`);
});    
app.get(`${root}/user/:userid/profile/:data`, (req, res) => {
    res.send(`Oh no, that'd be an invasion of privacy. ${req.params.userid} probably doesn't want ${req.params.data} out in the open.`);
});    

// get all posts
app.get(`${root}/posts`, (req,res) => { res.json(posts) })

// get one post
app.get(`${root}/post/:postid`, (req,res, next) => {
    const post = posts.find((p) => p.postid == req.params.postid);
    if(post) res.json(post);
    else next();
})

// ERROR HANDLING ("endware"?)

app.use((err, req, res, next) => {
    // handle 404's
    console.error(err.stack);
    res.status(404)
    res.json({ error: `Resource not found.` });
});
// the above is actually a catch-all.
// You could also do, say, an app.get()


// LISTENERS

app.listen(port, () => {
    console.log(`Server listening at:  ${url}`);
});
