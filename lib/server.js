import { send } from 'micro'
import { router, get, post } from 'microrouter'
import request from 'request';

const index = () => "This is index URL"
const webhook = {}

const token = "EAABZClKomHOoBAEuC7fJHNZCkbpKNxwkIcZCm6YEDozzRvLyVqQCCt9GxYz3rqrtZAFrgKFt05ZALInjOEmlheDnquOCGRORlsMMryVTxAMKkb0E8ZBTCVZAO54baagW8kZBEjarZB5hdFW4KBjTaGdBkn4DhwC9Uk2wPCDxW5NIwcwZDZD"

const sendTextMessage = (sender, text) => {
    const messageData = {}
    messageData.text = text
    request({
	    url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token:token},
	    method: 'POST',
		json: {
		    recipient: {id:sender},
			message: messageData,
		}
	}, (error, response) => {
		if (error) {
		    console.log('Error sending messages: ', error)
		} else if (response.body.error) {
		    console.log('Error: ', response.body.error)
	    }
    })
}

webhook.get = (req) => {
  if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		return req.query['hub.challenge']
	}
	return 'Error, wrong token'
}

webhook.post = (req, res) => {
    const messagingEvents = req.body.entry[0].messaging
    messagingEvents.forEach( (event) => {
	    const sender = event.sender.id
	    if (event.message && event.message.text) {
		    const text = event.message.text
		    sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
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
