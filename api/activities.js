const express = require('express');
const activitiesRouter = express.Router();

const { getAllActivities, getPublicRoutinesByActivity, createActivity, getActivityByName, getActivityById, updateActivity } = require('../db');
const { isAuthorized } = require('./utils');

// GET /api/activities/:activityId/routines
activitiesRouter.get('/:activityId/routines', async (req, res, next) => {

    try {
        const { activityId } = req.params
        const allActivities = await getAllActivities()
        const activity = await allActivities.find(activity => activity.id == activityId)

        if (!activity) {
            next({
                error: "NoActivityId",
                message: `Activity ${activityId} not found`,
                name: "NoId"
            })
        }
        else {
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
activitiesRouter.post('/', isAuthorized, async (req, res, next) => {
    const { name, description } = req.body

    if (!name || !description) {
        next({
            name: "MissingInformation",
            message: "Please enter an activity and description to continue"
        })
    }

    try {
        const _activity = await getActivityByName(name)

        if (_activity) {
            next({
                error: "AlreadyExists",
                message: `An activity with name ${name} already exists`,
                name: "AlreadyExistsError"
            })
        }

        await createActivity({ name: name, description: description })
        res.send({
            name, description
        })
    } catch (error) {
        next(error)
    }
})
// PATCH /api/activities/:activityId
activitiesRouter.patch('/:activityId', isAuthorized, async (req, res, next) => {

    try {
        const { activityId } = req.params
        const { name, description } = req.body
        const updateFields = {}

        if (activityId) {
            updateFields.id = activityId
        }
        if (name) {
            updateFields.name = name
        }
        if (description) {
            updateFields.description = description
        }

        const activity = await getActivityById(activityId)

        if (!activity) {
            next({
                error: "activity does not exist",
                message: `Activity ${activityId} not found`,
                name: "ActDoesNotExistError"
            })
        }
        else if (await getActivityByName(name)) {
            next ({
                error: "activity already exists",
                message: `An activity with name ${name} already exists`,
                name: 'ActAlreadyExistsError'
            })
        }
        else {
            const updatedAct = await updateActivity(updateFields)

            res.send(
                updatedAct
            )
        }
    } catch (error) {
        next(error)
    }
})

activitiesRouter.use((error, req, res, next) => {
    res.send(error)
})

module.exports = activitiesRouter;
