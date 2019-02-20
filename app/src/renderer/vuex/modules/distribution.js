import * as Sentry from "@sentry/browser"
import Vue from "vue"

export default ({ node }) => {
    const emptyState = {
        loading: false,
        loaded: false,
        error: null,
        totalRewards: null,
        rewards: {},
        withdrawAddress: null
    }
    const state = JSON.parse(JSON.stringify(emptyState))

    const mutations = {
        setTotalRewards(state, coins) {
            state.rewards = coins
        },
        setDelegatorRewards(state, { validatorAddr, rewards }) {
            Vue.set(state.rewards, validatorAddr, rewards)
        },
        setWithdrawAddress(state, { address }) {
            state.withdrawAddress = address
        }
    }
    const actions = {
        reconnected({ state, dispatch, rootState }) {
            if (state.loading && rootState.user.signedIn) {
                dispatch(`getDelegatorTotalRewards`)
            }
        },
        resetSessionData({ rootState }) {
            rootState.delegation = JSON.parse(JSON.stringify(emptyState))
        },
        async getDelegatorTotalRewards(
            { state, rootState, commit }
        ) {
            state.loading = true
            const address = rootState.user.address

            try {
                const rewards = await node.getDelegatorRewards(address)
                commit(`setTotalRewards`, rewards)
                state.error = null
            } catch (error) {
                commit(`notifyError`, {
                    title: `Error getting rewards`,
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
