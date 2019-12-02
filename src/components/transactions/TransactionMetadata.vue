<template>
  <div class="tx__metadata">
    <p>
      Block
      <router-link
        :to="{ name: `block`, params: { height: transaction.height } }"
      >
        #{{ transaction.height | prettyInt }}</router-link
      >&nbsp;<i class="material-icons">access_time</i>&nbsp;{{ date }}
    </p>
    <p v-if="transaction.undelegationEndTime">
      Liquid date:
      {{ getUndelegationEndTime() }}
    </p>
    <p v-if="transaction.memo">
      <i class="material-icons">message</i> Memo: {{ transaction.memo }}
    </p>
    <p>
      Fee:
      <b>{{ transaction.fee.amount }}</b>
      <span> {{ transaction.fee.denom }}</span>
    </p>
    <p>
      Hash: <span class="hash">{{ transaction.hash }}</span>
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
  },
  methods: {
    getUndelegationEndTime() {
      return moment(new Date(this.transaction.undelegationEndTime))
    }
  }
}
</script>
<style scoped>
.material-icons {
  font-size: 1rem;
  vertical-align: middle;
  margin-bottom: 2px;
}

.hash {
  color: var(--dim);
  word-break: break-all;
}
</style>
