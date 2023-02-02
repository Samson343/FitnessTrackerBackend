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


  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getAllRoutines() {
  try{

    const { rows: routines } = await client.query (`
      SELECT *
      FROM routines;
      `)
    
    
    return routines
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getAllPublicRoutines() {
  try{
    const { rows: routines } = await client.query (`
    SELECT *
    FROM routines
    WHERE "isPublic" = true;
    `)
  
    return routines
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getAllRoutinesByUser({ username }) {
  try{

    const user = await getUserByUsername(username)

    const { rows: routines } = await client.query (`
    SELECT *
    FROM routines
    WHERE "creatorId" = $1;
    `, [user.id])

    return routines

  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getPublicRoutinesByUser({ username }) {
  try{
    const user = await getUserByUsername(username)
    const routines = await getAllPublicRoutines()

    const publicByUser = routines.filter(routine => routine.creatorId === user.id)

    return publicByUser
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try{

  } catch (error) {
    console.error(error)
    throw error
  }
}

async function updateRoutine({ id, ...fields }) {
  try{

  } catch (error) {
    console.error(error)
    throw error
  }
}

async function destroyRoutine(id) {
  try{

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
