<template>
  <tm-li-transaction
    :color="color"
    :time="transaction.time"
    :block="transaction.height"
    ><template v-if="delegation">
      <div slot="caption">
        Delegated&nbsp;<b>{{ pretty(tx.delegation.amount) }}</b
        ><span>&nbsp;{{ bondingDenom }}s</span>
      </div>
      <div slot="details">
        To&nbsp;<router-link :to="URL + '/' + tx.validator_addr">{{
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
        From&nbsp;<router-link :to="URL + '/' + tx.validator_src_addr">{{
          moniker(tx.validator_src_addr)
        }}</router-link>
        to&nbsp;<router-link :to="URL + '/' + tx.validator_dst_addr">{{
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
          ><span class="tx-unbonding__time-dif"
            >&nbsp;- {{ timeDiff }}</span
          ></template
        >
      </div>
      <div slot="details">
        From&nbsp;<router-link :to="URL + '/' + tx.validator_addr">{{
          moniker(tx.validator_addr)
        }}</router-link>
      </div>
    </template></tm-li-transaction
  >
</template>

<script>
import TmLiTransaction from "./TmLiTransaction"
import colors from "./transaction-colors.js"
import { pretty } from "../../scripts/num.js"
import { calculateTokens } from "../../scripts/common.js"
import moment from "moment"
import TmBtn from "common/TmBtn.vue"

/*
 * undelegation tx need a preprocessing, where shares are translated into transaction.balance: {amount, denom}
 */

export default {
  name: `TmLiStakeTransaction`,
  components: { TmLiTransaction, TmBtn },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    validators: {
      type: Array,
      required: true
    },
    URL: {
      type: String,
      required: true
    },
    bondingDenom: {
      type: String,
      required: true
    }
  },
  data: () => ({
    pretty
  }),
  computed: {
    tx() {
      return this.transaction.tx.value.msg[0].value
    },
    type() {
      return this.transaction.tx.value.msg[0].type
    },
    delegation() {
      return this.type === `cosmos-sdk/MsgDelegate`
    },
    redelegation() {
      return this.type === `cosmos-sdk/BeginRedelegate`
    },
    unbonding() {
      return this.type === `cosmos-sdk/BeginUnbonding`
    },
    timeDiff() {
      // only show time diff if still waiting to be terminated
      if (this.state !== `locked`) return ``

      return this.transaction.unbondingDelegation
        ? moment(this.transaction.unbondingDelegation.min_time).toNow()
        : ``
    },
    // unbonding transactions can be in the state 'locked', 'ended'
    // the transaction needs to be enriched from the outside with `unbondingDelegation`
    state() {
      if (!this.transaction.unbondingDelegation) return `ended`
      if (this.transaction.unbondingDelegation.min_time - Date.now() <= 0)
        return `ended`
      return `locked`
    },
    color() {
      if (this.delegation) return colors.stake.bonded
      if (this.redelegation) return colors.stake.redelegate
      if (this.unbonding) return colors.stake.unbonded
    }
  },
  methods: {
    moniker(validatorAddr) {
      let validator = this.validators.find(
        c => c.operator_address === validatorAddr
      )
      return (validator && validator.description.moniker) || validatorAddr
    },
    calculatePrettifiedTokens(validatorAddr, shares) {
      let validator = this.validators.find(
        val => val.operator_address === validatorAddr
      )
      return calculateTokens(validator, shares).toNumber()
    }
  }
}
</script>

<style>
.tm-li-tx {
  display: flex;
  font-size: sm;
}

.tm-li-tx .tx-icon {
  padding: 0 0.5rem;
  background: var(--app-fg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tm-li-tx .tx-container {
  flex-direction: column;
  flex-wrap: nowrap;
  padding: 0.5rem 0;
  margin: 0.5rem 0;
  display: flex;
  width: 100%;
  min-width: 0;
}

.tm-li-tx .tx-element {
  padding: 0 2rem 0 1.5rem;
  line-height: 1.5rem;
}

.tm-li-tx .tx-coin .value {
  flex: 0 0 100%;
  font-size: sm;
  color: var(--dim);
}

.tm-li-tx .tx-coin .value:before {
  content: "";
  display: inline;
}

.tm-li-tx .tx-coin .key {
  font-weight: 500;
  font-size: m;
}

.tm-li-tx .tx-coin .value,
.tm-li-tx .tx-coin .key {
  line-height: 1.5rem;
}

.tm-li-tx .tx-address {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--dim);
  font-size: sm;
}

.tm-li-tx.tm-li-tx-sent .tx-coin .value:before {
  content: "-";
}

.tm-li-tx.tm-li-tx-received .tx-icon {
  background: var(--app-fg);
}

.tm-li-tx.tm-li-tx-received .tx-coin .value {
  color: success;
}

.tm-li-tx.tm-li-tx-received .tx-coin .value:before {
  content: "+";
}

.tm-li-tx:hover {
  cursor: pointer;
}

@media screen and (min-width: 700px) {
  .tm-li-tx {
    font-size: 0.875rem;
  }

  .tm-li-tx .tx-container {
    flex-direction: row;
  }

  .tm-li-tx .tx-container .tx-coins {
    flex: 0 0 9rem;
    padding: 0;
    min-width: 0;
  }

  .tm-li-tx .tx-container .tx-coins .tx-coin {
    padding: 0 1.5rem 0;
  }

  .tm-li-tx .tx-container .tx-coins .tx-coin .key {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
