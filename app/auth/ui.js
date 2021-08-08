'use strict'
const store = require('../store')
const actions = require('./actions')
const events = require('./events')
const api = require('./api')

const BASE_URL = 'https://api.coingecko.com/api/v3'
let PG = 1

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

const onSignInSuccess = async (response) => {
	store.token = response.user.token
	store.user = response.user.email
  store.login = true
	console.log(store.token)
	$('#app-tabs').show()
	$('#user-account-span').show()
	$('#user-account-form').hide()
	$('#user-account-text').text(`${store.user} account`)
	$('#app-tabs-content').show()
	$('#sign-in-form').trigger('reset')
	$('.login-forms').hide()
	$('#sign-out-btn').show()
	$('#sign-up-error').hide()
  $('#login-title').text('Login to see your crypto:')
  await populateCoinsTable()
  store.images = await getCoinImages(store.markets)
  console.log(store.images)
}

const onLogoClick = () => {
  if (store.login) {
    $('#app-tabs').show()
    $('#user-account-span').show()
    $('#user-account-form').hide()
    $('#user-account-text').text(`${store.user} account`)
    $('#app-tabs-content').show()
    $('#sign-in-form').trigger('reset')
    $('#change-account-info-form').trigger('reset')
    $('.login-forms').hide()
    $('#sign-out-btn').show()
    $('#sign-up-error').hide()
  }
}

const onSignInFailure = (error) => {
	$('#login-title').hide()
	$('#user-login-message').show()
	$('#user-login-message').text('Account not found.  Try another account.')
}

const onSignOutSuccess = () => {
  store.login = false
	$('#sign-out-btn').hide()
  $('#sign-up').show()
	$('#sign-up-form').trigger('reset')
  $('#user-account-form').hide()
	$('#change-account-info-form').trigger('reset')
  $('#user-account-span').hide()
  $('#app-tabs').hide()
  $('#app-tabs-content').hide()
  $('.login-forms').show()
  $('#transaction-table').html('')
  $('#user-alert-message').show()
	$('#user-alert-message').text('See you next time!')
	$('#user-alert-message').fadeOut(4000)
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
    const id = transaction._id
    // reset the modal form
		$('#transaction-form-new').trigger('reset')
    // fills out the transactions table
		$('#transaction-table').append(
			`<tr>
		      <th class="text-light" scope="row">${coin}</td>
		      <td class="text-right text-light">${symbol}</td>
		      <td class="text-right text-light">${actions.formatter.format(price)}</td>
		      <td class="text-right text-light">${quantity}</td>
		      <td class="text-right text-light">${orderType}</td>
          <td class="text-right text-light">${id}</td>
		  </tr>`
		)
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
	$('#user-alert-message').fadeOut(4000)
}

const onChangePasswordFailure = (error) => {
	$('#account-info').text('Invalid password. Please try again:')
	console.error(error)
}

const onTransactionFailure = (error) => {
	console.log(error)
}

//------------MARKET OVERVIEW FUNCTIONS-----------//
const current_BTC_price = async () => {
	const CRYPTO_MARKETS = `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`
	let res = await fetch(CRYPTO_MARKETS)
	const data = await res.json()
	let BTC_USD_price = data[0].current_price
	return BTC_USD_price
}

const populateCoinsTable = async () => {
  let COINS_MARKETS = `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${PG}&sparkline=true`
  const res = await fetch(COINS_MARKETS)
  const data = await res.json()
  store.markets = data
  console.log(store.markets[0])

  for (let i = 0; i < data.length; i++) {
    let coinData = data[i]
    const MarketCap = coinData.market_cap
      ? Number(coinData.market_cap).toFixed(2)
      : '-'
    const coinPrice = coinData.current_price
      ? Number(coinData.current_price).toFixed(2)
      : '-'
    const volume = coinData.total_volume
      ? Number(coinData.total_volume).toFixed(2)
      : '-'
    const cirSuppy = coinData.circulating_supply
      ? Number(coinData.circulating_supply).toFixed(2)
      : '-'
    const coinDelta = coinData.price_change_percentage_24h
      ? Number(coinData.price_change_percentage_24h).toFixed(2)
      : '-'
    const sparkData = coinData.sparkline_in_7d.price
    const sparkAve = actions.movingAve(sparkData)
    const coinSymbol = coinData.symbol
    const coinName = coinData.name
    const capSymbol = coinSymbol.toUpperCase() //converts lowercase coin symbols to uppercase

    //table dynamically created, data feed from fetch(COINS_MARKETS)
    var classColor //variable to change color class for percent change 24h (coinDelta).
    if (coinDelta > 0) {
      //if change is a positive number show it green
      classColor = 'success'
    }
    if (coinDelta < 0) {
      //if change is a negative number show it red
      classColor = 'danger'
    }
    $('#market-tab-table').append(
			//populates the table rows with data from API
			`<tr>
                <th class="text-right text-light" scope="row">${
									coinData.market_cap_rank
								}</td>
                <td><b class="text-light"><img src="${
									coinData.image
								}" style="height: 1em;">&nbsp;&nbsp;${coinName}</b></td>
                <td class="text-right text-light">${actions.formatter.format(
									MarketCap
								)}</td>
                <td class="text-right text-light">${actions.formatter.format(
									coinPrice
								)}</td>
                <td class="text-right text-light">${actions.formatter.format(
									volume
								)}</td>
                <td class="text-right text-light">${actions.formatter.format(
									cirSuppy
								)}&nbsp;${capSymbol}</td>
                <td id="coin-change-percent" class="text-right text-${classColor}">${coinDelta}%</td>
                <td class="text-right text-light"><span id="sparkline${i}"></span></td>
            </tr>`
		)
    //control flow for painting sparklines green (up-trending) or red (down-trending)
    if (sparkAve[0] > sparkAve[sparkAve.length - 1]) {
      actions.sparkLine(sparkAve, '#ff0000', i)
    }
    if (sparkAve[0] < sparkAve[sparkAve.length - 1]) {
      actions.sparkLine(sparkAve, '#00bf00', i)
    }
  }
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
  populateCoinsTable()
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
  current_BTC_price,
  populateCoinsTable,
  onShowMarkets
}