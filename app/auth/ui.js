'use strict'
const store = require('../store')
const actions = require('./actions')
const events = require('./events')
const api = require('./api')

const onSignUpSuccess = (response) => {
	$('#sign-up-form').trigger('reset')
	$('#sign-up').hide()
	$('#login-title').text('Thank you! You can sign-in now...')
	$('#sign-up-error').hide()
	$('#sign-up-welcome').show()
}

const onSignUpFailure = () => {
	$('#sign-up-error').show()
	$('#sign-up-welcome').hide()
}

const onSignInSuccess = (response) => {
	store.token = response.user.token
	store.user = response.user.email
	$('#sign-in-form').trigger('reset')
	$('#sign-in').hide()
	$('#sign-up').hide()
	$('.forms').hide()
	$('#sign-out-btn').show()
	$('#sign-up-error').hide()
}

const onSignInFailure = (error) => {
	$('#login-title').hide()
	$('#user-login-message').show()
	$('#user-login-message').text('Account not found.  Try another account.')
}

module.exports = {
	onSignUpSuccess,
  onSignUpFailure,
  onSignInSuccess,
  onSignInFailure
}