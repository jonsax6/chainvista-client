'use strict'
const store = require('../store')
require('../../lib/jquery.sparkline')

const movingAve = (array) => {
		let aveArray = []
		for (let i = 5; i < array.length - 1; i++) {
			let movingFiveAverage =
				(array[i - 4] +
					array[i - 3] +
					array[i - 2] +
					array[i - 1] +
					array[i]) /
				5
			aveArray.push(movingFiveAverage)
		}
		return aveArray
	}

const renderMarketTables = (data, index) => {
    for (let i = index; i < index + 100; i++) {
      let coinData = data[i]
      const marketCap = coinData.market_cap
        ? Number(coinData.market_cap).toFixed(2)
        : '-'
      const coinPrice = coinData.current_price
        ? Number(coinData.current_price).toFixed(2)
        : '-'
      const coinDelta = coinData.price_change_percentage_24h
        ? Number(coinData.price_change_percentage_24h).toFixed(2)
        : '-'
      const sparkData = coinData.sparkline_in_7d.price
      const sparkAve = movingAve(sparkData)
      const coinSymbol = coinData.symbol
      const coinName = coinData.name
      const id = coinData.id

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
      $('.market-table-tab').append(
        //populates the table rows with data from API
        `<tr class="text-light">
          <td class="text-center" scope="row">${coinData.market_cap_rank}</td>
          <td><b class="text-right"><img src="${
            coinData.image
          }" style="height: 1.25em;">&nbsp;&nbsp;&nbsp;${coinName}</b></td>
          <td class="text-right">${formatter.format(marketCap)}</td>
          <td class="text-right">${formatter.format(coinPrice)}</td>
          <td id="coin-change-percent" class="text-right text-${classColor}">${coinDelta}%</td>
          <td class="text-center p-0"><span id="sparkline-splash${i}"></span></td>
          <td class="text-center">
            <a 
              class="new-tx" 
              href="#" 
              data-coin="${id}"
              data-symbol="${coinSymbol}"
              data-price="${coinPrice}"
              data-bs-toggle="modal"
              data-bs-target="#new-transaction-modal" 
              style="text-decoration:none"
              >add &nbsp;
            </a>
          </td>
      </tr>`
      )
      $('#market-table-splash').append(
        `
      <tr>
          <td class="text-center" scope="row">${coinData.market_cap_rank}</td>
          <td><b class="text-right"><img src="${
            coinData.image
          }" style="height: 1.25em;">&nbsp;&nbsp;&nbsp;${coinName}</b></td>
          <td class="text-right">${formatter.format(marketCap)}</td>
          <td class="text-right">${formatter.format(coinPrice)}</td>
          <td id="coin-change-percent" class="text-right text-${classColor}">${coinDelta}%</td>
          <td class="text-center p-0"><span id="sparkline${i}"></span></td>
      </tr>
      `
      )
      //control flow for painting sparklines green (up-trending) or red (down-trending)
      drawSparkline(sparkAve, '200', '#sparkline-splash', i)
      drawSparkline(sparkAve, '200', '#sparkline', i)
    }
}

const sortPortfolio = (portfolio) => {
  let displayOrder = []
  for (const coin in portfolio) {
    displayOrder.push(portfolio[coin])
  }
  displayOrder.sort((a, b) => {
    if (a.usdValue > b.usdValue) return -1
    if (a.usdValue < b.usdValue) return 1
    return 0
  })
  return displayOrder
}


const sparkLine = (data, color, width, selector, i) => {
  $(`${selector}${i}`).sparkline(data, {
    type: 'line',
    width: width,
    height: '40',
    lineColor: color,
    fillColor: null,
    lineWidth: 1.5,
    spotColor: null,
    minSpotColor: null,
    maxSpotColor: null,
    spotRadius: 0,
    highlightSpotColor: undefined,
    highlightLineColor: undefined,
  })
}

const drawSparkline = (sparkAve, width, selector, index) => {
  if (sparkAve[0] > sparkAve[sparkAve.length - 1]) {
    sparkLine(sparkAve, '#ff0000', width, selector, index)
  }
  if (sparkAve[0] < sparkAve[sparkAve.length - 1]) {
    sparkLine(sparkAve, '#00bf00', width, selector, index)
  }
}    

//function to display numbers as $###,###.##
const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 2,
})

const capitalize = (str) => {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

const initializePortfolio = (transactions) => {
  return new Promise((resolve, reject) => {
      let portfolio = {}
      transactions.forEach((tx) => {
        // make the coin name all lower case for each transaction
        let coin = tx.coin.toLowerCase()
        // if user owns the transaction
        if (store.owner === tx.owner) {
          // and if the token is NOT already in the portfolio object
          if (!(coin in portfolio)) {
            // initialize this crypto into the portfolio starting at 0
            portfolio[coin] = { quantity: 0 }
          }
        }
      })
      for (const coin in portfolio) {
        // now iterate over each transaction
        transactions.forEach((tx) => {
          // if the coin in the store transactions array is the same as the coin were iterating
          // add the quantity from that coin object to the coin key in the portfolio
          if (tx.coin.toLowerCase() === coin && store.owner === tx.owner) {
            portfolio[coin].id = coin
            if (tx.orderType === 'buy') {
              portfolio[coin].quantity += tx.quantity
            } else {
              portfolio[coin].quantity -= tx.quantity
            }
          }
        })
      }
      resolve(portfolio)
    }
  )
}

const buildPortfolio = (portfolio) => {
  store.totalUsdValue = 0
  store.totalBtcValue = 0
  store.totalChangeAmount = 0
  for (const coin in portfolio) {
    store.markets.forEach((crypto) => {
      if (coin === crypto.id) {
        portfolio[coin].id = coin
        portfolio[coin].image = crypto.image
        portfolio[coin].price = crypto.current_price
        portfolio[coin].usdValue =
        portfolio[coin].quantity * crypto.current_price
        portfolio[coin].rank = crypto.market_cap_rank
        store.totalUsdValue += portfolio[coin].usdValue
        store.totalBtcValue =
        store.totalUsdValue / store.markets[0].current_price
        portfolio[coin].change = crypto.price_change_percentage_24h
        portfolio[coin].changeColor =
        portfolio[coin].change > 0 ? 'success' : 'danger'
        portfolio[coin].marketCap = crypto.market_cap
        portfolio[coin].circSupply = crypto.circulating_supply
        portfolio[coin].sparkData = crypto.sparkline_in_7d.price
        portfolio[coin].sparkAve = movingAve(portfolio[coin].sparkData)
        portfolio[coin].classColor =
        portfolio[coin].change > 0 ? 'success' : 'danger'
        store.marketCap = crypto.market_cap
        store.totalChangeAmount +=
        portfolio[coin].usdValue * (portfolio[coin].change / 100)
        store.totalChangePercentage =
          (store.totalChangeAmount / store.totalUsdValue) * 100
        store.totalChangeColor =
          store.totalChangePercentage > 0 ? 'success' : 'danger'
      }
    })
  }
 

}

const renderPortfolio = (portfolio) => {
  portfolio.forEach((coin, index) => {
    // if the store.cardView toggle is true, render portfolio as cards
    if (store.cardView === true) {
      $('#portfolio-cards').append(
        `
      <div class="col-xl-3 col-lg-4 col-md-4 col-sm-6 col-12 rounded-3">
        <div class="card bg-image text-white m-auto mt-4">
          <div class="text-center">
            <img src="${
              coin.image
            }" class="card-img-top text-center" alt="crypto-logo">
          </div>
          <div class="card-body">
            <h5 class="card-title text-center">${coin.id}</h5>
            <p class="card-text text-center">Holdings: ${new Intl.NumberFormat().format(
              coin.quantity
            )}
            </p>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item bg-price text-light">
              Current Price: ${formatter.format(coin.price)}</li>
            <li class="list-group-item bg-price text-light">
              USD value: ${formatter.format(coin.usdValue)}</li>
            <li class="list-group-item bg-card text-light">
              24h: <span class="text-${
                coin.changeColor
              }">${coin.change.toPrecision(2)}%</span></li>
            <li class="list-group-item bg-card text-light">
              7-day: <span class="m-auto" id="sparkline-portfolio-card${index}"></span></li>
            <li class="list-group-item bg-card text-light">
              Mkt Cap: $${new Intl.NumberFormat().format(
                parseInt(coin.marketCap)
              )}</li>
            <li class="list-group-item bg-card text-light">
              Crc Supply: ${new Intl.NumberFormat().format(
                parseInt(coin.circSupply)
              )}</li>
          </ul>
        </div>
      </div>`
      )
    }
    // if store.cardView is false, render the portfolio as a list
    else {
      $('#portfolio-table-data').append(
        `            
        <tr>
          <td class="text-center">${coin.rank}</td>
          <td><b class="text-right"><img src="${
            coin.image
          }" style="height: 1.25em;">
            &nbsp;&nbsp;&nbsp;${coin.id}</b></td>
          <td class="text-right">${formatter.format(coin.price)}</td>
          <td class="text-right">${new Intl.NumberFormat().format(
            coin.quantity
          )}</td>
          <td class="text-right">${formatter.format(coin.usdValue)}</td>
          <td class="text-right">${formatter.format(coin.marketCap)}</td>
          <td class="text-right text-${
            coin.classColor
          }">${coin.change.toPrecision(2)}%</td>
          <td class="text-center"><span class="mb-1 mt-1" id="sparkline-portfolio${index}"></span></td>
        </tr>
        `
      )
    }
    if (store.cardView) {
      drawSparkline(coin.sparkAve, '150', '#sparkline-portfolio-card', index)
    } else {
      drawSparkline(coin.sparkAve, '200', '#sparkline-portfolio', index)
    }
  })
}

const renderPortfolioHeader = () => {
  $('#account-usd-value').text(`${formatter.format(store.totalUsdValue)}`)
  $('#account-btc-value').html(`<i class="icon-btc"></i>${new Intl.NumberFormat().format(store.totalBtcValue)}`)
  $('#account-change').html(`<span class="text-${store.totalChangeColor}">
      ${store.totalChangePercentage.toPrecision(2)}%
    </span>`)
}

const filterSearch = (search) => {
  // variable for the large markets data set from coinGecko
  const markets = store.markets
  // variable that makes the search term all lower case no matter what
  const searchTermLowerCase = search.toLowerCase()
  // if the search term string is contained anywhere in the markets[index].id string,
  // then let data = that coin object at that index
  let data = markets.filter((coin) => {
    // variable for the coin name found in the object currently iterated
    let coinName = coin.id
    let coinSymbol = coin.symbol
    // look inside the coin we're iterating, if the search string matches any part of
    // the coin name string, assign that coin object to the data variable
    if (
      coinName.indexOf(searchTermLowerCase) !== -1 ||
      coinSymbol.indexOf(searchTermLowerCase) !== -1
    ) {
      // if there is a match to the search term, empty the markets table data
      $('#next-page').hide()
      $('.market-table-tab').empty()
      $('#market-table-splash').empty()
      // boolean so that we can enable full market reload inside of
      store.search = true
      // assign to the data variable
      return true
    }
  })
  return data
}

const noResults = (data, search) => {
  if (data[0] === undefined) {
    $('#user-alert-message').show()
    $('#user-alert-message').text(`No results found for '${search}'`)
    $('#user-alert-message').fadeOut(4000, () => {
      // only show 'cryptocurrency markets by market cap' title if logged out
      if (!store.login) {
        $('#user-alert-message').show()
        $('#user-alert-message').text('Cryptocurrency Markets by Market Cap')
        $('#search-form').trigger('reset')
      }
    })
  }
}

const renderSearchResults = (data) => {
   data.forEach((coin, index) => {
     const cryptoName = coin.name
     const marketRank = coin.market_cap_rank
     const coinImage = coin.image
     const marketCap = coin.market_cap
       ? Number(coin.market_cap).toFixed(2)
       : '-'
     const coinPrice = coin.current_price
       ? Number(coin.current_price).toFixed(2)
       : '-'
     const coinDelta = coin.price_change_percentage_24h
       ? Number(coin.price_change_percentage_24h).toFixed(2)
       : '-'
     const sparkData = coin.sparkline_in_7d.price
     const sparkAve = movingAve(sparkData)
     const coinSymbol = coin.symbol
     const id = coin.id
     let i = 0

     //table dynamically created, data feed from fetch(marketData)
     let classColor
     if (coinDelta > 0) {
       //if change is a positive number show it green
       classColor = 'success'
     }
     if (coinDelta < 0) {
       //if change is a negative number show it red
       classColor = 'danger'
     }
     $('.market-table-tab').append(
       //populates the table rows with data from API
       `<tr class="text-light">
            <td class="text-center" scope="row">${marketRank}</td>
            <td><b class="text-right"><img src="${coinImage}" style="height: 1.25em;">
              &nbsp;&nbsp;&nbsp;${cryptoName}</b>
            </td>
            <td class="text-right">${formatter.format(marketCap)}</td>
            <td class="text-right">${formatter.format(coinPrice)}</td>
            <td id="coin-change-percent" class="text-right text-${classColor}">${coinDelta}%</td>
            <td class="text-center p-0"><span id="sparkline-splash${index}"></span></td>
            <td class="text-center">
              <a 
                class="new-tx" 
                href="#" 
                data-coin="${id}"
                data-symbol="${coinSymbol}"
                data-price="${coinPrice}"
                data-bs-toggle="modal"
                data-bs-target="#new-transaction-modal" 
                style="text-decoration:none"
                >add &nbsp;
              </a>
            </td>
        </tr>`
     )
     $('#market-table-splash').append(
       `
    <tr>
        <td class="text-center" scope="row">${marketRank}</td>
        <td><b class="text-right"><img src="${coinImage}" style="height: 1.25em;">
          &nbsp;&nbsp;&nbsp;${cryptoName}</b></td>
        <td class="text-right">${formatter.format(marketCap)}</td>
        <td class="text-right">${formatter.format(coinPrice)}</td>
        <td id="coin-change-percent" class="text-right text-${classColor}">${coinDelta}%</td>
        <td class="text-center p-0"><span id="sparkline${index}"></span></td>
    </tr>
    `
     )
     //control flow for painting sparklines green (up-trending) or red (down-trending)
     if (sparkAve[0] > sparkAve[sparkAve.length - 1]) {
       sparkLine(sparkAve, '#ff0000', '200', index)
     }
     if (sparkAve[0] < sparkAve[sparkAve.length - 1]) {
       sparkLine(sparkAve, '#00bf00', '200', index)
     }
   })
}

module.exports = {
  formatter,
  movingAve,
  sparkLine,
  capitalize,
  renderPortfolio,
  renderPortfolioHeader,
  renderMarketTables,
  drawSparkline,
  initializePortfolio,
  buildPortfolio,
  sortPortfolio,
  filterSearch,
  noResults,
  renderSearchResults
}