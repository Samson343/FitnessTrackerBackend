const express = require('express');
const routineActRouter = express.Router();

const { isAuthorized } = require('./utils')
const { getRoutineActivityById, 
        getRoutineById, 
        getUserById, 
        updateRoutineActivity, 
        destroyRoutineActivity
      } = require('../db')

// PATCH /api/routine_activities/:routineActivityId
routineActRouter.patch('/:routineActivityId', isAuthorized, async (req, res, next) => {
    try {
        const { routineActivityId } = req.params

        const routineAct = await getRoutineActivityById(routineActivityId)
        const routine = await getRoutineById(routineAct.routineId)
        const user = await getUserById(req.user.id)

        if (req.user.id !== routine.creatorId) {
            res.status(403).send({
                error: "CannotEditPost",
                name: 'UnauthorizedUserError',
                message: `User ${user.username} is not allowed to update ${routine.name}`
            })
        }
        else {
            const { count, duration } = req.body
            const updateFields = {}

            updateFields.id = routineActivityId

            if (count) {
                updateFields.count = count
            }
            if (duration) {
                updateFields.duration = duration
            }

            const updatedRoutineAct = await updateRoutineActivity(updateFields)
            res.send(updatedRoutineAct)
        }
    } catch (error) {
        next(error)
    }
})

// DELETE /api/routine_activities/:routineActivityId
routineActRouter.delete('/:routineActivityId', isAuthorized, async (req, res, next) => {
    const { routineActivityId } = req.params

    try {
        const routineAct = await getRoutineActivityById(routineActivityId)
        const routine = await getRoutineById(routineAct.routineId)
        const user = await getUserById(req.user.id)

        if (!routineAct) {
            next({
                message: "no routine_activity with that Id"
            })
        }
        if (req.user.id !== routine.creatorId) {
            res.status(403).send({
                error: "CannotEditRoutineActivity",
                name: 'UnauthorizedUserError',
                message: `User ${user.username} is not allowed to delete ${routine.name}`
            })
        } else {
        await destroyRoutineActivity(routineActivityId)
        res.send(routineAct)
        }
    } catch (error) {
        next(error)
    }
})

module.exports = routineActRouter;
