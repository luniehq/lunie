<template>
  <div>
    <template v-for="dayTxs in days">
      <div :key="getDate(dayTxs[0])">
        <h1 v-if="getDate(dayTxs[0]) === getDate({ time: new Date() })">
          Today
        </h1>
        <h1 v-else>{{ dayTxs[0] | date }}</h1>
        <TransactionItem
          v-for="msg in dayTxs"
          :key="msg.key"
          :transaction="msg"
          :validators="validators"
          :address="address"
        />
      </div>
    </template>
  </div>
</template>

<script>
import TransactionItem from "./TransactionItem"
import groupBy from "lodash.groupby"
import moment from "moment"

function getDate(tx) {
  var dateObj = tx.time
  var month = dateObj.getUTCMonth() + 1 //months from 1-12
  var day = dateObj.getUTCDate()
  var year = dateObj.getUTCFullYear()

  return year + "/" + month + "/" + day
}

export default {
  name: `transaction-list`,
  components: {
    TransactionItem
  },
  filters: {
    date(tx) {
      return moment(tx.time).format("MMM Do YYYY")
    }
  },
  props: {
    transactions: {
      type: Array,
      required: true
    },
    address: {
      type: String,
      default: null
    },
    validators: {
      type: Object,
      required: true
    }
  },
  computed: {
    days() {
      return groupBy(this.transactions, getDate)
    }
  },
  methods: {
    getDate
  }
}
</script>
