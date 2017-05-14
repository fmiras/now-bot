import firebase from 'firebase'

firebase.initializeApp({
  serviceAccount: {
    projectId: 'now-bot',
    clientEmail: 'now-bot@now-bot.iam.gserviceaccount.com',
    private_key: process.env.FIREBASE_PRIVATE_KEY || 'test-only'
  },
  databaseURL: 'https://now-bot.firebaseio.com'
})

// Creation of new chatbot user
export const newUser = (user, token) => {
  // Save it on firebase
  firebase.database().ref('users/' + user).set({token: token})
}

export const getToken = async (user) => {
  console.log('[FIREBASE] Getting token of user ' + user)
  const snapshot = await firebase.database().ref('users/' + user).once('value')
  return snapshot.val().token
}
