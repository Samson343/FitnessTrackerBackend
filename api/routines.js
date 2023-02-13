const express = require('express');
const routinesRouter = express.Router();

const { getAllPublicRoutines,
    createRoutine,
    getRoutineById,
    updateRoutine,
    getUserById,
    destroyRoutine,
    addActivityToRoutine,
    getRoutineActivitiesByRoutine
} = require('../db')
const { isAuthorized } = require('./utils')

// GET /api/routines
routinesRouter.get('/', async (req, res, next) => {
    try {
        const routines = await getAllPublicRoutines()

        res.send(
            routines
        )
    } catch (error) {
        next(error)
    }
})

// POST /api/routines
routinesRouter.post('/', isAuthorized, async (req, res, next) => {
    try {
        const { name, goal, isPublic } = req.body
        const routineReq = {
            id: req.user.id,
            name: name,
            goal: goal,
            isPublic: isPublic
        }

        if (name && goal) {
            const routine = await createRoutine(routineReq)

            routine.creatorId = req.user.id

            res.send(
                routine
            )
        }
    } catch (error) {
        next(error)
    }
})

// PATCH /api/routines/:routineId
routinesRouter.patch('/:routineId', isAuthorized, async (req, res, next) => {
    try {
        const { routineId } = req.params
        const routine = await getRoutineById(routineId)
        const user = await getUserById(req.user.id)

        if (req.user.id !== routine.creatorId) {
            res.status(403).send({
                error: "CannotEditPost",
                name: 'UnauthorizedUserError',
                message: `User ${user.username} is not allowed to update ${routine.name}`
            })
        }
        else {
            const { name, goal, isPublic } = req.body
            const updateFields = {}
            updateFields.id = routineId

            if (isPublic === true || isPublic === false) {
                updateFields.isPublic = isPublic
            }
            if (name) {
                updateFields.name = name
            }
            if (goal) {
                updateFields.goal = goal
            }

            const updatedRoutine = await updateRoutine(updateFields)
            res.send(updatedRoutine)
        }
    } catch (error) {
        next(error)
    }
})

// DELETE /api/routines/:routineId

routinesRouter.delete('/:routineId', isAuthorized, async (req, res, next) => {
    const { routineId } = req.params

    try {
        const routine = await getRoutineById(routineId)
        const user = await getUserById(req.user.id)

        if (!routine) {
            next({
                message: "no routine with that Id"
            })
        }
        if (req.user.id !== routine.creatorId) {
            res.status(403).send({
                error: "CannotEditRoutine",
                name: 'UnauthorizedUserError',
                message: `User ${user.username} is not allowed to delete ${routine.name}`
            })
        }
        await destroyRoutine(routineId)

        res.send(routine)
    } catch (error) {
        next(error)
    }
})

// POST /api/routines/routineId/activities

routinesRouter.post('/:routineId/activities', async (req, res, next) => {
    const { routineId } = req.params
    const { activityId, count, duration } = req.body;
    const fields = {
        routineId,
        activityId,
        count,
        duration
    }

    function duplicateHelper(routine_act) {

        for (let i = 0; i < routine_act.length; ++i) {
            let curRoutAct = routine_act[i]

            if (curRoutAct.activityId === fields.activityId) {
                next({
                    error: "DuplicateError",
                    message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
                    name: "Acitivity already exists"
                })
                return false
            }
        }
        return true
    }

    try {

        const routine = await getRoutineById(routineId)
        const routine_act = await getRoutineActivitiesByRoutine(routine)

        if (duplicateHelper(routine_act)) {
            const addActivity = await addActivityToRoutine(fields)
            res.send(addActivity)
        }

    } catch (error) {
        next(error)
    }
})

routinesRouter.use((error, req, res, next) => {
    res.send(error)
})

module.exports = routinesRouter;
