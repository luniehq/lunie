<template>
  <tm-li-transaction
    :color="color"
    :time="transaction.time"
    :block="transaction.height"
  >
    <template v-if="propose">
      <div slot="caption">
        Submitted {{ tx.proposal_type.toLowerCase() }} proposal initial
        deposit&nbsp;<b>{{ pretty(tx.initial_deposit[0].amount) }}</b
        ><span>&nbsp;{{ tx.initial_deposit[0].denom }}s</span>
      </div>
      <div slot="details">
        Title:&nbsp;<i>{{ tx.title }}</i>
      </div>
    </template>
    <template v-if="deposit">
      <div slot="caption">
        Deposited&nbsp;
        <template>
          <b>{{ pretty(tx.amount[0].amount) }}</b>
          <span>&nbsp;{{ tx.amount[0].denom }}s</span>
        </template>
      </div>
      <div slot="details">
        On&nbsp;
        <router-link :to="URL + '/' + tx.proposal_id">
          Proposal &#35;{{ tx.proposal_id }}
        </router-link>
      </div>
    </template>
  </tm-li-transaction>
</template>

<script>
import TmLiTransaction from "./TmLiTransaction"
import colors from "./transaction-colors.js"
import { pretty } from "../../scripts/num.js"

export default {
  name: `tm-li-gov-transaction`,
  components: { TmLiTransaction },
  props: {
    transaction: {
      type: Object,
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
    propose() {
      return this.type === `cosmos-sdk/MsgSubmitProposal`
    },
    deposit() {
      return this.type === `cosmos-sdk/MsgDeposit`
    },
    color() {
      if (this.propose) return colors.gov.propose
      return colors.gov.deposit
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
  font-size: var(--sm);
  color: var(--dim);
}

.tm-li-tx .tx-coin .value:before {
  content: "";
  display: inline;
}

.tm-li-tx .tx-coin .key {
  font-weight: 500;
  font-size: var(--m);
}

.tm-li-tx .tx-coin .value,
.tm-li-tx .tx-coin .key {
  line-height: 1.5rem;
}

.tm-li-tx.tm-li-tx-sent .tx-coin .value:before {
  content: "-";
}

.tm-li-tx.tm-li-tx-received .tx-icon {
  background: var(--app-fg);
}

.tm-li-tx.tm-li-tx-received .tx-coin .value {
  color: var(--success);
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
