'use strict'
const getFormFields = require('../../lib/get-form-fields')
const store = require('../store')
const api = require('./api')
const ui = require('./ui')
const actions = require('./actions')


//===LOGIN/LOGOUT ACTIONS===//
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

//===ACCOUNT AND CHANGE PASSWORD ACTIONS===//
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

//===MODALS AND TRANSACTION ACTIONS===//
const onNewTransactionModal = (event) => {
  event.preventDefault()
  $('#newTransactionModalLabel').text('Add a new transaction.')
  // variable for the data passed in from the event listener
  const newTxButton = event.target
  // grab the data-coin from the DOM element
  const coin = $(newTxButton).data('coin')
  // capital the first letter for better display
  const coinCaps = actions.capitalize(coin)
  // bind the txCoin, txSymbol and txPrice to the store for immediate use in the onNewTransactionSubmit function
  store.txCoin = coin
  store.txSymbol = $(newTxButton).data('symbol')
  store.txPrice = $(newTxButton).data('price')
  // update the modal to show the current coin, symbol and current price,
  // the user will enter the new amount and buy/sell manually.
  $('#new-tx-form-coin').html(`<b>Coin:</b> ${coinCaps}`)
  $('#new-tx-form-symbol').html(
    `<b>Symbol:</b> ${store.txSymbol.toUpperCase()}`
  )
  $('#new-tx-form-price').html(
    `<b>Price:</b> ${actions.formatter.format(store.txPrice)}`
  )
}

const onNewTransactionSubmit = (event) => {
	event.preventDefault()
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
	api
		.transaction(data)
		.then(ui.onTransactionSuccess)
		.then(() => {
			$('#newTransactionModalLabel').text('your transaction was added')
		})
		.catch(ui.onTransactionFailure)
}

const onEditTransactionModal = (event) => {
  event.preventDefault()
  $('#editTransactionModalLabel').text('Revise your transaction:')
  const editTxButton = event.target
  const coin = $(editTxButton).data('coin')
  const coinCaps = actions.capitalize(coin)
  const editButton = event.target
  store.editTxId = $(editButton).data('id')
  store.txCoin = coin
  store.txSymbol = $(editTxButton).data('symbol')
  store.txPrice = $(editTxButton).data('price')
  $('#edit-tx-form-coin').html(`<b>Coin:</b> ${coinCaps}`)
  $('#edit-tx-form-symbol').html(
    `<b>Symbol:</b> ${store.txSymbol.toUpperCase()}`
  )
  $('#edit-tx-form-price').html(
    `<b>Price:</b> ${actions.formatter.format(store.txPrice)}`
  )
}

const onEditTransactionSubmit = (event) => {
  event.preventDefault()
  const form = event.target
  const userData = getFormFields(form)
  const data = {
    transaction: {
      coin: store.txCoin,
      symbol: store.txSymbol.toUpperCase(),
      price: store.txPrice,
      quantity: userData.transaction.quantity,
      orderType: userData.transaction.orderType,
      id: store.editTxId,
    },
  }
  api
    .editTransaction(data)
    .then(ui.onEditTransactionSuccess)
    .then(() => {
      $('#editTransactionModalLabel').text('Your transaction was revised')
    })
    .then(ui.onTransactionFailure)
}

const onDeleteTransactionModal = (event) => {
  event.preventDefault()
  // variable to contain the click listener data that was passed in the event parameter
  const deleteButton = event.target
  // grab the id from data-id
  const id = $(deleteButton).data('id')
  // grab the coin from data-coin
  const coin = $(deleteButton).data('coin')
  store.deleteTxId = id
  store.txCoin = coin
  $('#delete-tx-form-coin').html(`Delete this ${coin} transaction?`)
}

const onDeleteTransactionSubmit = (event) => {
  event.preventDefault()
  const id = store.deleteTxId
  api.deleteTransaction(id)
    .then(ui.onDeleteTransactionSuccess)
    .then(() => {
      $('#user-alert-message').text('Your transaction was deleted.')
      $('#user-alert-message').show()
      $('#user-alert-message').fadeOut(4000)
    })
    .then(ui.onTransactionFailure)
}            

const onCloseModals = () => {
	$('#newTransactionModalLabel').text('Add a new transaction:')
	$('#editTransactionModalLabel').text('Revise your transaction:')
}

module.exports = {
  onSignUp,
  onSignIn,
  onSignOut,
  onShowAccount,
  onChangePassword,
  onDeleteTransactionModal,
  onDeleteTransactionSubmit,
  onEditTransactionModal,
  onEditTransactionSubmit,
  onNewTransactionModal,
  onNewTransactionSubmit,
  onDeleteTransactionSubmit,
  onCloseModals,
}