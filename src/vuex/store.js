"use strict"
/**
 * Main store module
 * @module store
 */

import Vue from "vue"
import Vuex from "vuex"
import * as getters from "./getters"
import modules from "./modules"

Vue.use(Vuex)

/**
 * Module Store
 * @param opts
 * @returns {Vuex.Store}
 */
export default (opts = {}) => {
  const store = new Vuex.Store({
    getters,
    // strict: true,
    modules: modules(opts)
  })

  store.dispatch("init")

  return store
}

/**
 * Get a storage key
 * @param state
 * @returns {string}
 */
export function getStorageKey(state) {
  const chainId = state.connection.lastHeader.chain_id
  const address = state.session.address
  return `store_${chainId}_${address}`
}
