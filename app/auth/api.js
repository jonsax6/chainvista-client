'use strict'
const store = require('../store')
const actions = require('./actions')
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

const changePassword = (data) => {
  return $.ajax({
		url: `${apiUrl}/change-password`,
		method: 'PATCH',
		headers: {
			Authorization: 'Bearer ' + store.token,
		},
		data,
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

const index = () => {
  return $.ajax({
    url: `${apiUrl}/transactions`,
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + store.token,
    }
  })
}

const editTransaction = (data) => {
  return $.ajax({
		url: `${apiUrl}/transactions/${data.transaction.id}`,
		method: 'PATCH',
		headers: {
			Authorization: 'Bearer ' + store.token,
		},
		data,
	})
}

const deleteTransaction = (id) => {
	return $.ajax({
		url: `${apiUrl}/transactions/${id}`,
		method: 'DELETE',
		headers: {
			Authorization: 'Bearer ' + store.token,
		},
	})
}

module.exports = {
	signUp,
	signIn,
	signOut,
  transaction,
  index,
  editTransaction,
  changePassword,
  deleteTransaction
}
