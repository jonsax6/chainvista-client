'use strict'
const store = require('../store')
const { apiUrl } = require('../config')

const signUp = (data) => {
  return $.ajax({
    method: 'POST',
    url: `${apiUrl}/sign-up`,
    data,
  })
}

const signIn = (data) => {
	return $.ajax({
		method: 'POST',
		url: `${apiUrl}/sign-in`,
		data,
	})
}

const signOut = () => {
	return $.ajax({
		url: `${apiUrl}/sign-out`,
		method: 'DELETE',
		headers: {
			Authorization: 'Bearer ' + store.token,
		},
	})
}

const transaction = (data) => {
  return $.ajax({
		url: `${apiUrl}/transactions`,
		method: 'POST',
		headers: {
			Authorization: 'Bearer ' + store.token,
		},
		data,
	})
}

module.exports = {
	signUp,
	signIn,
	signOut,
  transaction
}
