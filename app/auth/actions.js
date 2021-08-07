'use strict'
const store = require('../store')


//function to display numbers as $###,###.##
const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 2,
})

module.exports = {
	formatter,
}