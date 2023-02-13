const client = require("./client");
// const { getRoutineById } = require("./routines")

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const { rows: [routineWithActs] } = await client.query(`
      INSERT INTO routine_activities ( "routineId", "activityId", count, duration )
      VALUES($1, $2, $3, $4)
      RETURNING *;
    `, [routineId, activityId, count, duration])

    return routineWithActs
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getRoutineActivityById(id) {
  try {
    const { rows: [routine_act] } = await client.query(`
       SELECT *
       FROM routine_activities
       WHERE id = $1;
     `, [id])

    return routine_act
  } catch (error) {
    console.error(error)
    throw error
  }

}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows } = await client.query(`
      SELECT *
      FROM routine_activities
      WHERE "routineId" = $1;
    `, [id])

    return rows
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  try {

    const setString = Object.keys(fields).map((key, index) => {
      return `"${key}"=$${index + 1}`
    }).join(", ")

    if (setString.length) {
      const { rows: [routine_act] } = await client.query(`
        UPDATE routine_activities
        SET ${setString}
        WHERE "routineId" = ${id}
        RETURNING *;
    `, Object.values(fields))

      return routine_act
    }

  } catch (error) {
    console.error(error)
    throw error
  }
}

async function destroyRoutineActivity(id) {
  try {
    const { rows: [routine_act] } = await client.query(`
      DELETE 
      FROM routine_activities
      WHERE id = $1
      RETURNING *;
   `, [id])

    return routine_act
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const routine_act = await getRoutineActivityById(routineActivityId)
    const routine = await getRoutineById(routine_act.routineId)

    if (routine.creatorId === userId) {
      return true
    } else {
      return false
    }

  } catch (error) {
    console.error(error)
    throw error
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};


// for whatever reason it was not possible to import this function from routines.js even with proper exportation and const { getRoutineById } = require("./routines") syntax. I'm able to import/export similar functions between files without issue so I'm not sure what why it doesn't like this one in particular!

async function getRoutineById(id) {
  try{
    const { rows: [routine] } = await client.query (`
      SELECT *
      FROM routines
      WHERE id = $1;
    `, [id])

    return routine
  } catch (error) {
    console.error(error)
    throw error
  }

}
