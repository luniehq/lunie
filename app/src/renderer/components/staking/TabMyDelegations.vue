<template lang="pug">
  div
    div(v-if="yourValidators.length > 0")
      h3.tab-header
        | Active Delegations
        |
        i.material-icons.info-button(v-tooltip.top="bondInfo") info_outline
      table-validators(:validators="yourValidators")

    tm-data-msg(v-if="yourValidators.length < 1", icon="info_outline")
      div(slot="title") No Active Delegations
      div(slot="subtitle") Looks like you haven't delegated any {{ this.bondingDenom }}s yet. Head over to the #[router-link(:to="{name: 'Validators'}") validator list] to make your first delegation!

    .check-out-message(v-if="yourValidators.length > 0")
      | Check out
      |
      router-link(:to="{name: 'Validators'}") the validator list
      |
      | to spread some of your Atoms around.

    div(v-if="undelegatedValidators.length")
      h3.tab-header
        | Inactive Delegations
        |
        i.material-icons.info-button(v-tooltip.top="unbondInfo") info_outline
      table-validators(:validators="undelegatedValidators")
</template>

<script>
import { mapGetters } from "vuex"
import { TmDataMsg } from "@tendermint/ui"
import TableValidators from "staking/TableValidators"

export default {
  name: `tab-my-delegations`,
  components: { TableValidators, TmDataMsg },
  data: () => ({
    bondInfo: `Validators you are currently bonded to`,
    unbondInfo: `Your bonded validators in unbonding process`
  }),
  computed: {
    ...mapGetters([
      `delegates`,
      `delegation`,
      `committedDelegations`,
      `bondingDenom`
    ]),
    undelegatedValidators(
      { delegates: { delegates }, delegation: { unbondingDelegations } } = this
    ) {
      return delegates.filter(
        ({ operator_address }) => operator_address in unbondingDelegations
      )
    },
    yourValidators({ committedDelegations, delegates: { delegates } } = this) {
      return delegates.filter(
        ({ operator_address }) => operator_address in committedDelegations
      )
    }
  }
}
</script>
<style lang="stylus">
@require '~variables'

.tab-header
  color var(--dim)
  font-size 14px
  font-weight 500
  margin 1rem 1rem 0 2rem

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
