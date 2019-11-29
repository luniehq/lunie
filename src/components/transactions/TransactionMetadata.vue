<template>
  <div class="tx__metadata">
    <div>
      <i class="material-icons">widgets</i> Block
      <router-link
        :to="{ name: `block`, params: { height: transaction.height } }"
      >
        #{{ transaction.height | prettyInt }}
      </router-link>
      <i class="material-icons">access_time</i> {{ date }}
    </div>
    <p v-if="transaction.liquidDate">
      <i class="material-icons">calendar_today</i>
      Liquid date:
      {{ transaction.liquidDate }}
    </p>
    <p v-if="transaction.memo">
      <i class="material-icons">message</i> Memo: {{ transaction.memo }}
    </p>
    <div>
      <i class="material-icons">call_split</i>
      Fee:
      <b>{{ transaction.fee.amount }}</b>
      <span> {{ transaction.fee.denom }}</span>
    </div>
    <p class="hash">
      <i class="material-icons">fingerprint</i>
      Hash: {{ transaction.hash }}
    </p>
  </div>
</template>

<script>
import moment from "moment"
import { atoms, viewDenom } from "scripts/num.js"
import { prettyInt } from "scripts/num"

export default {
  name: `transaction-metadata`,
  filters: {
    atoms,
    viewDenom,
    prettyInt
  },
  props: {
    transaction: {
      type: Object,
      required: true
    }
  },
  computed: {
    date() {
      const momentTime = moment(this.transaction.timestamp)
      return momentTime.format(`HH:mm:ss`)
    }
  }
}
</script>
<style scoped>
.tx__metadata {
  margin-top: 0.5rem;
}

.material-icons {
  font-size: 1rem;
  padding-bottom: 1px;
  vertical-align: text-bottom;
}

.hash {
  color: var(--dim);
  word-break: break-all;
}
</style>
