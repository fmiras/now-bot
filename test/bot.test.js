import { ask, __RewireAPI__ as BotRewireApi } from '../lib/bot'

test('List 2 real deployments', async () => {
  const nowMock = {}
  nowMock.getDeployments = async () => [
    {
      uid: '7Npest0z1zW5QVFfNDBId4BW',
      name: 'my-project',
      url: 'my-project-wtbxvynenu.now.sh',
      created: '1460801613968'
    },
    {
      uid: 'dOgCUIoovYiYmXbrLX0h9qDk',
      name: 'project-b',
      url: 'project-b-iipihlfrpa.now.sh',
      created: '1462738579605'
    }
  ]

  BotRewireApi.__Rewire__('now', nowMock)

  const answer = await ask(undefined, 'List all my deployments')
  expect(answer.attachment.payload.buttons.length).toBe(2)
  expect(answer.attachment.payload.buttons[0].url)
    .toBe('my-project-wtbxvynenu.now.sh')
})

test('Try to list a non-deployment account', async () => {
  const emptyNow = {}
  emptyNow.getDeployments = async () => []
  BotRewireApi.__Rewire__('now', emptyNow)

  const answer = await ask(undefined, 'List all my deployments')
  expect(answer.text).toBe('There are no deployments for this account!')
})
