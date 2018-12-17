<template>
  <tm-li-transaction
    :color="color"
    :time="transaction.time"
    :block="transaction.height"
    ><template v-if="delegation">
      <div slot="caption">
        Delegated&nbsp;<b>{{ prettify(tx.delegation.amount) }}</b
        ><span>&nbsp;{{ bondingDenom }}s</span>
      </div>
      <div slot="details">
        To&nbsp;<router-link :to="this.URL + '/' + tx.validator_addr">{{
          moniker(tx.validator_addr)
        }}</router-link>
      </div> </template
    ><template v-if="redelegation">
      <div slot="caption">
        Redelegated&nbsp;<template
          ><b>{{
            calculatePrettifiedTokens(tx.validator_src_addr, tx.shares_amount)
          }}</b
          ><span>&nbsp;{{ bondingDenom }}s</span></template
        >
      </div>
      <div slot="details">
        From&nbsp;<router-link :to="this.URL + '/' + tx.validator_src_addr">{{
          moniker(tx.validator_src_addr)
        }}</router-link>
        to&nbsp;<router-link :to="this.URL + '/' + tx.validator_dst_addr">{{
          moniker(tx.validator_dst_addr)
        }}</router-link>
      </div> </template
    ><template v-if="unbonding">
      <div slot="caption">
        Unbonded&nbsp;<template
          ><b>{{
            calculatePrettifiedTokens(tx.validator_addr, tx.shares_amount)
          }}</b
          ><span>&nbsp;{{ bondingDenom }}s</span></template
        ><template v-if="timeDiff"
          ><span>&nbsp;- {{ timeDiff }}</span></template
        >
      </div>
      <div slot="details">
        From&nbsp;<router-link :to="this.URL + '/' + tx.validator_addr">{{
          moniker(tx.validator_addr)
        }}</router-link>
      </div> </template
    ><template v-if="endUnbonding">
      <div slot="caption">Ended Unbonding&nbsp;</div>
      <div slot="details">
        From&nbsp;<router-link :to="this.URL + '/' + tx.validator_addr">{{
          moniker(tx.validator_addr)
        }}</router-link>
      </div>
    </template></tm-li-transaction
  >
</template>

<script>
import TmLiTransaction from "../TmLiTransaction/TmLiTransaction"
import colors from "../TmLiTransaction/transaction-colors.js"
import moment from "moment"
import TmBtn from "../TmBtn/TmBtn.vue"
import numeral from "numeral"
import { BigNumber } from "bignumber.js"

/*
 * undelegation tx need a preprocessing, where shares are translated into transaction.balance: {amount, denom}
 */

export default {
  name: "tm-li-stake-transaction",
  components: { TmLiTransaction, TmBtn },
  computed: {
    tx() {
      return this.transaction.tx.value.msg[0].value
    },
    type() {
      return this.transaction.tx.value.msg[0].type
    },
    delegation() {
      return this.type === "cosmos-sdk/MsgDelegate"
    },
    redelegation() {
      return this.type === "cosmos-sdk/BeginRedelegate"
    },
    unbonding() {
      return this.type === "cosmos-sdk/BeginUnbonding"
    },
    endUnbonding() {
      return this.type === "cosmos-sdk/CompleteUnbonding"
    },
    timeDiff() {
      // only show time diff if still waiting to be terminated
      if (this.state !== "locked") return ""

      return this.transaction.unbondingDelegation
        ? moment(this.transaction.unbondingDelegation.min_time).fromNow()
        : ""
    },
    // state needs to be calculated by a wrapping application
    // unbonding requires state to be 'locked', 'ready', 'ended'
    state() {
      if (!this.transaction.unbondingDelegation) return "ended"
      if (
        moment(this.transaction.unbondingDelegation.min_time).valueOf() -
          moment().valueOf() <=
        0
      )
        return "ready"
      return "locked"
    },
    color() {
      if (this.delegation) return colors.stake.bonded
      if (this.redelegation) return colors.stake.redelegate
      if (this.unbonding) return colors.stake.unbonded
      if (this.endUnbonding) return colors.stake.unbonded
    }
  },
  methods: {
    moniker(validatorAddr) {
      let validator = this.validators.find(
        c => c.operator_address === validatorAddr
      )
      return (validator && validator.description.moniker) || validatorAddr
    },
    prettify(amount) {
      const amountNumber = Number(amount)
      if (Number.isInteger(amountNumber)) {
        return numeral(amountNumber).format(`0,0`)
      }
      return numeral(amountNumber).format(`0,0.00`)
    },
    // TODO duplicated code from voyager. Delete when the two repositories are merged
    calculatePrettifiedTokens(validatorAddr, shares) {
      // this is the based on the idea that tokens should equal
      // (myShares / totalShares) * totalTokens where totalShares
      // and totalTokens are both represented as fractions
      let tokens
      let validator = this.validators.find(
        val => val.operator_address === validatorAddr
      )

      let sharesN = new BigNumber(shares.split(`/`)[0])
      let sharesD = new BigNumber(shares.split(`/`)[1] || 1)
      let myShares = sharesN.div(sharesD)

      let totalSharesN = new BigNumber(validator.delegator_shares.split(`/`)[0])
      let totalSharesD = new BigNumber(
        validator.delegator_shares.split(`/`)[1] || 1
      )
      let totalShares = totalSharesN.div(totalSharesD)

      let totalTokensN = new BigNumber(validator.tokens.split(`/`)[0])
      let totalTokensD = new BigNumber(validator.tokens.split(`/`)[1] || 1)
      let totalTokens = totalTokensN.div(totalTokensD)

      if (totalSharesN.eq(0)) {
        tokens = 0
      } else {
        tokens = myShares
          .times(totalTokens)
          .div(totalShares)
          .toNumber()
      }
      return this.prettify(tokens)
    }
  },
  props: {
    transaction: Object,
    validators: Array,
    URL: {
      type: String,
      default: ""
    },
    bondingDenom: {
      type: String,
      default: "atom"
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.tm-li-tx
  display flex
  font-size sm

  .tx-icon
    padding 0 0.5rem
    background var(--app-fg)
    display flex
    align-items center
    justify-content center

  .tx-container
    flex-direction column
    flex-wrap nowrap
    padding 0.5rem 0
    margin 0.5rem 0
    display flex
    width 100%
    min-width 0 // fix text-overflow

  .tx-element
    padding 0 2rem 0 1.5rem
    line-height 1.5rem

  .tx-coin
    .value
      flex 0 0 100%
      font-size sm
      color var(--dim)

      &:before
        content ''
        display inline

    .key
      font-weight 500
      font-size m

    .value, .key
      line-height 1.5rem

  .tx-address
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
    color var(--dim)
    font-size sm

  &.tm-li-tx-sent
    .tx-coin .value
      &:before
        content '-'

  &.tm-li-tx-received
    .tx-icon
      background var(--app-fg)

    .tx-coin .value
      color success

      &:before
        content '+'

  &:hover
    cursor pointer

@media screen and (min-width: 700px)
  .tm-li-tx
    font-size 0.875rem

    .tx-container
      flex-direction row

      .tx-coins
        flex 0 0 9rem
        padding 0
        min-width 0

        .tx-coin
          padding 0 1.5rem 0

          .key
            white-space nowrap
            overflow hidden
            text-overflow ellipsis
</style>
