import nowClient from 'now-client'

const now = nowClient('token')

export const ask = async (sender, text) => {
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
