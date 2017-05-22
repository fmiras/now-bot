import {getToken, __RewireAPI__ as UserRewireApi} from '../lib/user'

const TOKEN_STRING = '24-digits-text-as-token!'

const userMock = { token: TOKEN_STRING }

test('Successfully get existing token of a user', async () => {
  UserRewireApi.__Rewire__('getUser', async () => userMock)
  const token = await getToken('sender-id')
  expect(token).toBe(TOKEN_STRING)
})

test('Token of user not found', async () => {
  UserRewireApi.__Rewire__('getUser', async () => {
    throw new Error('user not found')
  })
  const token = await getToken('sender-id')
  expect(token).toBeFalsy()
})
