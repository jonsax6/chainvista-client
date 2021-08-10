'use strict'
const getFormFields = require('../../lib/get-form-fields')
const store = require('../store')
const api = require('./api')
const ui = require('./ui')
const actions = require('./actions')

const onSignUp = (event) => {
  event.preventDefault()

  // get information from event and form
  const form = event.target
  const data = getFormFields(form)

  // make an API call using ajax
  api.signUp(data)
    .then(ui.onSignUpSuccess)
    .catch(ui.onSignUpFailure)
}

const onSignIn = (event) => {
	event.preventDefault()
	const form = event.target
	const data = getFormFields(form)
	api.signIn(data)
    .then(ui.onSignInSuccess)
    .catch(ui.onSignInFailure)
}

const onSignOut = (event) => {
	event.preventDefault()
	api.signOut()
    .then(ui.onSignOutSuccess)
    .catch(ui.onFailure)
}

const onTransactionSubmit = (event) => {
	event.preventDefault()
	// console.log(event)
	const form = event.target
	const userData = getFormFields(form)
	const data = {
		transaction: {
			coin: store.txCoin,
			symbol: store.txSymbol.toUpperCase(),
			price: store.txPrice,
			quantity: userData.transaction.quantity,
			orderType: userData.transaction.orderType,
		},
	}
	console.log(data)
	api
		.transaction(data)
		.then(ui.onTransactionSuccess)
		.catch(ui.onTransactionFailure)
}

const onTransactionEditSubmit = (event) => {
  event.preventDefault()
  const form = event.target
  const data = getFormFields(form)
  data.transaction.id = store.editTxId
  api.editTransaction(data)
    .then(ui.onEditTransactionSuccess)
    .then(ui.onTransactionFailure)
}


//-----------------------------------------//
const onNewTransactionModal = (event) => {
	event.preventDefault()
    console.log(event)
	$('#newTransactionModalLabel').text('Add a new transaction.')
	const newTxButton = event.target
    const coin = $(newTxButton).data('coin')
    const coinCaps = actions.capitalize(coin)
	store.txCoin = coin
    store.txSymbol = $(newTxButton).data('symbol')
    store.txPrice = $(newTxButton).data('price')
    $('#new-tx-form-coin').html(`<b>Coin:</b> ${coinCaps}`)
    $('#new-tx-form-symbol').html(`<b>Symbol:</b> ${store.txSymbol.toUpperCase()}`)
    $('#new-tx-form-price').html(`<b>Price:</b> ${actions.formatter.format(store.txPrice)}`)
}


const onTransactionEditModal = (event) => {
	event.preventDefault()
  $('#editTransactionModalLabel').text('Revise your transaction.')
  const editButton = event.target
  store.editTxId = $(editButton).data('id')
  console.log(store.editTxId)
}

const onTransactionDeleteModal = (event) => {
	event.preventDefault()
	const deleteButton = event.target
	const id = $(deleteButton).data('id')
	api
		.deleteTransaction(id)
		.then(ui.onTransactionSuccess)
		.then(ui.onTransactionFailure)
}

const onTransactionDeleteSubmit = (event) => {
	event.preventDefault()
	const form = event.target
	const data = getFormFields(form)
  const id = data.transaction.id
	api.deleteTransaction(id)
		.then(ui.onTransactionSuccess)
		.then(ui.onTransactionFailure)
}

const onShowAccount = (event) => {
  event.preventDefault()
  $('#user-account-form').show()
  $('#app-tabs').hide()
  $('#app-tabs-content').hide()
  $('#account-email').text(`${store.user}`)
}

const onChangePassword = (event) => {
  event.preventDefault()
  const form = event.target
  const data = getFormFields(form)
  api.changePassword(data)
    .then(ui.onChangePasswordSuccess)
    .catch(ui.onChangePasswordFailure)
}

module.exports = {
	onSignUp,
	onSignIn,
	onSignOut,
	onTransactionSubmit,
	onTransactionEditSubmit,
	onShowAccount,
	onChangePassword,
	onTransactionDeleteSubmit,
	onTransactionDeleteModal,
	onTransactionEditModal,
	onNewTransactionModal
}