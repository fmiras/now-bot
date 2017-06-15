import {MongoClient} from 'mongodb'

const url = process.env.MONGO_URL

// Creation of new chatbot user
export const newUser = async (user, token) => {
  let db = await MongoClient.connect(url)
  let users = db.collection('users')
  users.insert({username: user, token: token})
  db.close()
}

export const getToken = async (username) => {
  console.log(`[INFO] Getting token of user ${username}`)
  try {
    const user = await getUser(username)
    return user.token
  } catch (e) {
    console.log(`[INFO] Token not found for user ${username}`)
    console.log(`[ERROR] Exception ${e}`)
  }
}

const getUser = async (username) => {
  let db = await MongoClient.connect(url)
  let users = db.collection('users')
  let array = await users.find({username: username}).toArray()
  db.close()
  return array[0]
}
