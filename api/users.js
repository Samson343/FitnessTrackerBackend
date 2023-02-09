/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env;
const bcrypt = require('bcrypt');
// const SALT_COUNT = 10

const {
    createUser,
    getUser,
    getUserById,
    getUserByUsername,
} = require('../db');
const { response } = require("express");

// POST /api/users/register
usersRouter.post('/register', async (req, res, next) => {
    const { username, password } = req.body

    try {
        const _user = await getUserByUsername(username);

        if (_user) {
            next({
                error: "User already exists",
                message: `User ${username} is already taken.`,
                name: 'UserExistsError'
            });
        }
        if (password.length < 8) {
            next({
                error: "Password should be at least 8 characters",
                message: "Password Too Short!",
                name: "PasswordTooShortError"
            })
        }

        const user = await createUser({ username, password })

        const token = jwt.sign({
            id: user.id,
            username
        }, JWT_SECRET)

        res.send({
            message: 'thank you for signing up for our service',
            token: token,
            user: user
        })
    } catch (error) {
        next(error)
    }
})

// POST /api/users/login
usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body

    if (!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please enter a password and a username"
        })
    }

    try {
        const user = await getUserByUsername(username)
        let passwordsMatch = await bcrypt.compare(password, user.password)


        if (user && passwordsMatch) {
            const token = jwt.sign({
                id: user.id,
                username
            }, JWT_SECRET)

            res.send({
                user: user,
                token: token,
                message: "you're logged in!"
            })
        } else {
            next({
                name: 'IncorrectCredentialsError',
                message: 'Username or password is incorrect'
            })
        }
    } catch (error) {
        next(error)
    }
})

// GET /api/users/me
usersRouter.get('/me', async (req, res, next) => {

    try {
        const prefix = 'Bearer ';
        const auth = req.header('Authorization');
        const token = auth.slice(prefix.length);

        // if (!jwt.verify(token, JWT_SECRET)) {
        //     res.status(401)
        //     next({
        //       message: "invalid token, please log in"
        //     })
        // }

        const { id, username } = jwt.verify(token, JWT_SECRET)

        console.log("this is id", id, "this is username", username)

        if (id && username) {
            res.send({
                id, username
            })
            next()
        } else {
            next({
                name: 'AuthorizationHeaderError',
                message: `Authorization token must start with ${ prefix }`
            });
        }
    } catch (error) {
        next(error)
    }
})


// GET /api/users/:username/routines

usersRouter.use((error, req, res, next) => {
    res.send(error)
})

module.exports = usersRouter;
