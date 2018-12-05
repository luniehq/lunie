"use strict"

import Vue from "vue"
import Vuex from "vuex"
import _ from "lodash"
import * as getters from "./getters"
import modules from "./modules"

Vue.use(Vuex)

export default (opts = {}) => {
  // provide commit and dispatch to tests
  opts.commit = (...args) => store.commit(...args)
  opts.dispatch = (...args) => store.dispatch(...args)

  const store = new Vuex.Store({
    getters,
    // strict: true,
    modules: modules(opts),
    actions: {
      loadPersistedState
    }
  })

  let pending = null
  store.subscribe((mutation, state) => {
    // since persisting the state is costly we should only do it on mutations that change the data
    const updatingMutations = [
      `setWalletBalances`,
      `setWalletHistory`,
      `setCommittedDelegation`,
      `setUnbondingDelegations`,
      `setDelegates`,
      `setProposal`,
      `setProposalDeposits`,
      `setProposalVotes`,
      `setKeybaseIdentities`
    ]

    if (updatingMutations.indexOf(mutation.type) === -1) return

    // if the user is logged in cache the balances and the tx-history for that user
    if (!state.user.account) return

    if (pending) {
      clearTimeout(pending)
    }
    pending = setTimeout(() => {
      persistState(state)
    }, 5000)
  })

  return store
}

function persistState(state) {
  const cachedState = JSON.stringify({
    transactions: {
      wallet: state.transactions.wallet,
      staking: state.transactions.staking
    },
    wallet: {
      balances: state.wallet.balances
    },
    delegation: {
      loaded: state.delegation.loaded,
      committedDelegates: state.delegation.committedDelegates,
      unbondingDelegations: state.delegation.unbondingDelegations
    },
    delegates: {
      delegates: state.delegates.delegates
    },
    keybase: {
      identities: state.keybase.identities
    },
    proposals: state.proposals,
    deposits: state.deposits,
    votes: state.votes
  })
  // Store the state object as a JSON string
  localStorage.setItem(getStorageKey(state), cachedState)
}

function getStorageKey(state) {
  const chainId = state.connection.lastHeader.chain_id
  const address = state.user.address
  return `store_${chainId}_${address}`
}

function loadPersistedState({ state, commit }) {
  const storageKey = getStorageKey(state)
  let cachedState
  try {
    cachedState = JSON.parse(localStorage.getItem(storageKey))
  } catch (err) {
    console.error(`Couldn't parse the cached state`)
  }
  if (cachedState) {
    // Replace the state object with the stored state
    _.merge(state, cachedState, {
      // set loading indicators to false
      transactions: {
        loaded: true,
        loading: false
      },
      wallet: {
        loaded: true,
        loading: false
      },
      delegates: {
        loaded: true,
        loading: false
      },
      proposals: {
        loaded: true,
        loading: false
      }
    })
    this.replaceState(state)

    // add all delegates the user has bond with already to the cart
    state.delegates.delegates
      .filter(d => state.delegation.committedDelegates[d.operator_address])
      .forEach(d => {
        commit(`addToCart`, d)
      })
  }
}
