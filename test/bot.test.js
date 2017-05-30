import {nowStub, emptyNow, bigNow} from './stub/now'
import {ask, __RewireAPI__ as BotRewireApi} from '../lib/bot'
import messages from '../lib/bot/messages'

beforeEach(() => {
  // We stub this so the test don't try to actually send a request to FB
  BotRewireApi.__Rewire__('sendMessage', async () => undefined)
  // This is to simulate an authenticated session
  BotRewireApi.__Rewire__('getToken', async () => 'no-token')
})

// Deployments listing
test('List 2 real deployments', async () => {
  BotRewireApi.__Rewire__('NowClient', nowStub)
  const sendMessageMock = jest.fn()
  BotRewireApi.__Rewire__('sendMessage', sendMessageMock)

  const answer = await ask(undefined, 'List all my deployments')
  expect(sendMessageMock.mock.calls[0][1].text).toBe(messages.CHECKING)
  expect(answer.attachment.payload.buttons.length).toBe(2)
  expect(answer.attachment.payload.buttons[0].url)
    .toBe('my-project-wtbxvynenu.now.sh')
})

test('Try to list a non-deployment account', async () => {
  BotRewireApi.__Rewire__('NowClient', emptyNow)
  const sendMessageMock = jest.fn()
  BotRewireApi.__Rewire__('sendMessage', sendMessageMock)

  const answer = await ask(undefined, 'List all my deployments')
  expect(sendMessageMock.mock.calls[0][1].text).toBe(messages.CHECKING)
  expect(answer.text).toBe(messages.NO_DEPLOYMENTS)
})

test('List deployments with account with too many links', async () => {
  BotRewireApi.__Rewire__('NowClient', bigNow)
  const sendMessageMock = jest.fn()
  BotRewireApi.__Rewire__('sendMessage', sendMessageMock)

  const answer = await ask(undefined, 'List all my deployments')
  expect(sendMessageMock.mock.calls[0][1].text).toBe(messages.CHECKING)
  expect(answer.attachment.payload.buttons.length).toBeLessThan(4)
})

// Authentication
test('Do anything without authentication', async () => {
  BotRewireApi.__Rewire__('getToken', async () => undefined)

  const answer = await ask(undefined, 'List all my deployments')
  expect(answer.text).toBe(messages.MISSING_TOKEN)
})

test('First authentication for user with valid token', async () => {
  BotRewireApi.__Rewire__('getToken', async () => undefined)
  BotRewireApi.__Rewire__('validateToken', async () => true)
  BotRewireApi.__Rewire__('newUser', async () => true)
  const sendMessageMock = jest.fn()
  BotRewireApi.__Rewire__('sendMessage', sendMessageMock)

  const answer = await ask(undefined, '24-digits-text-as-token!')
  expect(sendMessageMock.mock.calls[0][1].text).toBe(messages.TOKEN_VALIDATION)
  expect(answer.text).toBe(messages.VALID_TOKEN)
})

test('First authentication for user with invalid token', async () => {
  BotRewireApi.__Rewire__('getToken', async () => undefined)
  BotRewireApi.__Rewire__('validateToken', async () => false)
  const sendMessageMock = jest.fn()
  BotRewireApi.__Rewire__('sendMessage', sendMessageMock)

  const answer = await ask(undefined, '24-digits-text-as-token!')
  expect(sendMessageMock.mock.calls[0][1].text).toBe(messages.TOKEN_VALIDATION)
  expect(answer.text).toBe(messages.INVALID_TOKEN)
})

test('First authentication with mongo unavailable', async () => {
  BotRewireApi.__Rewire__('getToken', async () => undefined)
  BotRewireApi.__Rewire__('validateToken', async () => true)
  BotRewireApi.__Rewire__('newUser', async () => {
    throw new Error('firebase not working')
  })

  const answer = await ask(undefined, '24-digits-text-as-token!')
  expect(answer.text).toBe(messages.SERVICE_UNAVAILABLE)
})

// Generic message
test('Unknown question, answer with generic message', async () => {
  const answer = await ask(undefined, 'Make an Expecto Patronum!')
  expect(answer.text).toBe(messages.UNKNOWN)
})

// Deployments
test('Deploy a GitHub project', async () => {
  const nowMock = jest.fn()
  BotRewireApi.__Rewire__('now', nowMock)
  const deploymentUrl = 'my-project-wtbxvyaenu.now.sh'
  nowMock.mockReturnValueOnce(deploymentUrl)
  const sendMessageMock = jest.fn()
  BotRewireApi.__Rewire__('sendMessage', sendMessageMock)

  const answer = await ask(undefined, 'Deploy fmiras/site')
  expect(sendMessageMock.mock.calls[0][1].text).toBe(messages.DEPLOYING)
  expect(nowMock.mock.calls[0][0]).toBe('fmiras/site')
  expect(answer.text).toBe(messages.DEPLOYMENT_OK.replace('{deployment_url}',
    deploymentUrl))
})
