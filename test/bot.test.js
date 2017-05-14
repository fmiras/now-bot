import {nowMock, emptyNow} from './mock/now'
import {ask, __RewireAPI__ as BotRewireApi} from '../lib/bot'

beforeEach(() => {
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
  expect(answer.text).toBe('There are no deployments for this account!')
})
