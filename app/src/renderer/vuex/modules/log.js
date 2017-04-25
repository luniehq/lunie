'use strict'

const path = require('path')
const { Tail } = require('tail')
const root = require('../../../root.js')

const MAX_LENGTH = 40e3

export default () => {
  const state = {
    output: ''
  }

  const mutations = {
    addLogOutput (state, data) {
      // TODO: parse log format
      state.output += data
      state.output = state.output.slice(-MAX_LENGTH)
    }
  }

  const actions = {
    startReadingLog ({ commit }) {
      const tail = new Tail(path.join(root, 'basecoin.log'))
      tail.on('line', (line) => commit('addLogOutput', line))
    }
  }

  return { state, mutations, actions }
}
