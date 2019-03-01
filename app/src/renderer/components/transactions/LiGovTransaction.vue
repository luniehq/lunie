<template>
  <li-transaction
    :color="`#3CB371`"
    :time="transaction.time"
    :block="transaction.height"
  >
    <template v-if="txType === `cosmos-sdk/MsgSubmitProposal`">
      <div slot="caption">
        Submit {{ tx.proposal_type.toLowerCase() }} proposal&nbsp;<b>{{ atoms(tx.initial_deposit[0].amount) }}</b><span>&nbsp;{{ tx.initial_deposit[0].denom }}s</span>
      </div>
      <div slot="details">
        Title:&nbsp;<i>{{ tx.title }}</i>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgDeposit`">
      <div slot="caption">
        Deposit&nbsp;
        <template>
          <b>{{ pretty(atoms(tx.amount[0].amount)) }}</b>
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
        Vote&nbsp;<b>{{ tx.option }}</b>
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
import { pretty, atoms } from "../../scripts/num.js"

export default {
  name: `li-gov-transaction`,
  components: { LiTransaction },
  props: {
    transaction: {
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
    }
  },
  data: () => ({
    pretty,
    atoms
  }),
  computed: {
    tx() {
      return this.transaction.tx.value.msg[0].value
    }
  }
}
</script>

<style>
.li-tx {
	display: flex;
	font-size: sm;
}

.li-tx .tx-icon {
	padding: 0 0.5rem;
	background: var(--app-fg);
	display: flex;
	align-items: center;
	justify-content: center;
}

.li-tx .tx-container {
	flex-direction: column;
	flex-wrap: nowrap;
	padding: 0.5rem 0;
	margin: 0.5rem 0;
	display: flex;
	width: 100%;
	min-width: 0;
}

.li-tx .tx-element {
	padding: 0 2rem 0 1.5rem;
	line-height: 1.5rem;
}

.li-tx .tx-coin .value {
	flex: 0 0 100%;
	font-size: var(--sm);
	color: var(--dim);
}

.li-tx .tx-coin .value::before {
	content: "";
	display: inline;
}

.li-tx .tx-coin .key {
	font-weight: 500;
	font-size: var(--m);
}

.li-tx .tx-coin .value,
.li-tx .tx-coin .key {
	line-height: 1.5rem;
}

.li-tx.li-tx-sent .tx-coin .value::before {
	content: "-";
}

.li-tx.li-tx-received .tx-icon {
	background: var(--app-fg);
}

.li-tx.li-tx-received .tx-coin .value {
	color: var(--success);
}

.li-tx.li-tx-received .tx-coin .value::before {
	content: "+";
}

.li-tx:hover {
	cursor: pointer;
}

@media screen and (min-width: 700px) {
	.li-tx {
		font-size: 0.875rem;
	}

	.li-tx .tx-container {
		flex-direction: row;
	}

	.li-tx .tx-container .tx-coins {
		flex: 0 0 9rem;
		padding: 0;
		min-width: 0;
	}

	.li-tx .tx-container .tx-coins .tx-coin {
		padding: 0 1.5rem 0;
	}

	.li-tx .tx-container .tx-coins .tx-coin .key {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}
</style>
