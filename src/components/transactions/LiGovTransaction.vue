<template>
  <LiTransaction
    :color="`#15CFCC`"
    :time="time"
    :block="block"
    :memo="memo"
  >
    <template v-if="txType === `cosmos-sdk/MsgSubmitProposal`">
      <div slot="caption">
        Submitted {{ tx.proposal_type.toLowerCase() }} proposal
        <b>{{ initialDeposit.amount }}</b>
        <span>{{ viewDenom(initialDeposit.denom) }}</span>
      </div>
      <div slot="details">
        Title:&nbsp;<i>{{ tx.title }}</i>
      </div>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ convertedFees ? convertedFees.amount : 0 }}</b>
        <span>
          {{
          convertedFees
          ? viewDenom(convertedFees.denom)
          : viewDenom(bondingDenom)
          }}
        </span>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgDeposit`">
      <div slot="caption">
        Deposited
        <template>
          <b>{{ deposit.amount }}</b>
          <span>{{ viewDenom(deposit.denom) }}</span>
        </template>
      </div>
      <div slot="details">
        On&nbsp;
        <router-link :to="`${url}/${tx.proposal_id}`">
          Proposal &#35;{{ tx.proposal_id }}
        </router-link>
      </div>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ convertedFees ? convertedFees.amount : 0 }}</b>
        <span>
          {{ fees ? viewDenom(convertedFees.denom) : viewDenom(bondingDenom) }}
        </span>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgVote`">
      <div slot="caption">Voted&nbsp;{{ tx.option }}</div>
      <div slot="details">
        On&nbsp;
        <router-link :to="`${url}/${tx.proposal_id}`">
          Proposal &#35;{{ tx.proposal_id }}
        </router-link>
      </div>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ convertedFees ? convertedFees.amount : 0 }}</b>
        <span>
          {{
          convertedFees
          ? viewDenom(convertedFees.denom)
          : viewDenom(bondingDenom)
          }}
        </span>
      </div>
    </template>
  </LiTransaction>
</template>

<script>
import LiTransaction from "./LiTransaction"
import num, { atoms, viewDenom } from "../../scripts/num.js"

export default {
  name: `li-gov-transaction`,
  components: { LiTransaction },
  props: {
    tx: {
      type: Object,
      required: true
    },
    fees: {
      type: Object,
      default: null
    },
    url: {
      type: String,
      required: true
    },
    bondingDenom: {
      type: String,
      required: true
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
    atoms,
    viewDenom
  }),
  computed: {
    initialDeposit() {
      return num.createDisplayCoin(this.tx.initial_deposit[0])
    },
    deposit() {
      return num.createDisplayCoin(this.tx.amount[0])
    },
    convertedFees() {
      return this.fees ? num.createDisplayCoin(this.fees) : undefined
    }
  }
}
</script>
