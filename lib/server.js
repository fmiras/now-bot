import {send, json} from 'micro'
import {router, get, post} from 'microrouter'

import {ask} from './bot'
import {sendMessage} from './chat'

const index = () => 'This is index URL'

const webhook = {}

webhook.get = req => {
  const verifyToken = process.env.FB_VERIFY_TOKEN
  if (req.query['hub.verify_token'] === verifyToken) {
    console.log('Facebook webhook subscription confirmed')
    return req.query['hub.challenge']
  }
  return 'Error, wrong token'
}

webhook.post = async (req, res) => {
  const body = await json(req)
  const messagingEvents = body.entry[0].messaging
  console.log('Messaging events: ' + JSON.stringify(messagingEvents))
  for (let event of messagingEvents) {
    const sender = event.sender.id
    if (event.message && event.message.text) {
      const text = event.message.text
      console.log('New incoming message: "' + text + '" from ' + sender)
      const answer = await ask(sender, text)
      sendMessage(sender, answer)
    }
  }
  send(res, 200)
}

export default router(
  get('/', index),
  get('/webhook', webhook.get),
  post('/webhook', webhook.post)
)
