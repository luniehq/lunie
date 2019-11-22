<template>
  <div>
    <div class="tx__metadata">
      Block:
      <router-link :to="{ name: `block`, params: { height } }"
        >#{{ height }}&nbsp;</router-link
      >
      @&nbsp;{{ date }}
    </div>
    <div>
      Network Fee:&nbsp;
      <b>{{ fee.amount }}</b>
      <span> {{ fee.denom }}</span>
    </div>
  </div>
</template>

<script>
import moment from "moment"
import { atoms, viewDenom } from "scripts/num.js"

export default {
  name: `transaction-metadata`,
  filters: {
    atoms,
    viewDenom
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
    }
  },
  computed: {
    date() {
      const momentTime = moment(this.timestamp)
      return momentTime.format(
        `${moment().isSame(momentTime, `day`) ? `` : `MMM Do YYYY `}HH:mm:ss`
      )
    }
  }
}
</script>
<style scoped>
.tx__metadata {
  margin-top: 0.5rem;
}
</style>
