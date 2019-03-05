<template>
  <li-transaction
    :color="`#ED553B`"
    :time="transaction.time"
    :block="transaction.height"
  >
    <template v-if="sent">
      <div slot="caption">
        Sent&nbsp;<b>{{ atoms(coins.amount) }}</b><span>&nbsp;{{ coins.denom.toUpperCase() }}</span>
      </div>
      <span
        slot="details"
      >
        <template
          v-if="sentSelf"
        >
          To yourself!
        </template><template
          v-else
        >
          To {{ receiver }}
        </template>
      </span>
    </template><template v-else>
      <div slot="caption">
        Received&nbsp;<b>{{ atoms(coins.amount) }}</b><span>&nbsp;{{ coins.denom.toUpperCase() }}</span>
      </div>
      <span slot="details">From {{ sender }}</span>
    </template>
  </li-transaction>
</template>

<script>
import LiTransaction from "./LiTransaction"
import { atoms } from "../../scripts/num.js"

export default {
  name: `li-bank-transaction`,
  components: { LiTransaction },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    address: {
      type: String,
      default: null
    }
  },
  data: () => ({
    atoms
  }),
  computed: {
    tx() {
      return this.transaction.tx.value.msg[0].value
    },
    // TODO: sum relevant inputs/outputs
    sentSelf() {
      return this.tx.from_address === this.tx.to_address
    },
    sent() {
      return this.tx.from_address === this.address
    },
    sender() {
      return this.tx.from_address
    },
    coins() {
      return this.tx.amount[0]
    },
    receiver() {
      return this.tx.to_address
    }
  }
}
</script>

<style>
.li-tx {
  display: flex;
  font-size: var(--sm);
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

.li-tx .tx-address {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--dim);
  font-size: var(--sm);
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
