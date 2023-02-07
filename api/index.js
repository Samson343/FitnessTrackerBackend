const express = require('express');
const cors = require('cors')
const router = express.Router();
router.use(cors())


// GET /api/health
router.get('/health', async (req, res, next) => {

    res.status(200).send({
        message: "all is well!"
    })
    next()
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


router.use(function(error, req, res, next) {
    res.status(404).send({ message: error.message });
  });

module.exports = router;
