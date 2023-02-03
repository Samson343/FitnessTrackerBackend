const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  try {
    const { rows: [activity] } = await client.query(`
    INSERT INTO activities (name, description)
    VALUES($1, $2)
    ON CONFLICT (name) DO NOTHING
    RETURNING *;
  `, [name, description])

    return activity

  } catch (error) {
    console.error(error)
    throw error
  }

}

async function getAllActivities() {
  // select and return an array of all activities
  try {
    const { rows } = await client.query(`
      SELECT *
      FROM activities;
    `)

    return rows
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getActivityById(id) {
  try {
    const { rows: [activity] } = await client.query(`
    SELECT *
    FROM activities
    WHERE id = $1;
  `, [id])

    return activity
  } catch (error) {
    console.error(error)
    throw error
  }

}

async function getActivityByName(name) {
  try {
    const { rows: [activity] } = await client.query(`
      SELECT *
      FROM activities
      WHERE name = $1;
    `, [name])

    return activity
  } catch (error) {
    console.error(error)
    throw error
  }

}

async function attachActivitiesToRoutines(routines) {
  // select and return an array of all activities
  // const activites = await getAllActivities()

  const { rows: [routine] } = await client.query (`
    SELECT *
    FROM activities
    JOIN routine_activities
    ON routine_activities."activityId" = activities.id
    WHERE routine_activities."routineId"=$1;
  `, [routines.id])

  // console.log("this is routine", routine) 

  

  return routine
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity

  //the "set" line of the query will look something like SET "name"=$2, "description"=$3 with the code below - pulling those values from Object.values(fields) which returns an array of all values in the object - this dynamically lets you update only the fields that are passed in
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`)
    .join(', ')

  try {
    if (setString.length) {
      const { rows: [activity] } = await client.query(`
      UPDATE activities
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
    `, Object.values(fields))

      return activity
    }


  } catch (error) {
    console.error(error)
    throw error
  }

}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
