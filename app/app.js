// use require with a reference to bundle the file and use it in this file
// const example = require('./example')

// use require without a reference to ensure a file is bundled
// require('./example')
const authEvents = require('./auth/events')
const store = require('./store')
const events = require('./auth/events')

$(() => {
  $('#sign-up-form').on('submit', authEvents.onSignUp)
	$('#sign-in-form').on('submit', authEvents.onSignIn)
	$('#sign-out-btn').on('click', authEvents.onSignOut)
  $('#transaction-form').on('submit', authEvents.onTransactionSubmit)
})
