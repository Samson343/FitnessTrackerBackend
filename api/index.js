const express = require('express');
const router = express.Router();
const cors = require('cors')
router.use(cors())

router.get('/health', async (req, res, next) => {

    res.status(200).send({
        message: "all is well!"
    })
    next()
});


// GET /api/health
router.get('/api/health', async (req, res, next) => {
    res.status(404).send({message: "it is healthy"});
    next();
    
});

// ROUTER: /api/users
const usersRouter = require('./users');
router.use('/users', usersRouter);

// ROUTER: /api/activities
const activitiesRouter = require('./activities');
router.use('/activities', activitiesRouter);

// ROUTER: /api/routines
const routinesRouter = require('./routines');
router.use('/routines', routinesRouter);

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
router.use('/routine_activities', routineActivitiesRouter);

router.use((req, res, next) => {
    res.status(404).send({message: "page not found!"})
    next()
  })

module.exports = router;
