import {MongoClient} from 'mongodb'
import cfg from '../db.config'

const url = `mongodb://now-bot:${process.env.MONGO_PASSWORD}@${cfg.hosts}/${process.env.NODE_ENV}?ssl=true&replicaSet=now-bot-shard-0&authSource=admin`

// Creation of new chatbot user
export const newUser = async (user, token) => {
  let db = await MongoClient.connect(url)
  let users = db.collection('users')
  users.insert({username: user, token: token})
  db.close()
}

export const getToken = async (username) => {
  console.log('[INFO] Getting token of user ' + username)
  try {
    const user = await getUser(username)
    return user.token
  } catch (e) {
    console.log('[INFO] Token not found for user "%s"', username)
    console.log('[ERROR] Exception %s', e)
  }
}

const getUser = async (username) => {
  let db = await MongoClient.connect(url)
  let users = db.collection('users')
  let array = await users.find({username: username}).toArray()
  db.close()
  return array[0]
}
