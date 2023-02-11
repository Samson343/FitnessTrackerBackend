const express = require('express');
const activitiesRouter = express.Router();

const { getAllActivities, getPublicRoutinesByActivity, createActivity, getActivityByName } = require('../db')

// GET /api/activities/:activityId/routines
activitiesRouter.get('/:activityId/routines', async (req, res, next) => {

    try {
        const { activityId } = req.params
        const allActivities = await getAllActivities()
        const activity = await allActivities.find(activity => activity.id == activityId)

        if (!activity) {
            next({
                error: "NoActivityId",
                message: "Activity 10000 not found",
                name: "NoId"
            })
        }
        else if (activity) {

            const routines = await getPublicRoutinesByActivity(activity)

            res.send(
                routines
            )
        }

    } catch (error) {
        next(error)
    }
})
// GET /api/activities
activitiesRouter.get('/', async (req, res, next) => {

    try {
        const allActivities = await getAllActivities()
        res.send(
            allActivities
        )
    } catch (error) {
        next(error)
    }
})

// POST /api/activities
activitiesRouter.post('/', async (req, res, next) => {
    const { name, description } = req.body

    // console.log('this is name', name)
    // console.log('this is description', description)
    if (!name || !description) {
        next({
            name: "MissingInformation",
            message: "Please enter an activity and description to continue"
        })
    }

    try {
        const _activity = await getActivityByName(name)

        if (!req.user) {
            res.status(401).send({
                error: "NotAthorized",
                message: "You must be logged in to perform this action",
                name: "notLoggedIn"
            })
        }
        else if (_activity) { 
            next({
                error: "AlreadyExists",
                message: `An activity with name ${name} already exists`,
                name: "AlreadyExistsError"
            })
        }
        else if (req.user) {
            const activity = await createActivity({name: name, description: description})
            console.log("this is activity", activity)
              res.send({
              name, description
              })
        }
    } catch (error) {
        next(error)
    }
})
// PATCH /api/activities/:activityId

activitiesRouter.use((error, req, res, next) => {
    res.send(error)
})

module.exports = activitiesRouter;
