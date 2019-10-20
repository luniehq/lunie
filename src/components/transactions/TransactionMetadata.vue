<template>
  <div>
    <div>
      Network Fee:&nbsp;
      <b>{{ fees.amount }}</b>
      <span> {{ fees.denom }}</span>
    </div>
    <div>
      <router-link :to="{ name: `block`, params: { height } }"
        >Block #{{ height }}&nbsp;</router-link
      >
      @&nbsp;{{ date }}
    </div>
  </div>
</template>

<script>
import moment from "moment"
import { atoms, viewDenom } from "scripts/num.js"

export default {
  name: `transaction-fees`,
  filters: {
    atoms,
    viewDenom
  },
  props: {
    time: {
      type: Date,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    fees: {
      type: Object,
      required: true
    }
  },
  computed: {
    date() {
      const momentTime = moment(this.time)
      return momentTime.format(
        `${moment().isSame(momentTime, `day`) ? `` : `MMM Do YYYY `}HH:mm:ss`
      )
    }
  }
}
</script>
