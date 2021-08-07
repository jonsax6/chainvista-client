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
  console.log(store.token)
	$('#sign-in-form').trigger('reset')
	$('.login-forms').hide()
	$('#sign-out-btn').show()
	$('#sign-up-error').hide()
}

const onSignInFailure = (error) => {
	$('#login-title').hide()
	$('#user-login-message').show()
	$('#user-login-message').text('Account not found.  Try another account.')
}

const onSignOutSuccess = () => {
    $('.login-forms').show()
}

const onTransactionSuccess = (response) => {
	$('#transaction-table').text('')
  api.index()
    .then(onIndexSuccess)
    .catch(error => console.error(error))
}

const onIndexSuccess = (response) => {
  const data = response.transaction
  // iterate over the data array backwards (most recent first)
  data.slice().reverse().forEach(transaction => {
		const coin = transaction.coin
		const symbol = transaction.symbol
		const price = transaction.price
		const quantity = transaction.quantity
		const orderType = transaction.orderType
		$('#transaction-form').trigger('reset')
		$('#transaction-table').append(
			`<tr>
		      <th class="text-light" scope="row">${coin}</td>
		      <td class="text-right text-light">${symbol}</td>
		      <td class="text-right text-light">${actions.formatter.format(price)}</td>
		      <td class="text-right text-light">${quantity}</td>
		      <td class="text-right text-light">${orderType}</td>
		  </tr>`
		)
	})
}


const onTransactionFailure = (error) => {
	console.log(error)
}
module.exports = {
	onSignUpSuccess,
	onSignUpFailure,
	onSignInSuccess,
	onSignInFailure,
	onSignOutSuccess,
	onTransactionSuccess,
	onTransactionFailure, 
}