<template>
  <LiTransaction
    :color="`#15CFCC`"
    :time="time"
    :block="block"
    :memo="memo"
    :fees="fees"
    :hide-meta-data="hideMetaData"
  >
    <template v-if="txType === `cosmos-sdk/MsgSubmitProposal`">
      <div slot="caption">
        Submitted {{ tx.proposal_type.toLowerCase() }} proposal
        <b>{{ initialDeposit.amount | toAtoms | prettyLong }}</b>
        <span>{{ initialDeposit.denom | viewDenom }}</span>
      </div>
      <div slot="details">
        Title:&nbsp;<i>{{ tx.title }}</i>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgDeposit`">
      <div slot="caption">
        Deposited
        <template>
          <b>{{ deposit.amount | toAtoms | prettyLong }}</b>
          <span>{{ deposit.denom | viewDenom }}</span>
        </template>
      </div>
      <div slot="details">
        On&nbsp;
        <router-link :to="`${url}/${tx.proposal_id}`">
          Proposal &#35;{{ tx.proposal_id }}
        </router-link>
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
    </template>
  </LiTransaction>
</template>

<script>
import LiTransaction from "./LiTransaction"
import { atoms as toAtoms, prettyLong, viewDenom } from "../../scripts/num"

export default {
  name: `li-gov-transaction`,
  components: { LiTransaction },
  filters: {
    toAtoms,
    prettyLong,
    viewDenom
  },
  props: {
    tx: {
      type: Object,
      required: true
    },
    fees: {
      type: Object,
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
    txType: {
      type: String,
      required: true
    },
    time: {
      type: String,
      default: null
    },
    block: {
      type: Number,
      required: true
    },
    memo: {
      type: String,
      default: null
    },
    hideMetaData: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    initialDeposit() {
      return this.tx.initial_deposit[0]
    },
    deposit() {
      return this.tx.amount[0]
    }
  }
}
</script>
