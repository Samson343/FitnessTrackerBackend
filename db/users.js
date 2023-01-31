const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows: [user] } = await client.query (`
      INSERT INTO users(username, password)
      VALUES($1, $2)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
    `, [username, password])

    delete user.password

    return user
  } catch (error) {
    throw error
  }
  
}

async function getUser({ username, password }) {
    const user = await getUserByUsername(username)

    if (user.password !== password) {
      return
    } else {
      delete user.password
      return user
    }
}

async function getUserById(userId) {

  try {
    const {rows: [ user ]} = await client.query (`
      SELECT id, username
      FROM users
      WHERE id = $1;
    `, [userId])

    return user
  } catch (error) {
    console.error(error)
    throw error
  }

}

async function getUserByUsername(userName) {
  try {

    const { rows: [user] } = await client.query (`
      SELECT *
      FROM users
      WHERE username = $1;
    `, [userName])

    return user

  } catch (error) {
    console.error(error)
    throw error
  }

}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
