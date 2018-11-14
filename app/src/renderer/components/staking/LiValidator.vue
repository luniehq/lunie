<template lang='pug'>
tr.li-validator
  td.li-validator__moniker-container
    img.li-validator__avatar(v-if="validator.keybase" :src="validator.keybase.avatarUrl" width="48" height="48")
    img.li-validator__avatar.no-img(v-else src="~assets/images/validator-icon.svg" width="48" height="48")
    .li-validator__name-container
      span.validator-profile__status(v-bind:class="statusColor" v-tooltip.top="status")
      router-link.li-validator__moniker(:to="{ name: 'validator', params: { validator: validator.operator_address }}", :class='styles') {{ validator.description.moniker }}
      short-bech32.li-validator__address(:address="validator.operator_address")
  td.li-validator__delegated-steak {{ yourVotes.isLessThan(0.01) && yourVotes.isGreaterThan(0) ? '< ' + num.shortNumber(0.01) : num.shortNumber(yourVotes) }}
  td.li-validator__rewards n/a
  td.li-validator__voting-power {{ validator.percent_of_vote ? validator.percent_of_vote : `n/a` }}
  td.li-validator__uptime {{ uptime }}
  td.li-validator__commission {{ commission }}
  td.li-validator__slashes n/a
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import { calculateTokens, ratToBigNumber } from "scripts/common"
import ShortBech32 from "common/ShortBech32"
import BigNumber from "bignumber.js"
export default {
  name: `li-validator`,
  props: [`validator`, `disabled`],
  components: {
    ShortBech32
  },
  computed: {
    ...mapGetters([`delegates`, `committedDelegations`]),
    commission() {
      return `${this.num.pretty(this.validator.commission.rate)}%`
    },
    uptime() {
      let rollingWindow = 10000 // param of slashing period
      let info = this.validator.signing_info
      if (info) {
        // uptime in the past 10k blocks
        let uptimeRollingWindow = info.signed_blocks_counter / rollingWindow
        return `${this.num.pretty(uptimeRollingWindow * 100)}%`
      }
      return `n/a`
    },
    yourVotes() {
      return this.committedDelegations[this.validator.id]
        ? calculateTokens(
            this.validator,
            this.committedDelegations[this.validator.id]
          )
        : BigNumber(0)
    },
    styles() {
      let value = ``
      if (this.validator.isValidator) value += `li-validator-validator `
      return value
    },
    delegateType() {
      return this.validator.revoked
        ? `Revoked`
        : this.validator.isValidator
          ? `Validator`
          : `Candidate`
    },
    powerRatio() {
      return ratToBigNumber(this.validator.tokens)
        .div(this.delegates.globalPower)
        .toNumber()
    },
    status() {
      // status: jailed
      if (this.validator.revoked)
        return `This validator has been jailed and is not currently validating`

      // status: inactive
      if (parseFloat(this.validator.voting_power) === 0)
        return `This validator does not have enough voting power yet and is inactive`

      // status: active
      return `This validator is actively validating`
    },
    statusColor() {
      // status: jailed
      if (this.validator.revoked) return `red`

      // status: inactive
      if (parseFloat(this.validator.voting_power) === 0) return `yellow`

      // status: active
      return `green`
    }
  },
  data: () => ({ num })
}
</script>

<style lang="stylus">
@require '~variables'

.li-validator
  padding 1rem
  background-color var(--app-fg)
  border-radius 0.25rem
  border 1px solid var(--bc-dim)

  &:hover
    background var(--hover-bg)

  .validator-profile__status
    left 0
    top 0.5rem

.li-validator__name-container
  position relative
  margin-left 0.5rem

  .li-validator__moniker
    padding-left 0.75rem

.li-validator__moniker-container
  display flex
  align-items center
  width 100%

.li-validator__moniker
  max-width 200px
  overflow hidden
  white-space nowrap
  text-overflow ellipsis

.li-validator__avatar
  height 3rem
  width 3rem
  margin 1rem 0.5rem
  border-radius 50%
  display block
  background var(--app-nav)

  &.no-img
    padding 0.5rem

.li-validator__address
  .address
    font-size sm
</style>
