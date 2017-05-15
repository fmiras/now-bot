import {nowMock, emptyNow} from './mock/now'
import {ask, __RewireAPI__ as BotRewireApi} from '../lib/bot'
import messages from '../lib/bot/messages'

beforeEach(() => {
  // We mock this so the test don't try to actually send a request to FB
  BotRewireApi.__Rewire__('sendMessage', async () => undefined)
  BotRewireApi.__Rewire__('getToken', async () => 'no-token')
})

test('List 2 real deployments', async () => {
  BotRewireApi.__Rewire__('NowClient', nowMock)

  const answer = await ask(undefined, 'List all my deployments')
  expect(answer.attachment.payload.buttons.length).toBe(2)
  expect(answer.attachment.payload.buttons[0].url)
    .toBe('my-project-wtbxvynenu.now.sh')
})

test('Try to list a non-deployment account', async () => {
  BotRewireApi.__Rewire__('NowClient', emptyNow)

  const answer = await ask(undefined, 'List all my deployments')
  expect(answer.text).toBe(messages.NO_DEPLOYMENTS)
})

test('Do anything without authentication', async () => {
  BotRewireApi.__Rewire__('getToken', async () => undefined)

  const answer = await ask(undefined, 'List all my deployments')
  expect(answer.text).toBe(messages.MISSING_TOKEN)
})

test('First authentication for user with valid token', async () => {
  BotRewireApi.__Rewire__('getToken', async () => undefined)
  BotRewireApi.__Rewire__('validateToken', async () => true)
  BotRewireApi.__Rewire__('newUser', async () => true)

  const answer = await ask(undefined, '24-digits-text-as-token!')
  expect(answer.text).toBe(messages.VALID_TOKEN)
})

test('First authentication for user with invalid token', async () => {
  BotRewireApi.__Rewire__('getToken', async () => undefined)
  BotRewireApi.__Rewire__('validateToken', async () => false)

  const answer = await ask(undefined, '24-digits-text-as-token!')
  expect(answer.text).toBe(messages.INVALID_TOKEN)
})

test('First authentication with firebase unavailable', async () => {
  BotRewireApi.__Rewire__('getToken', async () => undefined)
  BotRewireApi.__Rewire__('validateToken', async () => true)
  BotRewireApi.__Rewire__('newUser', async () => {
    throw new Error('firebase not working')
  })

  const answer = await ask(undefined, '24-digits-text-as-token!')
  expect(answer.text).toBe(messages.SERVICE_UNAVAILABLE)
})
