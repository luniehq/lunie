<template>
  <div>
    <template v-for="group in groupedTransactions">
      <div :key="group[0].title">
        <h1>{{ group[0].title }}</h1>
        <TransactionItem
          v-for="{ tx } in group"
          :key="tx.key"
          :transaction="tx"
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

function parseDateString(date) {
  var month = dateObj.getUTCMonth() + 1 //months from 1-12
  var day = dateObj.getUTCDate()
  var year = dateObj.getUTCFullYear()

  return year + "/" + month + "/" + day
}

function stripTime(momentTime) {
  return momentTime
    .hours(0)
    .minutes(0)
    .seconds(0)
}

const categories = [
  {
    title: "Today",
    matcher: tx => {
      return stripTime(moment(tx.time)).isSame(stripTime(moment()))
    }
  },
  {
    title: "Yesterday",
    matcher: tx => {
      return stripTime(moment(tx.time)).isSame(
        stripTime(moment().subtract(1, "days"))
      )
    }
  },
  {
    title: "Last Week",
    matcher: tx => {
      return stripTime(moment(tx.time)).isBetween(
        stripTime(moment().subtract(2, "days")),
        stripTime(moment().subtract(7, "days"))
      )
    }
  }
]

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
    groupedTransactions() {
      return groupBy(this.categorizedTransactions, "title")
    },
    categorizedTransactions() {
      return this.transactions.map(tx => {
        // check if the tx is in Today, Yesterday or Last Week
        const category = categories.find(({ matcher }) => matcher(tx))
        if (category) {
          return {
            title: category.title,
            tx
          }
        }

        // check if tx is in a month this year
        const date = moment(tx.time)
        const today = moment()
        if (date.year() === today.year()) {
          return {
            title: date.format("MMMM"),
            tx
          }
        }

        // tx is in a month another year
        return {
          title: date.format("MMMM YY"),
          tx
        }
      })
    }
  },
  methods: {
    parseDateString
  }
}
</script>
