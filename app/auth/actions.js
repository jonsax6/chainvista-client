'use strict'
const store = require('../store')
require('../../lib/jquery.sparkline')

const movingAve = (array) => {
		let aveArray = []
		for (let i = 5; i < array.length - 1; i++) {
			let indAve =
				(array[i - 4] +
					array[i - 3] +
					array[i - 2] +
					array[i - 1] +
					array[i]) /
				5
			aveArray.push(indAve)
		}
		return aveArray
	}

const sparkLine = (data, color, i) => {
	$(`#sparkline${i}, #sparkline-splash${i}`).sparkline(data, {
		type: 'line',
		width: '200',
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

//function to display numbers as $###,###.##
const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 2,
})

const capitalize = (str) => {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

module.exports = {
	formatter,
	movingAve,
	sparkLine,
	capitalize
}