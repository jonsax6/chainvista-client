'use strict'
const store = require('../store')
const actions = require('./actions')
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
  store.owner = response.user._id
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
  $('#user-alert-message').show()
	$('#user-alert-message').text('...fetching market data...')
  await onRefreshMarkets()
  $('#user-alert-message').hide()
	$('#user-alert-message').text('')
  await populateCoinsTable()
  store.images = getCoinImages(store.markets)
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
  $('#transaction-table').empty()
  $('#portfolio-cards').empty()
  $('#user-alert-message').show()
	$('#user-alert-message').text('See you next time!')
	$('#user-alert-message').fadeOut(4000)
}

const onEditTransactionSuccess = () => {
  $('#transaction-table').text('')
  $('#transaction-form-new').trigger('reset')
  $('#transaction-form-edit').trigger('reset')
  $('#transaction-form-delete').trigger('reset')
  $('#editTransactionModalLabel').text('Your transaction was revised.')
  api.index()
    .then(onIndexSuccess)
    .catch(error => console.error(error))
}

const onTransactionSuccess = (response) => {
	$('#transaction-table').text('')
  $('#transaction-form-new').trigger('reset')
  $('#transaction-form-edit').trigger('reset')
  $('#transaction-form-delete').trigger('reset')
  api.index()
    .then(onIndexSuccess)
    .catch(error => console.error(error))
}

const getCoinUrl = (coin) => {
	const coins = store.images
	// filter through coins and return the object with the same id key as 'coinNormalized' above
	coins.forEach((coinObj) => {
		// if the object from the images object array's coin key is the same as key we're iterating above
		// grab that URL and bind it to coinImage variable above.
		if (coin === coinObj.id) {
			coinImage = coinObj.image
			return
		}
	})
}

const onIndexSuccess = (response) => {
  // make a data variable from the fetched transactions from API
  const data = response.transaction
  // make the data available to the global store object
  store.transactions = data
  console.log(store.transactions)
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
    console.log(coinImage)
		$('#transaction-form-new').trigger('reset')
    // fills out the transactions table
    if (store.owner === txOwner) {
      $('#transaction-table').append(
				`<tr>
                <th class="text-light" scope="row">
                <b class="text-light"><img src="${coinImage}" style="height: 1.5em;">&nbsp;&nbsp;${coin}</b></th>
                <td class="text-right text-light">${symbol}</td>
                <td class="text-right text-light">${actions.formatter.format(
									price
								)}</td>
                <td class="text-right text-light">${quantity}</td>
                <td class="text-right text-light">${orderType}</td>
                <td class="text-right text-light">
                  <a class="edit-tx" href="#" data-id="${id}" data-bs-toggle="modal"
                    data-bs-target="#edit-transaction-modal" style="text-decoration:none">edit &nbsp;</a><span>/</span>
                  <a class="delete-tx" href="#" data-id="${id}" style="text-decoration:none">delete</a>                
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
  // let marketData = `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${PG}&sparkline=true`
  // const res = await fetch(marketData)
  // const data = await res.json()
  let data = store.markets

  for (let i = 0; i < 100; i++) {
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

    //table dynamically created, data feed from fetch(marketData)
    var classColor //variable to change color class for percent change 24h (coinDelta).
    if (coinDelta > 0) {
      //if change is a positive number show it green
      classColor = 'success'
    }
    if (coinDelta < 0) {
      //if change is a negative number show it red
      classColor = 'danger'
    }
    $('.market-tab-table').append(
			//populates the table rows with data from API
			`<tr>
                <th class="text-right" scope="row">${coinData.market_cap_rank}</td>
                <td><b class="text-right"><img src="${coinData.image}" style="height: 1.5em;">&nbsp;&nbsp;${coinName}</b></td>
                <td class="text-right">${actions.formatter.format(MarketCap)}</td>
                <td class="text-right">${actions.formatter.format(coinPrice)}</td>
                <td class="text-right">${actions.formatter.format(volume)}</td>
                <td class="text-right">${actions.formatter.format(cirSuppy)}&nbsp;${capSymbol}</td>
                <td id="coin-change-percent" class="text-right text-${classColor}">${coinDelta}%</td>
                <td class="text-right"><span id="sparkline${i}"></span></td>
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
  $('.market-tab-table').empty()
  populateCoinsTable()
}

const onShowPortfolio = () => {
  $('#portfolio-cards').empty()
  let txs = store.transactions
  let markets = store.markets
  console.log(markets)
  let portfolio = {}
  txs.forEach(tx => {
    console.log(tx.coin)
    console.log(tx.quantity)
    let coin = tx.coin.toLowerCase()
    if(store.owner === tx.owner) {
      if(!(coin in portfolio)) {
        portfolio[coin] = 0
      }
    }
  })
  for (const coin in portfolio) {
    txs.forEach(tx => {
      // if the coin in the store transactions array is the same as the coin were iterating
      // add the quantity from that coin object to the coin key in the portfolio 
      if(tx.coin.toLowerCase() === coin && store.owner === tx.owner) {
        portfolio[coin] += tx.quantity
      }
    })
  }
  console.log(portfolio)
  let coinImage = null
  let usdValue 
  let totalUsdValue = 0
  let totalBtcValue = 0
  let change
  let price
  let circSupply
  let marketCap
  let changeColor = change > 0 ? 'success' : 'danger'
  for (const coin in portfolio) {
    const coins = store.images
    coins.forEach((coinObj) => {
			// if the object from the images object array's coin key is the same as key we're iterating above
			// grab that URL and bind it to coinImage variable
			if (coin === coinObj.id) {
				coinImage = coinObj.image
			}
		})
    markets.forEach(crypto => {
      if(coin === crypto.id) {
        price = crypto.current_price
        usdValue = portfolio[coin] * price
        totalUsdValue += usdValue
        totalBtcValue = totalUsdValue / store.markets[0].current_price
        change = crypto.price_change_percentage_24h
        change = change.toPrecision(3)
        circSupply = crypto.circulating_supply
        marketCap = crypto.market_cap
      }
    })
    $('#portfolio-cards').append(
			`
      <div class="col-lg-3 col-md-4 col-sm-6 col-12 rounded-3">
        <div class="card text-white bg-dark m-auto mt-4" style="width: 18rem;">
          <div class="text-center">
            <img src="${coinImage}" class="card-img-top text-center" alt="crypto-logo">
          </div>
          <div class="card-body">
            <h5 class="card-title">${coin}</h5>
            <p class="card-text">${portfolio[coin]}
            </p>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item bg-secondary text-light">Current Price: ${actions.formatter.format(
							price
						)}</li>
            <li class="list-group-item bg-secondary text-light">USD value: ${actions.formatter.format(
							usdValue
						)}</li>
            <li class="list-group-item bg-dark text-${changeColor}">24h Change: ${change}%</li>
            <li class="list-group-item bg-dark text-light">Market Cap: ${actions.formatter.format(marketCap)}</li>
            <li class="list-group-item bg-dark text-light">Circ Supply: ${new Intl.NumberFormat().format(circSupply)}</li>
          </ul>
        </div>
      </div>`
		)
    $('#account-usd-value').text(`Total USD Value: ${actions.formatter.format(totalUsdValue)}`)
    $('#account-btc-value').text(`Total BTC Value: ${new Intl.NumberFormat().format(totalBtcValue)}`)
  }
}

const onRefreshMarkets = async () => {
  store.markets = []
  $('#user-alert-message').show()
  $('#user-alert-message').text('...fetching market data...')
  for(let i = 1; i < 6; i++) {
    await allCoinsMarkets(i)
  }
  $('#user-alert-message').hide()
	$('#user-alert-message').text('')
  console.log(store.markets)
  store.images = getCoinImages(store.markets)
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
	onShowMarkets,
	onShowPortfolio,
	onRefreshMarkets,
	onEditTransactionSuccess
}