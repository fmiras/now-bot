import { send, json } from 'micro'
import { router, get, post } from 'microrouter'
import request from 'request'

const index = () => 'This is index URL'
const webhook = {}

const token = process.env.ACCESS_TOKEN

const sendTextMessage = (sender, text) => {
  const messageData = {}
  messageData.text = text
  request(
    {
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: token },
      method: 'POST',
      json: {
        recipient: { id: sender },
        message: messageData
      }
    },
    (error, response) => {
      if (error) {
        console.log('Error sending messages: ', error)
      } else if (response.body.error) {
        console.log('Error: ', response.body.error)
      }
    }
  )
}

webhook.get = req => {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    return req.query['hub.challenge']
  }
  return 'Error, wrong token'
}

webhook.post = async (req, res) => {
  const body = await json(req);
  const messagingEvents = body.entry[0].messaging
  messagingEvents.forEach(event => {
    const sender = event.sender.id
    if (event.message && event.message.text) {
      const text = event.message.text
      sendTextMessage(sender, 'Text received, echo: ' + text.substring(0, 200))
    }
  })
  send(res, 200)
}

export default router(
  get('/', index),
  get('/webhook', webhook.get),
  post('/webhook', webhook.post)
)

/*

App.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
	    let event = req.body.entry[0].messaging[i]
	    let sender = event.sender.id
	    if (event.message && event.message.text) {
		    let text = event.message.text
				if (text === 'Generic') {
			    sendGenericMessage(sender)
		    	continue
		    }
		    sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
	    }
    }
    res.sendStatus(200)
})

*/
