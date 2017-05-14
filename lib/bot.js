import NowClient from 'now-client'

import {sendMessage} from './chat'
import {isAuthenticated, newUser, getToken} from './user'

let now

export const ask = async (sender, text) => {
  // Check if we have the Now API token
  if (!await isAuthenticated(sender)) {
    // Is this the token message?
    if (text.length === 24) {
      sendMessage(sender, { text: 'Validating token...' })
      // Token validation
      if (validateToken(text)) {
        newUser(sender, text)
        return { text: 'Excellent! You are now able to list your deployments.' }
      }
      return { text: 'Your token isn\'t working :(, please resend it!' }
    }
    return { text: 'Ups! It seems that we didn\'t setup any API token yet, ' +
      'give it to me after this message (if you didn\'t create the token do' +
      ' it here: https://zeit.co/account/tokens)'}
  }

  // After all validations we get the answer
  now = new NowClient(await getToken(sender))
  const intention = getIntention(text)
  return getMessage(intention)
}

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

const validateToken = (text) => {
  const deployments = new NowClient(text).getDeployments()
  return deployments
}

const getDeploymentsMessage = async () => {
  const deployments = await now.getDeployments()
  if (!deployments || deployments.length === 0) {
    return { text: 'There are no deployments for this account!' }
  }

  // Message meta
  const message = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: 'List of deployments: ',
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
