<template>
  <div>
    <div>
      Network Fee:&nbsp;
      <b>{{ fees.amount | toAtoms }}</b>
      <span>{{ fees.denom | viewDenom }}</span>
    </div>
    <div>
      <router-link :to="{ name: `block`, params: { height: block } }">Block #{{ block }}&nbsp;</router-link>
      @&nbsp;{{ date }}
    </div>
  </div>
</template>

<script>
import moment from "moment"
import { atoms as toAtoms, viewDenom } from "../../scripts/num.js"

export default {
  name: `li-transaction`,
  filters: {
    toAtoms,
    viewDenom
  },
  props: {
    time: {
      type: Date,
      required: true
    },
    block: {
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

<style></style>
