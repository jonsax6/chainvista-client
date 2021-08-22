'use strict'
const store = require('../store')
const utils = require('./utils')
const events = require('./events')
const api = require('./api')

const BASE_URL = 'https://api.coingecko.com/api/v3'
let PG = 1

const allCoinsMarkets = async (PG) => {
  let allMarketData = `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${PG}&sparkline=true`
	const res = await fetch(allMarketData)
	const data = await res.json()
  data.forEach(coin => {
    store.markets.push(coin)
  })
} 

const onSignUpSuccess = (response) => {
  $('#sign-up-btn').show()
  $('#sign-up').hide()
  $('#sign-in-message').text('Thank you! You can now sign in.')
  setTimeout(() => {
    $('#sign-in-message').fadeOut(2000, () => {
      $('#sign-in-message').show()
      $('#sign-in-message').text('Login to see your crypto:')
    })
  }, 6000)
  $('#sign-up-form').trigger('reset')
}

const onSignUpFailure = () => {
	$('#sign-up-message').text('There was a problem, please try again.')
  setTimeout(() => {
    $('#sign-up-message').fadeOut(2000, () => {
      $('#sign-up-message').show()
      $('#sign-up-message').text('Sign up for a new account:')
    })
  }, 4000)
  $('#sign-up-form').trigger('reset')
}

const onSignInButton = () => {
  // if we click on the sign in button, change store.onLoginView to true
  store.onLoginView = true
  $('#sign-in-btn').hide()
  $('#sign-up-btn').hide()
  $('#sign-up').show()
  $('#login-forms').show()
  $('#splash-table').hide()
  $('#search-container').hide()
  $('#sign-in-message').text('Login to see your crypto:')
  $('#user-alert-message').hide()
  $('#user-alert-message').text('Cryptocurrency Markets by Market Cap')
}

const onSignInSuccess = async (response) => {
  store.token = response.user.token
  store.user = response.user.email
  store.login = true
  store.owner = response.user._id
  // if we click sign in, change store.onLoginView to false
  store.onLoginView = false
  $('#search-container').show()
  $('#next-page').show()
  $('#app-tabs').show()
  $('#sign-in-btn').hide()
  $('#user-account-span').show()
  $('#user-account-form').hide()
  $('#user-account-text').text(`Your Account`)
  $('#app-tabs-content').show()
  $('#sign-in-form').trigger('reset')
  $('.login-forms').hide()
  $('#sign-out-btn').show()
	$('#user-alert-message').show()
	$('#user-alert-message').text('Welcome! Start or add to your portfolio.')
  setTimeout(() => {
    $('#user-alert-message').fadeOut(2000)

  }, 4000)
  $('#sign-in-message').text('Login to see your crypto:')
  // $('#user-alert-message').show()
  // $('#user-alert-message').text('...looking up market data...')
  $('#transaction-table').empty()
  $('.market-table-tab').empty()
  await populateCoinsTable()
  store.images = getCoinImages(store.markets)
  api
    .index()
    .then(onIndexSuccess)
    .then(onShowPortfolio)
    .catch((error) => console.error(error))
}

const onLogoClick = () => {
  if (store.login) {
    $('#app-tabs').show()
    $('#user-account-span').show()
    $('#user-account-form').hide()
    $('#user-account-text').text(`Your Account`)
    $('#app-tabs-content').show()
    $('#sign-in-form').trigger('reset')
    $('#change-account-info-form').trigger('reset')
    $('.login-forms').hide()
    $('#sign-out-btn').show()
  }
}

const onSignInFailure = (error) => {
	$('#sign-in-message').text('Account not found.  Try another account.')
  setTimeout(() => {
    $('#sign-in-message').fadeOut(2000, () => {
      $('#sign-in-message').show()
      $('#sign-in-message').text('Login to see your crypto:')
    })
  },4000)
}

const onSignOutSuccess = async () => {
  // change store.login to false
  store.login = false
  // make sure store.onLoginView is false so we don't default to the login screen,
  // we want to logout to the splash screen market overview
  store.onLoginView = false
  store.cardView = true
  $('#search-container').show()
  $('#splash-table').show()
  $('#sign-in-btn').show()
  $('#sign-out-btn').hide()
	$('#sign-up-form').trigger('reset')
  $('#user-account-form').hide()
	$('#change-account-info-form').trigger('reset')
  $('#user-account-span').hide()
  $('#app-tabs').hide()
  $('#app-tabs-content').hide()
  $('#transaction-table').empty()
  $('#portfolio-table-data').empty()
  $('#portfolio-list').hide()
  $('#portfolio-cards').show()
  $('#list-toggle-btn').text('Toggle List')
  $('#account-usd-value').empty()
  $('#account-btc-value').empty()
  $('#account-change').empty()
  $('#user-alert-message').show()
  $('.market-table-tab').empty()
  $('#market-table-splash').empty()
  await populateCoinsTable()
	$('#user-alert-message').text('See you next time!')
  setTimeout(() => {
    $('#user-alert-message').fadeOut(2000, () => {
      if (store.onLoginView === false) {
        $('#user-alert-message').show()
        $('#user-alert-message').text('Cryptocurrency Markets by Market Cap.')
      }
    })
  }, 4000)
}

const onEditTransactionSuccess = () => {
  // empty the transactions table first before refilling it
  $('#transaction-table').empty()
  $('#transaction-form-new').trigger('reset')
  $('#transaction-form-edit').trigger('reset')
  $('#transaction-form-delete').trigger('reset')
  $('#editTransactionModalLabel').text('Your transaction was revised.')
  $('#edit-modal-close').trigger('click')
	$('#user-alert-message').show()
	$('#user-alert-message').text('Your transaction was revised.')
	$('#user-alert-message').fadeOut(4000)

  api.index()
    .then(onIndexSuccess)
    .catch(error => console.error(error))
}

const onDeleteTransactionSuccess = () => {
  // empty the transactions table first before refilling it
  $('#transaction-table').empty()
  $('#transaction-form-new').trigger('reset')
  $('#transaction-form-edit').trigger('reset')
  $('#transaction-form-delete').trigger('reset')
  $('#delete-modal-close').trigger('click')
  api.index()
    .then(onIndexSuccess)
    .catch((error) => console.error(error))
}

const onTransactionTabClick = () => {
  api.index()
		.then(onIndexSuccess)
		.catch((error) => console.error(error))
}

const onTransactionSuccess = async (response) => {
  $('#transaction-table').empty()
  $('#transaction-form-new').trigger('reset')
  $('#transaction-form-edit').trigger('reset')
  $('#transaction-form-delete').trigger('reset')
  $('#new-modal-close').trigger('click')
	$('#user-alert-message').show()
	$('#user-alert-message').text('Your transaction was added.')
	$('#user-alert-message').fadeOut(4000)
  // user-alert-message
  api.index()
    .then(onIndexSuccess)
    .catch(error => console.error(error))
}

const onIndexSuccess = (response) => {
  $('#transaction-table').empty()
  // make a data variable from the fetched transactions from API
  const data = response.transaction
  // make the data available to the global store object
  store.transactions = data
  const markets = store.markets
  // iterate over the data array backwards (most recent first)
  data.slice().reverse().forEach(transaction => {
		const coin = transaction.coin
    const coinNormalized = coin.toLowerCase()
    const txOwner = transaction.owner
		const symbol = transaction.symbol
		const price = transaction.price
		const quantity = transaction.quantity
		const orderType = transaction.orderType
    const id = transaction._id
    // initialize variable for current market price
    let currentPrice
    // iterate over the store.markets object
    markets.forEach((crypto) => {
      // if the iterated crypto.id matches the current transaction coin id grab the current price
      // and assign it to currentPrice
      if (crypto.id === coin) {
        currentPrice = crypto.current_price
      }
    })    
    // variable for the coin images array created in getCoinImages()
    const coins = store.images
    // filter through coins and return the object with the same id key as 'coinNormalized' above
    // variable to contain the image
    let coinImage = null
    coins.forEach(coinObj => {
      // if the object from the images object array's coin key is the same as key we're iterating above
      // grab that URL and bind it to coinImage variable
      if (coinNormalized === coinObj.id) {
      coinImage = coinObj.image
      }
    }) 
		$('#transaction-form-new').trigger('reset')
    // fills out the transactions table
    if (store.owner === txOwner) {
      $('#transaction-table').append(
        `<tr>
          <td class="text-light" scope="row">
          <b><img src="${coinImage}" style="height: 1.25em;">&nbsp;&nbsp;${coin}</b></td>
          <td class="text-right">${symbol}</td>
          <td class="text-right">${utils.formatter.format(price)}</td>
          <td class="text-right">${new Intl.NumberFormat().format(
            quantity
          )}</td>
          <td class="text-right">${orderType}</td>
          <td class="text-right">
            <a 
              class="edit-tx" 
              href="#" 
              data-id="${id}" 
              data-coin="${coin}"
              data-symbol="${symbol}"
              data-price="${currentPrice}"
              data-bs-toggle="modal"
              data-bs-target="#edit-transaction-modal" 
              style="text-decoration:none">edit &nbsp;
            </a><span>/</span>
            <a 
              class="delete-tx" 
              href="#" 
              data-id="${id}" 
              data-coin="${coin}"
              data-bs-toggle="modal"
              data-bs-target="#delete-transaction-modal" 
              style="text-decoration:none">delete
            </a>                
          </td>
        </tr>`
      )
    }
	})
}

const onChangePasswordSuccess = () => {
  $('#user-account-form').hide()
	$('#app-tabs').show()
	$('#app-tabs-content').show()
	$('#change-account-info-form').trigger('reset')
  $('#account-info').text('Your account information:')
  $('#user-alert-message').show()
  $('#user-alert-message').text('Your password has been changed.')
  setTimeout(() => {
    $('#user-alert-message').fadeOut(2000, () => {
      $('#user-alert-message').text('Cryptocurrency Markets by Market Cap')
    })
  }, 4000)
}

const onChangePasswordFailure = (error) => {
	$('#account-info').text('Invalid password. Please try again:')
	console.error(error)
}

const onTransactionFailure = (error) => {
	console.log(error)
}

//------------MARKET OVERVIEW FUNCTIONS-----------//

const populateCoinsTable = async () => {
  let data = store.markets
  // find the starting index based on current page number in store.page
  // if page is 1, then the marketIndex is 0, if page is 2, then marketIndex is 100, and so on...
  let startIndex = (store.page - 1) * 100
  utils.renderMarketTables(data, startIndex)
}

const getCoinImages = (data) => {
  let coinImages = []
  data.forEach(coin => {
    let coinObj = {}
    coinObj.id = coin.id
    coinObj.image = coin.image
    coinImages.push(coinObj)
  })
  return coinImages
}

const onShowMarkets = async () => {
  // if data isn't loaded from coinGecko, empty table, load data, then populate the table.
  if (!store.loaded) {
    $('#next-page').show()
    $('.market-table-tab').empty()
    await onRefreshMarkets()
    await populateCoinsTable()
  } 
  // if we have search results showing, empty results and repopulate the table
  else if (store.search === true) {
    $('#next-page').show()
    $('.market-table-tab').empty()
    populateCoinsTable()
    store.search = false
  }

}

const onRefreshMarkets = async () => {
  store.markets = []
  $('#user-alert-message').show()
  $('#user-alert-message').text('...looking up market data...')
  for (let i = 1; i < 6; i++) {
    await allCoinsMarkets(i)
  }
  $('#user-alert-message').hide()
  $('#user-alert-message').text('')
  store.images = getCoinImages(store.markets)
}

const onCoinSearch = async (search) => {
  const data = utils.filterSearch(search)
  utils.noResults(data, search)
  utils.renderSearchResults(data)
  $('#search-form').trigger('reset')
}

const onShowPortfolio = async () => {
  $('#previous-page').hide()
  $('#portfolio-cards').empty()
  $('#portfolio-table-data').empty()
  // variable for the fetched transactions from database
  let txs = store.transactions
  // initialize portfolio object
  let portfolio = await utils.initializePortfolio(txs)
  // build the full portfolio object
  utils.buildPortfolio(portfolio)
  // we need the built object above to calculate the percent of total for each coin
  // uses the store.totalUsdValue to calculate its percentage
  utils.percentOfTotal(portfolio)
  // change the order of the array from largest to smallest holdings
  const displayOrder = utils.sortPortfolio(portfolio)
  // now render to the DOM
  utils.renderPortfolio(displayOrder)
  utils.renderPortfolioHeader()
}

module.exports = {
  onSignUpSuccess,
  onSignUpFailure,
  onSignInSuccess,
  onSignInFailure,
  onSignOutSuccess,
  onTransactionSuccess,
  onTransactionFailure,
  onChangePasswordSuccess,
  onChangePasswordFailure,
  onLogoClick,
  populateCoinsTable,
  onShowMarkets,
  onShowPortfolio,
  onRefreshMarkets,
  onEditTransactionSuccess,
  onDeleteTransactionSuccess,
  onTransactionTabClick,
  onSignInButton,
  onCoinSearch
}