const express = require("express")

// Creating an express instance
const app = express()

// Libraries
const cookieSession = require("cookie-session")
const bodyParser = require("body-parser")
const passport = require("passport")

// Getting the local authentication type
const LocalStrategy = require("passport-local").Strategy

// Data
const users = require("./assets/user.json");

passport.use(new LocalStrategy(
    {
        usernameField: "email",
        passwordField: "password"
    },
    (username, password, done) => {
        let user = users.find(user => {
            return user.email === username && user.password === password
        })

        if (user) {
            console.log(["Login:", user]);
            done(null, user);
        } else {
            done(null, false, { message: 'Incorrect username or password'});
        }
    }
));

passport.serializeUser((user, done) => {
    console.log(["serializeUser:", user]);
    done(null, user.id);
})

passport.deserializeUser((id, done) => {
    let user = users.find((user) => {
        return user.id === id
    })

    console.log(["deserializeUser:", id, user]);
    done(null, user);
})

app.use(bodyParser.json())

app.use(cookieSession({
    name: 'mysession',
    keys: ['vueauthrandomkey'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(passport.initialize())

app.use(passport.session())

app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(400).send([user, "Cannot log in", info]);
        }

        req.logIn(user, err => {
            res.send("Logged in");
        });
    })(req, res, next);
});

app.get("/api/logout", (req, res) => {
    req.logOut();

    console.log("Logged out");

    return res.send();
});

const authMiddleware = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.status(401).send("You are nor authenticated");
    } else {
        return next();
    }
}

app.get("/api/user", authMiddleware, (req, res) => {
    let user = users.find(user => {
        return user.id === req.session.passport.user
    });
    
    console.log([user, req.session]);

    res.send({ user: user });
});

app.listen(3000, () => {
    console.log("App running on port  3000")
});

const publicRoot = '../vueauthclient/dist'
app.use(express.static(publicRoot));

app.get("/", (req, res, next) => {
    res.sendFile("index.html", { root: publicRoot })
})
