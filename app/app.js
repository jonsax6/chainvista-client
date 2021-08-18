// use require with a reference to bundle the file and use it in this file
// const example = require('./example')

// use require without a reference to ensure a file is bundled
// require('./example')
const authEvents = require('./auth/events')
const store = require('./store')
const events = require('./auth/events')
const ui = require('./auth/ui')
const Modal = require('bootstrap').Modal

store.page = 1
store.login = false
store.cardView = true

$(async () => {
  $('#user-account-span').hide()
  $('#app-tabs').hide()
	$('.login-forms').hide()
  $('#app-tabs-content').hide()
  $('#user-account-form').hide()
  $('#sign-out-btn').hide()
  $('#home').on('click', authEvents.onHome)
  $('#search-container').show()
  $('.navbar-brand').on('click', ui.onLogoClick)
  $('#change-account-info-form').on('submit', authEvents.onChangePassword)
  $('#user-account-span').on('click', authEvents.onShowAccount)
  $('#sign-in-btn').on('click', ui.onSignInButton)
  $('#sign-up-form').on('submit', authEvents.onSignUp)
	$('#sign-in-form').on('submit', authEvents.onSignIn)
	$('#sign-out-btn').on('click', authEvents.onSignOut)
  $('#transactions-btn').on('click', ui.onTransactionTabClick)
  $('#markets-btn').on('click', ui.onShowMarkets)
  $('#portfolio-btn').on('click', ui.onShowPortfolio)
  $('#list-toggle-btn').on('click', authEvents.onListToggle)
  $('#portfolio-list-toggle').hide()
  $('#markets-tab').on('click', authEvents.onMarketsTab)
  $('#portfolio-tab').on('click', authEvents.onPortfolioTab)
  $('#transactions-tab').on('click', authEvents.onTransactionsTab)
  $('#refresh-markets-btn').on('click', ui.onRefreshMarkets)
  $('#transaction-form-new').on('submit', authEvents.onNewTransactionSubmit)
  $('#transaction-form-edit').on('submit', authEvents.onEditTransactionSubmit)
  $('#transaction-form-delete').on('submit', authEvents.onDeleteTransactionSubmit)
  $('#transaction-table').on('click', '.delete-tx', authEvents.onDeleteTransactionModal)
  $('#transaction-table').on('click', '.edit-tx', authEvents.onEditTransactionModal)
  $('.market-table-tab').on('click', '.new-tx', authEvents.onNewTransactionModal)
  $('#new-modal-close').on('click', authEvents.onCloseModals)
  $('#edit-modal-close').on('click', authEvents.onCloseModals)
  $('#previous-page').hide()
  $('#previous-page-splash').hide()
  $('#next-page').on('click', authEvents.onNextPage)
  $('#previous-page').on('click', authEvents.onPreviousPage)
  $('#next-page-splash').on('click', authEvents.onNextPage)
  $('#previous-page-splash').on('click', authEvents.onPreviousPage)  
  $('#search-form').on('submit', authEvents.onSearchMarkets)
  await ui.onRefreshMarkets()
  // after market data loads, set boolean for loaded to true
  store.loaded = true
  await ui.populateCoinsTable()
  $('#user-alert-message').show()
  $('#user-alert-message').text('Cryptocurrency Markets by Market Cap')
})
