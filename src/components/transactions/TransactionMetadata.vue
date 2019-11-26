<template>
  <div>
    <div class="tx__metadata">
      Block
      <router-link :to="{ name: `block`, params: { height } }"
        >#{{ height | prettyInt }}&nbsp;</router-link
      >@&nbsp;{{ date }}
    </div>
    <p v-if="memo">Memo: {{ memo }}</p>
    <div>
      Network Fee:&nbsp;
      <b>{{ fee.amount }}</b>
      <span> {{ fee.denom }}</span>
    </div>
    <p class="hash">Hash: {{ hash }}</p>
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
    timestamp: {
      type: Date,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    fee: {
      type: Object,
      required: true
    },
    memo: {
      type: String,
      required: false,
      default: ``
    },
    hash: {
      type: String,
      required: true
    }
  },
  computed: {
    date() {
      const momentTime = moment(this.timestamp)
      return momentTime.format(`HH:mm:ss`)
    }
  }
}
</script>
<style scoped>
.tx__metadata {
  margin-top: 0.5rem;
}

.hash {
  color: var(--dim);
  word-break: break-all;
}
</style>
