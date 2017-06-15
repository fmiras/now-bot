const readline = require('readline')
const rewire = require('rewire')
const chat = rewire('../dist/chat')
const bot = rewire('../dist/bot')

const sendMessage = (msg) => {
  return new Promise(resolve => {
    console.log(`BOT: ${JSON.stringify(msg)}`)
    resolve()
  })
}

// Replace sendMessage facebook request function to a socket.io one
chat.__set__('sendMessage', sendMessage)
bot.__set__('_chat', chat)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('Bot waiting for questions!')

const waitForQuestion = () => {
  rl.question('> ', (answer) => {
    bot.ask('test', answer).then(data => {
      sendMessage(data).then(waitForQuestion)
    })
  })
}

waitForQuestion()
