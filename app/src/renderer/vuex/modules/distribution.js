import * as Sentry from "@sentry/browser"
import Vue from "vue"
import { coinsToObject } from "scripts/common.js"

export default ({ node }) => {
    const emptyState = {
        loading: false,
        loaded: false,
        error: null,
        /* totalRewards use the following format:
            { 
                denom1: amount1,
                ... ,
                denomN: amountN 
            }
        */
        totalRewards: {},
        /* rewards use the following format:
            { 
                validatorAddr1: { 
                    denom1: amount1,
                    ... ,
                    denomN: amountN 
                },
                ... ,
                validatorAddrN: { 
                    denom1: amount1,
                    ... ,
                    denomN: amountN 
                } 
            } 
        */
        rewards: {},
        withdrawAddress: null,
        parameters: {},
        /* outstandingRewards use the following format:
            { 
                denom1: amount1,
                ... ,
                denomN: amountN 
            }
        */
        outstandingRewards: {}
    }
    const state = JSON.parse(JSON.stringify(emptyState))

    const mutations = {
        setTotalRewards(state, rewards) {
            state.totalRewards = rewards
        },
        setDelegationRewards(state, { validatorAddr, rewards }) {
            Vue.set(state.rewards, validatorAddr, rewards)
        },
        setWithdrawAddress(state, address) {
            state.withdrawAddress = address
        },

        setDistributionParameters(state, parameters) {
            state.parameters = parameters
        },
        setOutstandingRewards(state, outstandingRewards) {
            state.outstandingRewards = outstandingRewards
        },
    }
    const actions = {
        reconnected({ state, dispatch, rootState: { session } }) {
            if (state.loading && session.signedIn) {
                dispatch(`getTotalRewards`)
            }
        },
        resetSessionData({ rootState }) {
            rootState.delegation = JSON.parse(JSON.stringify(emptyState))
        },
        async getTotalRewards(
            { state, rootState: { session }, commit }
        ) {
            state.loading = true
            try {
                const rewardsArray = await node.getDelegatorRewards(session.address)
                const rewards = coinsToObject(rewardsArray)
                commit(`setTotalRewards`, rewards)
                state.error = null
            } catch (error) {
                commit(`notifyError`, {
                    title: `Error getting total rewards`,
                    body: error.message
                })
                Sentry.captureException(error)
                state.error = error
            }
            state.loading = false
            state.loaded = true
        },
        async withdrawAllRewards(
            { rootState: { wallet }, dispatch },
            { password, submitType }
        ) {
            await dispatch(`sendTx`, {
                type: `postWithdrawDelegatorRewards`,
                to: wallet.address,
                password,
                submitType
            })
            await dispatch(`getTotalRewards`)
        },
        async getRewardsFromValidator({ state, rootState: { session }, commit }, validatorAddr) {
            state.loading = true
            try {
                const rewardsArray = await node.getDelegatorRewardsFromValidator(session.address, validatorAddr)
                const rewards = coinsToObject(rewardsArray)
                commit(`setDelegationRewards`, { validatorAddr, rewards })
                state.error = null
            } catch (error) {
                commit(`notifyError`, {
                    title: `Error getting rewards from validator`,
                    body: error.message
                })
                Sentry.captureException(error)
                state.error = error
            }
            state.loading = false
            state.loaded = true
        },
        async withdrawRewardsFromValidator(
            { rootState: { wallet }, commit, dispatch },
            { validatorAddr, password, submitType }
        ) {
            await dispatch(`sendTx`, {
                type: `postWithdrawDelegatorRewardsFromValidator`,
                to: wallet.address,
                pathParameter: validatorAddr,
                password,
                submitType
            })
            // optimistic update
            commit(`setDelegationRewards`, { validatorAddr, rewards: {} })
            // update rewards
            await dispatch(`getTotalRewards`)
            await dispatch(`getRewardsFromValidator`, validatorAddr)
        },
        async getWithdrawAddress({ state, rootState: { session }, commit }) {
            state.loading = true
            try {
                const withdrawAddress = await node.getDelegatorWithdrawAddress(session.address)
                commit(`setWithdrawAddress`, withdrawAddress)
                state.error = null
            } catch (error) {
                commit(`notifyError`, {
                    title: `Error getting rewards from validator`,
                    body: error.message
                })
                Sentry.captureException(error)
                state.error = error
            }
            state.loading = false
            state.loaded = true
        },
        async updateWithdrawAddress(
            { state, rootState: { wallet }, commit, dispatch },
            { newAddress, password, submitType }
        ) {
            state.loading = true
            await dispatch(`sendTx`, {
                type: `postDelegatorWithdrawAddress`,
                to: wallet.address,
                withdraw_address: newAddress,
                password,
                submitType
            })
            // optimistic update
            commit(`setWithdrawAddress`, newAddress)
            // update reward address
            await dispatch(`getWithdrawAddress`)
        },
        // TODO: move to a common parameters module
        async getDistributionParameters({ commit }) {
            state.loading = true
            try {
                const parameters = await node.getDistributionParameters()
                commit(`setDistributionParameters`, parameters)
                state.error = null
            } catch (error) {
                commit(`notifyError`, {
                    title: `Error querying distribution parameters`,
                    body: error.message
                })
                Sentry.captureException(error)
                state.error = error
            }
            state.loading = false
            state.loaded = true
        },
        async getOutstandingRewards({ commit }) {
            state.loading = true
            try {
                const oustandingRewardsArray = await node.getDistributionOutstandingRewards()
                const oustandingRewards = coinsToObject(oustandingRewardsArray)
                commit(`setOutstandingRewards`, oustandingRewards)
            } catch (error) {
                commit(`notifyError`, {
                    title: `Error getting distribution outstanding rewards`,
                    body: error.message
                })
                Sentry.captureException(error)
                state.error = error
            }
            state.loading = false
            state.loaded = true
        }
    }

    return {
        state,
        mutations,
        actions
    }
}
