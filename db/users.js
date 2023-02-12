const client = require("./client");
const SALT_COUNT = 10;
const bcrypt = require('bcrypt');

async function createUser ({username, password }) {
  // eslint-disable-next-line no-useless-catch
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT)
    const { rows: [user] } = await client.query (`
        INSERT INTO users(username, password)
        VALUES ($1, $2)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `, [username, hashedPassword]);
  
          delete user.password
        return user;
      } catch (error) {
        throw error;
      }
    
  };


// database functions

// user functions

async function getUser({ username, password }) {
  // console.log(password)
  const user = await getUserByUsername(username);
  // consol.log(user)
  const hashedPassword = user.password;
  const isValid = await bcrypt.compare(password, hashedPassword)
  if (isValid) {
    delete user.password
    return user
  }

}

                       

// async function getUserById(userId) {
//   // eslint-disable-next-line no-useless-catch
//   try {
//     const { rows: [user] } = await client.query(
//       `SELECT id, username 
//       WHERE id=${userId};`
//     );  

//     if (!user) {
//       return null;
//     }

   
//     return user;
//   } catch (error) {
//     throw error;
//   }
// }

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






async function getUserByUsername(username) {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows: [user] } = await client.query(
      `SELECT * FROM users WHERE username=$1`,
      [username]
    );
    return user;
  } catch (error) {
    throw error;
  }
}



module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
