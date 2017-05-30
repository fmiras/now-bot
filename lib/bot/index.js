import NowClient from 'now-client'

import {sendMessage} from '../chat'
import {newUser, getToken} from '../user'
import messages from './messages'
import now from '../now'

let nowClient
let sender

export const ask = async (id, text) => {
  sender = id
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
  nowClient = new NowClient(token)
  const intention = getIntention(text)
  const data = getData(intention, text)
  return getMessage(intention, data)
}

const validateToken = async (text) => {
  const tmpNow = new NowClient(text)
  const deployments = await tmpNow.getDeployments()
  return deployments
}

// TODO Resolve with NLP maybe?
const getIntention = (text) => {
  text = text.toLowerCase()
  if (text.indexOf('deployments') > -1) {
    return 'List deployments'
  }
  if (text.indexOf('deploy') > -1) {
    return 'New deployment'
  }
  return 'unknown'
}

const getData = (intention, text) => {
  if (intention === 'New deployment') {
    const words = text.split(' ')
    return { repository: words[1] }
  }
}

const getMessage = async (intention, data) => {
  switch (intention) {
    case 'List deployments':
      return getDeploymentsMessage()
    case 'New deployment':
      return getDeployMessage(data)
    default:
      return getUnknownMessage()
  }
}

const getDeploymentsMessage = async () => {
  sendMessage(sender, { text: messages.CHECKING })
  let deployments = await nowClient.getDeployments()
  if (!deployments || deployments.length === 0) {
    return { text: messages.NO_DEPLOYMENTS }
  }
  deployments = deployments.slice(-3)

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
    button.title = deployment.url
    button.url = deployment.url
    message.attachment.payload.buttons.push(button)
  }

  return message
}

const getDeployMessage = async (data) => {
  sendMessage(sender, { text: messages.DEPLOYING })
  console.log('DeployMessage' + data.repository)
  const url = await now(data.repository)
  return { text: messages.DEPLOYMENT_OK.replace('{deployment_url}',
    url)}
}

const getUnknownMessage = () => {
  return { text: messages.UNKNOWN }
}
