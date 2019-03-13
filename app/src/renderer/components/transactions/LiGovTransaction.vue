<template>
  <li-transaction
    :color="`#15CFCC`"
    :time="transaction.time"
    :block="transaction.height"
  >
    <template v-if="txType === `cosmos-sdk/MsgSubmitProposal`">
      <div slot="caption">
        Submit {{ tx.proposal_type.toLowerCase() }} proposal&nbsp;
        <b>{{ totalProposalCreation }}</b>
        <span>&nbsp;{{ tx.initial_deposit[0].denom }}s</span>
      </div>
      <div slot="details">
        Title:&nbsp;<i>{{ tx.title }}</i>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgDeposit`">
      <div slot="caption">
        Deposit&nbsp;
        <template>
          <b>{{ totalDeposit }}</b>
          <span>&nbsp;{{ tx.amount[0].denom }}s</span>
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
      <div slot="caption">
        Vote&nbsp;{{ tx.option }}&nbsp;
        <template>
          <b>{{ totalFeesOnly }}&nbsp;</b>
          <span>{{ feeDenom }}</span>
        </template>
      </div>
      <div slot="details">
        On&nbsp;
        <router-link :to="`${url}/${tx.proposal_id}`">
          Proposal &#35;{{ tx.proposal_id }}
        </router-link>
      </div>
    </template>
  </li-transaction>
</template>

<script>
import LiTransaction from "./LiTransaction"
import { full, atoms } from "../../scripts/num.js"

export default {
  name: `li-gov-transaction`,
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
    }
  },
  data: () => ({
    full,
    atoms
  }),
  computed: {
    tx() {
      return this.transaction.tx.value.msg[0].value
    },
    totalProposalCreation({ tx, fees, full, atoms } = this) {
      if (fees && fees[tx.initial_deposit[0].denom]) {
        return full(
          atoms(tx.initial_deposit[0].amount) +
            atoms(fees[tx.initial_deposit[0].denom])
        )
      }
      return full(atoms(tx.initial_deposit[0].amount))
    },
    totalDeposit({ tx, fees, full, atoms } = this) {
      if (fees && fees[tx.amount[0].denom]) {
        return full(
          atoms(tx.amount[0].amount) + atoms(fees[tx.amount[0].denom])
        )
      }
      return full(atoms(tx.amount[0].amount))
    },
    totalFeesOnly({ fees, full, atoms, bondingDenom } = this) {
      if (fees && fees[bondingDenom]) {
        return full(atoms(fees[bondingDenom]))
      }
      return ``
    },
    feeDenom({ fees } = this) {
      if (fees) {
        const feeDenoms = Object.keys(fees)
        return `${feeDenoms[0]}s`
      }
      return ``
    }
  }
}
</script>
