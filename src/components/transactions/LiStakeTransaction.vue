<template>
  <LiTransaction
    color="#47AB6C"
    :time="time"
    :block="block"
    :memo="memo"
    :fees="fees"
  >
    <template v-if="txType === `cosmos-sdk/MsgCreateValidator`">
      <div slot="caption">
        Create validator
        <b>{{ num.atoms(tx.amount.amount) }}</b>
        <span>{{ value && value.denom }}</span>
      </div>
      <div slot="details">
        Moniker:
        <router-link :to="`${url}/${tx.validator_address}`">
          {{ moniker(tx.validator_address) }}
        </router-link>
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
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgDelegate`">
      <div slot="caption">
        Delegated
        <b>{{ num.atoms(tx.amount.amount) }}</b>
        <span>{{ num.viewDenom(tx.amount.denom) }}</span>
      </div>
      <div slot="details">
        To&nbsp;
        <router-link :to="`${url}/${tx.validator_address}`">
          {{ moniker(tx.validator_address) }}
        </router-link>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgUndelegate`">
      <div slot="caption">
        Undelegated
        <b>
          {{ num.atoms(tx.amount.amount) }}
        </b>
        <span>{{ num.viewDenom(bondingDenom) }}</span>
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
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgBeginRedelegate`">
      <div slot="caption">
        Redelegated
        <b>
          {{ num.atoms(tx.amount.amount) }}
        </b>
        <span>{{ num.viewDenom(bondingDenom) }}</span>
      </div>
      <div slot="details">
        From&nbsp;
        <router-link :to="`${url}/${tx.validator_src_address}`">
          {{ moniker(tx.validator_src_address) }}
        </router-link>
        &nbsp;to&nbsp;
        <router-link :to="`${url}/${tx.validator_dst_address}`">
          {{ moniker(tx.validator_dst_address) }}
        </router-link>
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
    </template>
  </LiTransaction>
</template>

<script>
import LiTransaction from "./LiTransaction"
import num from "../../scripts/num.js"
import moment from "moment"

/*
 * undelegation tx need a preprocessing, where shares are translated into transaction.balance: {amount, denom}
 */

export default {
  name: `li-stake-transaction`,
  components: { LiTransaction },
  props: {
    tx: {
      type: Object,
      required: true
    },
    fees: {
      type: Object,
      required: true
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
    },
    time: {
      type: String,
      required: true
    },
    block: {
      type: Number,
      required: true
    },
    memo: {
      type: String,
      default: null
    }
  },
  data: () => ({
    num
  }),
  computed: {
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
    },
    value() {
      return this.tx.value ? num.createDisplayCoin(this.tx.value) : {}
    }
  },
  methods: {
    moniker(validatorAddr) {
      const validator = this.validators.find(
        c => c.operator_address === validatorAddr
      )
      return validator ? validator.description.moniker : validatorAddr
    }
  }
}
</script>
