<template lang="pug">
  div
    h3.tab-header
      | Your Validators
      |
      i.material-icons.info-button(v-tooltip.top="bondInfo") info_outline
    panel-sort(:sort='sort', :properties="properties")
    data-empty-search(v-if="yourValidators.length === 0")
    template(v-else)
      ol
        li-validator(
          v-for='validator in yourValidators'
          :key='`Your/${validator.id}`'
          :validator='validator'
        )
    .check-out-message
      | Check out
      |
      router-link(:to="{name: 'Validators'}") the validator list
      |
      | to spread some of your Atoms around.

    div(v-if="undelegatedValidators.length")
      h3.tab-header
        | Your Undelegated Validators
        |
        i.material-icons.info-button(v-tooltip.top="unbondInfo") info_outline
      ol
        li-validator(
          v-for='validator in undelegatedValidators'
          :key='`Undelegated/${validator.id}`'
          :validator='validator'
        )
</template>

<script>
import { mapGetters } from "vuex"
import LiValidator from "staking/LiValidator"
import { TmDataEmpty } from "@tendermint/ui"
import DataEmptySearch from "common/TmDataEmptySearch"
import PanelSort from "staking/PanelSort"
export default {
  name: `tab-my-delegations`,
  components: {
    LiValidator,
    TmDataEmpty,
    DataEmptySearch,
    PanelSort
  },
  data: () => ({
    sort: {
      property: `percent_of_vote`,
      order: `desc`
    },
    bondInfo: `Validators you are currently bonded to`,
    unbondInfo: `Your bonded validators in unbonding process`
  }),
  computed: {
    ...mapGetters([
      `delegates`,
      `delegation`,
      `committedDelegations`,
      `user`,
      `bondingDenom`
    ]),
    address({ user } = this) {
      return user.address
    },
    undelegatedValidators(
      { delegates: { delegates }, delegation: { unbondingDelegations } } = this
    ) {
      const unbonding = new Set(Object.keys(unbondingDelegations))
      return delegates.filter(({ id }) => unbonding.has(id))
    },
    properties({ bondingDenom } = this) {
      return [
        {
          title: `Moniker`,
          value: `small_moniker`,
          tooltip: `The validator's moniker`,
          class: `name`
        },
        {
          title: `Bonded ${bondingDenom}`,
          value: `your_votes`,
          tooltip: `Number of ${bondingDenom} you have delegated to the validator`,
          class: `your-votes`
        },
        {
          title: `Rewards`,
          value: `your_rewards`, // TODO: use real rewards
          tooltip: `Rewards of ${bondingDenom} you have gained from the validator`,
          class: `your-rewards` // TODO: use real rewards
        },
        {
          title: `Voting Power`,
          value: `percent_of_vote`,
          tooltip: `Percentage of ${bondingDenom} the validator has on The Cosmos Hub`,
          class: `percent_of_vote`
        },
        {
          title: `Uptime`,
          value: `uptime`,
          tooltip: `Ratio of blocks signed within the last 10k blocks`,
          class: `uptime`
        },
        {
          title: `Commission`,
          value: `commission`,
          tooltip: `The validator's commission`,
          class: `commission`
        },
        {
          title: `Slashes`,
          value: `slashes`, // TODO: use real slashes
          tooltip: `The validator's slashes`,
          class: `slashes`
        }
      ]
    },
    yourValidators({ committedDelegations, delegates: { delegates } } = this) {
      const committed = new Set(Object.keys(committedDelegations))
      return delegates.filter(({ id }) => committed.has(id))
    }
  }
}
</script>
<style lang="stylus">
@require '~variables'

.tab-header
  margin 1rem 1rem 0 2rem
  font-size 14px
  color var(--dim)
  font-weight 500

.info-button
  color var(--link)

.check-out-message
  background var(--app-fg)
  border 1px solid var(--bc-dim)
  border-radius 0.25rem
  font-size sm
  margin-bottom 4rem
  margin-left 2rem
  padding 0.5rem
  text-align center
</style>
