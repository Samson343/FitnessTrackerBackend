const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");
const { addActivityToRoutine } = require("./routine_activities");

const { getUserByUsername } = require("./users")

async function createRoutine({ creatorId, isPublic, name, goal }) {

  try{

    const { rows: [routine] } = await client.query (`
      INSERT INTO routines( "creatorId", "isPublic", name, goal)
      VALUES($1, $2, $3, $4)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
    `, [creatorId, isPublic, name, goal])

    return routine
  } catch (error) {
    console.error(error)
    throw error
  }

}

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

async function getRoutinesWithoutActivities() {
  try{
    const { rows: routines } = await client.query (`
      SELECT *
      FROM routines
    `)

    return routines
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getAllRoutines() {
  try{

    const { rows: routines } = await client.query (`
      SELECT users.username AS "creatorName", routines.*
      FROM routines
      JOIN users ON users.id = routines."creatorId";
      `)

      const withActivities = await Promise.all(routines.map(attachActivitiesToRoutines))
   
    return withActivities
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getAllPublicRoutines() {
  try{
    const { rows: routines } = await client.query (`
    SELECT users.username AS "creatorName", routines.*
    FROM routines
    JOIN users ON users.id = routines."creatorId"
    WHERE "isPublic" = true;
    `)

    const withActivities = await Promise.all(routines.map(attachActivitiesToRoutines))
  
    return withActivities
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getAllRoutinesByUser({ username }) {
  try{

    const user = await getUserByUsername(username)

    const { rows: routines } = await client.query (`
    SELECT users.username AS "creatorName", routines.*
    FROM routines
    JOIN users ON users.id = routines."creatorId"
    WHERE "creatorId" = $1;
    `, [user.id])

    const withActivities = await Promise.all(routines.map(attachActivitiesToRoutines))

    return withActivities

  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getPublicRoutinesByUser({ username }) {
  try{
    const user = await getUserByUsername(username)
    const routines = await getAllPublicRoutines()
   
    if (user) {
    const publicByUser = routines.filter(routine => routine.creatorId === user.id)

    return publicByUser
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}



async function getPublicRoutinesByActivity({ id }) {
  try{
    const allRoutines = await getAllPublicRoutines()
   
    const withActivities = allRoutines.filter(routine => { return routine.activities.length })

    const result = []

    withActivities.map (routine => {
      let filterByAct = routine.activities.filter(activity => activity.id === id)
      
      if (filterByAct.length) {
        result.push(routine)
      }
    })

    return result
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function updateRoutine({id, ...fields }) {
  console.log("this is id", id, "this is fields", fields)
  try{

    const setString = Object.keys(fields).map((key, index) => {
      return `"${ key }"=$${ index + 1 }`
    }).join(', ')

    if (setString.length) {
      const { rows: [routine] } = await client.query(`
        UPDATE routines
        SET ${ setString }
        WHERE id = ${ id }
        RETURNING *;
      `, Object.values(fields))

      return routine
    }

  } catch (error) {
    console.error(error)
    throw error
  }
}

async function destroyRoutine(id) {
  try{
    
      await client.query (`
      DELETE FROM routine_activities
      WHERE "routineId" = $1
    `, [id]) 

    const { rows:[routine] } = await client.query (`
      DELETE FROM routines
      WHERE routines.id=$1;
    `, [id])


  } catch (error) {
    console.error(error)
    throw error
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
