const express = require('express');
const routinesRouter = express.Router();

const { getAllPublicRoutines,
    createRoutine,
    getRoutineById,
    updateRoutine
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

        if (req.user.id !== routine.creatorId) {
            res.status(403).next({
                name: 'UnauthorizedUserError',
                message: 'You cannot update a routine that is not yours'
            })
        }
        else {
            const { name, goal, isPublic } = req.body
            const updateFields = {}
            updateFields.id = routineId
              
            if (isPublic) {
                updateFields.isPublic = isPublic
            }
            if (name) {
                updateFields.name = name
            }
            if (goal) {
                updateFields.goal = goal
            }

            const updatedRoutine = await updateRoutine(updateFields)

            res.send( updatedRoutine )
        }
    } catch (error) {
        next(error)
    }
})

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = routinesRouter;
