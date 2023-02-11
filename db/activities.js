const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  try{
    const { rows: [activity] } = await client.query (`
      INSERT INTO activities (name, description)
      VALUES ($1, $2)
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
    const { rows: activities } = await client.query(`
    SELECT *
    FROM activities;
`);
    return activities;
  } catch (error) {
    console.log("Error getting activities")
    throw error;
  }
}

async function getActivityById(id) {
  try {
    const { rows: [activity] } = await client.query(`
    SELECT *
    FROM activities
    WHERE id=$1
    `, [id]);

    return activity;
  } catch (error) {
    console.log("Error getting activity by Id")
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    const { rows: [activity] } = await client.query(`
    SELECT *
    FROM activities
    WHERE name=$1
    `, [name]);

    return activity;
  } catch (error) {
    console.log("Error getting activity by name")
    throw error;
  }
}

async function attachActivitiesToRoutines(routine) {
  // select and return an array of all activitiesh
  const { rows: activities } = await client.query(`
    SELECT "routineId", "activityId" AS id, routine_activities.id AS "routineActivityId", duration, count, name, description
    FROM activities
    JOIN routine_activities
    ON routine_activities."activityId" = activities.id
    WHERE routine_activities."routineId"=$1;
  `, [routine.id])

  routine.activities = activities

  return routine
}


async function updateActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map((key, index) => `"${key}"=$${index + 1}`).join(",");
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  try{
    if (setString.length > 0) {
      const { rows } = await client.query(
        `UPDATE activities 
        SET ${setString}
        WHERE id = ${id}
        RETURNING *;
      `, Object.values(fields));
      return rows[0]; 
    }
  }catch (error){
    console.log(error);
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
