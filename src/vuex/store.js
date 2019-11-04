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

  return store
}
