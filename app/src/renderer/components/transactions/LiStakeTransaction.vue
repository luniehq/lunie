<template>
  <li-transaction
    color="#47AB6C"
    :time="transaction.time"
    :block="transaction.height"
  >
    <template v-if="txType === `cosmos-sdk/MsgCreateValidator`">
      <div slot="caption">
        Create validator
        <b>{{ tx.value && full(atoms(tx.value.amount)) }}</b>
        <span>{{ tx.value && tx.value.denom }}s</span>
      </div>
      <div slot="details">
        Moniker:
        <router-link :to="`${url}/${tx.validator_address}`">
          {{ moniker(tx.validator_address) }}
        </router-link>
      </div>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ fees ? full(atoms(fees.amount)) : full(0) }}</b>
        <span>{{ fees ? fees.denom : bondingDenom }}s</span>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgEditValidator`">
      <div slot="caption">
        Edit validator
      </div>
      <div slot="details">
        Moniker:
        <router-link :to="`${url}/${tx.validator_address}`">
          {{ moniker(tx.validator_address) }}
        </router-link>
      </div>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ fees ? full(atoms(fees.amount)) : full(0) }}</b>
        <span>{{ fees ? fees.denom : bondingDenom }}s</span>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgDelegate`">
      <div slot="caption">
        Delegation
        <b>{{ tx.value && full(atoms(tx.value.amount)) }}</b>
        <span>{{ tx.value && tx.value.denom }}s</span>
      </div>
      <div slot="details">
        To&nbsp;
        <router-link :to="`${url}/${tx.validator_address}`">
          {{ moniker(tx.validator_address) }}
        </router-link>
      </div>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ fees ? full(atoms(fees.amount)) : full(0) }}</b>
        <span>{{ fees ? fees.denom : bondingDenom }}s</span>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgUndelegate`">
      <div slot="caption">
        Undelegation
        <b>
          {{
            calculatePrettifiedTokens(tx.validator_address, tx.shares_amount)
          }}
        </b>
        <span>{{ bondingDenom }}s</span>
        <template v-if="timeDiff">
          <span class="tx-unbonding__time-diff">
            {{ timeDiff }}
          </span>
        </template>
      </div>
      <div slot="details">
        From&nbsp;
        <router-link :to="`${url}/${tx.validator_address}`">
          {{ moniker(tx.validator_address) }}
        </router-link>
      </div>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ fees ? full(atoms(fees.amount)) : full(0) }}</b>
        <span>{{ fees ? fees.denom : bondingDenom }}s</span>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgBeginRedelegate`">
      <div slot="caption">
        Redelegation
        <b>
          {{
            calculatePrettifiedTokens(
              tx.validator_src_address,
              tx.shares_amount
            )
          }}
        </b>
        <span>{{ bondingDenom }}s</span>
      </div>
      <div slot="details">
        From&nbsp;
        <router-link :to="`${url}/${tx.validator_src_address}`">
          {{ moniker(tx.validator_src_address) }}
        </router-link>
        to
        <router-link :to="`${url}/${tx.validator_dst_address}`">
          {{ moniker(tx.validator_dst_address) }}
        </router-link>
      </div>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ fees ? full(atoms(fees.amount)) : full(0) }}</b>
        <span>{{ fees ? fees.denom : bondingDenom }}s</span>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgUnjail`">
      <div slot="caption">
        Unjail
      </div>
      <div slot="details">
        Moniker:
        <router-link :to="`${url}/${tx.address}`">
          {{ moniker(tx.address) }}
        </router-link>
      </div>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ fees ? full(atoms(fees.amount)) : full(0) }}</b>
        <span>{{ fees ? fees.denom : bondingDenom }}s</span>
      </div>
    </template>
  </li-transaction>
</template>

<script>
import LiTransaction from "./LiTransaction"
import { atoms, full } from "../../scripts/num.js"
import { calculateTokens } from "../../scripts/common.js"
import moment from "moment"

/*
 * undelegation tx need a preprocessing, where shares are translated into transaction.balance: {amount, denom}
 */

export default {
  name: `li-stake-transaction`,
  components: { LiTransaction },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    fees: {
      type: Object,
      default: null
    },
    validators: {
      type: Array,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    bondingDenom: {
      type: String,
      required: true
    },
    unbondingTime: {
      type: Number,
      default: null
    },
    txType: {
      type: String,
      required: true
    }
  },
  data: () => ({
    atoms,
    full
  }),
  computed: {
    tx() {
      return this.transaction.tx.value.msg[0].value
    },
    timeDiff() {
      // only show time diff if still waiting to be terminated
      if (this.state !== `locked`) return ``

      return `(liquid ${moment(this.unbondingTime).fromNow()})`
    },
    // unbonding transactions can be in the state 'locked', 'ended'
    // the transaction needs to be enriched from the outside with `unbondingDelegation`
    state() {
      if (!this.unbondingTime) return `ended`
      if (this.unbondingTime - Date.now() <= 0) return `ended`
      return `locked`
    }
  },
  methods: {
    moniker(validatorAddr) {
      const validator = this.validators.find(
        c => c.operator_address === validatorAddr
      )
      return validator ? validator.description.moniker : validatorAddr
    },
    calculatePrettifiedTokens(validatorAddr, shares) {
      const validator = this.validators.find(
        val => val.operator_address === validatorAddr
      )
      return full(this.atoms(calculateTokens(validator, shares).toNumber()))
    }
  }
}
</script>
