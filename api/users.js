/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env;
const bcrypt = require('bcrypt');
// const SALT_COUNT = 10

const {
    createUser,
    getUserByUsername,
    getAllRoutinesByUser
} = require('../db');
const {
    getPublicRoutinesByUser
} = require ('../db/routines')

// const { response } = require("express");

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
        let user = req.user

        if (user) {
            res.send({
                id: user.id,
                username: user.username
            })
            next()
        } else {
            res.status(401).send({
                error: "NotAthorized",
                message: "You must be logged in to perform this action",
                name: "notLoggedIn"
            })
        }
    } catch (error) {
        next(error)
    }
})


// GET /api/users/:username/routines
// usersRouter.get('/:username/routines', async (req, res, next) => {

//   try {
//     const { username } = req.params
//     console.log("this is username", username)
//       const routines = await getPublicRoutinesByUser(username)
//       console.log("this is routines", routines)
//       res.send ({routines:routines})
//   } catch (error) {
//       next(error)
//   }
// })

usersRouter.get('/:username/routines', async (req, res, next) => {
    try {
      const {username} = req.params;
      const user = await getUserByUsername(username);
      if(!user) { 
        next({
          name: 'No User',
          message: `Error looking up user ${username}`
        });
      } else if(req.user && user.id === req.user.id) {
        const routines = await getAllRoutinesByUser({username: username});
        res.send(routines);
      } else {
        const routines = await getPublicRoutinesByUser({username: username});
        res.send(routines);
      }
    } catch (error) {
      next(error)
    }
  })

usersRouter.use((error, req, res, next) => {
    res.send(error)
})

module.exports = usersRouter;
