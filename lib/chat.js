import request from 'request'

export const sendMessage = (sender, message) => {
  console.log(`[INFO] New outgoing message for ${sender}:
    ${JSON.stringify(message)}`)
  request(
    {
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: process.env.FB_ACCESS_TOKEN },
      method: 'POST',
      json: {
        recipient: { id: sender },
        message: message
      }
    },
    (error, response) => {
      if (error) {
        console.log(`[ERROR] Exception sending messages: ${error}`)
      } else if (response.body.error) {
        console.log(`[ERROR] Response body with error: ${response.body.error}`)
      }
    }
  )
}
