require('dotenv').config();
const express = require('express');
const app = express();
const massive = require('massive');
const session = require('express-session');
const authCtrl = require('./controllers/authCtrl');
const authenticateUser = require('./middlewares/authenticateUser');

const { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env;

app.use(express.json());

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));



//AUTH ENDPOINTS
app.post('/auth/register', authCtrl.register);
app.post('/auth/login', authCtrl.login);
app.delete('/auth/logout', authCtrl.logout);

// protected routes or endpoints
app.get('/api/secret', authenticateUser, (req, res) => {
    res.status(200).send('You got the secret admin!')
});



massive({
    connectionString: CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false
    }
})
    .then(dbInstance => {
        app.set('db', dbInstance);
        app.listen(SERVER_PORT, () => console.log(`db up and server listening on ${SERVER_PORT}`))
    })
    .catch(error => console.log(error));



// app.listen(SERVER_PORT, () => console.log(`server listening on ${SERVER_PORT}`))