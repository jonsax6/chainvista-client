// use require with a reference to bundle the file and use it in this file
// const example = require('./example')

// use require without a reference to ensure a file is bundled
// require('./example')
const authEvents = require('./auth/events')
const store = require('./store')
const events = require('./auth/events')
const ui = require('./auth/ui')
const Modal = require('bootstrap').Modal

$(() => {

  $('#user-account-span').hide()
  $('#user-alert-message').hide()
  $('#app-tabs').hide()
  $('#app-tabs-content').hide()
  $('#user-account-form').hide()
  $('#sign-out-btn').hide()
  $('.navbar-brand').on('click', ui.onLogoClick)
  $('#change-account-info-form').on('submit', authEvents.onChangePassword)
  $('#user-account-span').on('click', authEvents.onShowAccount)
  $('#sign-up-form').on('submit', authEvents.onSignUp)
	$('#sign-in-form').on('submit', authEvents.onSignIn)
	$('#sign-out-btn').on('click', authEvents.onSignOut)
  $('#transactions-tab').on('click', ui.onTransactionTabClick)
  $('#market-tab').on('click', ui.onShowMarkets)
  $('#portfolio-tab').on('click', ui.onShowPortfolio)
  $('#refresh-markets').on('click', ui.onRefreshMarkets)
  $('#transaction-form-new').on('submit', authEvents.onTransactionSubmit)
  $('#transaction-form-edit').on('submit', authEvents.onTransactionEditSubmit)
  $('#transaction-form-delete').on('submit', authEvents.onTransactionDeleteSubmit)
  $('#transaction-table').on('click', '.delete-tx', authEvents.onTransactionDeleteModal)
  $('#transaction-table').on('click', '.edit-tx', authEvents.onTransactionEditModal)
  $('.market-tab-table').on('click', '.new-tx', authEvents.onNewTransactionModal)
  $('#new-modal-close').on('click', authEvents.onCloseModals)
  $('#edit-modal-close').on('click', authEvents.onCloseModals)
  // $('#new-tx-form-submit').on('submit', function(e) {
  //   e.preventDefault()
  //   $('#new-transaction-modal').modal('hide')
  //   return false
  // })
})
