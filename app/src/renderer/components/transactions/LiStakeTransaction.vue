<template>
  <li-transaction
    color="#47AB6C"
    :time="transaction.time"
    :block="transaction.height"
  >
    <template v-if="txType === `cosmos-sdk/MsgCreateValidator`">
      <div slot="caption">
        Create validator&nbsp;
        <b>{{ atoms(tx.value.amount) }}</b>
        <span>&nbsp;{{ tx.value.denom }}s</span>
      </div>
      <div slot="details">
        Moniker:&nbsp;
        <router-link :to="`${url}/${tx.validator_address}`">
          {{
            moniker(tx.validator_address)
          }}
        </router-link>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgEditValidator`">
      <div slot="caption">
        Edit validator&nbsp;
        <router-link :to="`${url}/${tx.validator_address}`">
          {{
            moniker(tx.validator_address)
          }}
        </router-link>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgDelegate`">
      <div slot="caption">
        Delegation&nbsp;
        <b>{{ atoms(tx.value.amount) }}</b>
        <span>&nbsp;{{ tx.value.denom }}s</span>
      </div>
      <div slot="details">
        To&nbsp;
        <router-link :to="`${url}/${tx.validator_addr}`">
          {{
            moniker(tx.validator_addr)
          }}
        </router-link>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/BeginRedelegate`">
      <div slot="caption">
        Redelegation&nbsp;
        <b>
          {{
            calculatePrettifiedTokens(tx.validator_src_addr, tx.shares_amount)
          }}
        </b>
        <span>&nbsp;{{ bondingDenom }}s</span>
      </div>
      <div slot="details">
        From&nbsp;
        <router-link :to="`${url}/${tx.validator_src_addr}`">
          {{
            moniker(tx.validator_src_addr)
          }}
        </router-link>
        &nbsp;to&nbsp;
        <router-link :to="`${url}/${tx.validator_dst_addr}`">
          {{
            moniker(tx.validator_dst_addr)
          }}
        </router-link>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/Undelegate`">
      <div slot="caption">
        Undelegation&nbsp;
        <b>
          {{
            calculatePrettifiedTokens(tx.validator_addr, tx.shares_amount)
          }}
        </b>
        <span>&nbsp;{{ bondingDenom }}s</span>
        <template v-if="timeDiff">
          <span class="tx-unbonding__time-diff">
            &nbsp;{{ timeDiff }}
          </span>
        </template>
      </div>
      <div slot="details">
        From&nbsp;
        <router-link :to="`${url}/${tx.validator_addr}`">
          {{
            moniker(tx.validator_addr)
          }}
        </router-link>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgUnjail`">
      <div slot="caption">
        Unjail&nbsp;
        <router-link :to="`${url}/${tx.address}`">
          {{
            moniker(tx.address)
          }}
        </router-link>
      </div>
    </template>
  </li-transaction>
</template>

<script>
import LiTransaction from "./LiTransaction"
import { pretty, atoms } from "../../scripts/num.js"
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
    pretty
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
      return this.atoms(calculateTokens(validator, shares).toNumber())
    }
  }
}
</script>
