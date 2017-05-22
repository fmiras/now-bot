import NowClient from 'now-client'

import {sendMessage} from '../chat'
import {newUser, getToken} from '../user'
import messages from './messages'

let now

export const ask = async (sender, text) => {
  // Check if we have the Now API token
  const token = await getToken(sender)
  if (!token) {
    // Check if is the token message
    if (text.length === 24) {
      sendMessage(sender, { text: messages.TOKEN_VALIDATION })
      // Token validation
      if (await validateToken(text)) {
        try {
          await newUser(sender, text)
          return { text: messages.VALID_TOKEN }
        } catch (e) {
          return { text: messages.SERVICE_UNAVAILABLE }
        }
      }
      return { text: messages.INVALID_TOKEN }
    }
    return { text: messages.MISSING_TOKEN }
  }

  // After all validations we get the answer
  now = new NowClient(token)
  const intention = getIntention(text)
  return getMessage(intention)
}

// TODO Resolve with NLP maybe?
const getIntention = (text) => {
  if (text.indexOf('deployments') > -1) {
    return 'List deployments'
  }
  return 'unknown'
}

const getMessage = async (intention) => {
  switch (intention) {
    case 'List deployments':
      return getDeploymentsMessage()
    default:
      return undefined
  }
}

const validateToken = async (text) => {
  const tmpNow = new NowClient(text)
  const deployments = await tmpNow.getDeployments()
  return deployments
}

const getDeploymentsMessage = async () => {
  const deployments = await now.getDeployments()
  if (!deployments || deployments.length === 0) {
    return { text: messages.NO_DEPLOYMENTS }
  }

  // Message meta
  const message = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: messages.DEPLOYMENTS,
        buttons: []
      }
    }
  }
  // Each deployment as button
  for (const deployment of deployments) {
    const button = { type: 'web_url' }
    button.title = deployment.name
    button.url = deployment.url
    message.attachment.payload.buttons.push(button)
  }

  return message
}
