<template>
  <div>
    <template v-for="group in groupedTransactions">
      <div :key="group[0].title">
        <h3>{{ group[0].title }}</h3>
        <TransactionItem
          v-for="tx in group"
          :key="tx.hash"
          :transaction="tx.tx"
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
import orderBy from "lodash.orderby"
import moment from "moment"

const categories = [
  {
    title: "Today",
    matcher: tx => {
      return moment(tx.timestamp).isSame(moment(), "day")
    }
  },
  {
    title: "Yesterday",
    matcher: tx => {
      return moment(tx.timestamp).isSame(moment().subtract(1, "days"), "day")
    }
  }
]

export default {
  name: `transaction-list`,
  components: {
    TransactionItem
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
      return orderBy(
        groupBy(this.categorizedTransactions, "title"),
        group => group[0].tx.timestamp,
        "desc"
      )
    },
    categorizedTransactions() {
      return this.transactions.map(tx => {
        // check if the tx is in Today, Yesterday or Last Week
        const dateString = ` (` + moment(tx.timestamp).format("MMMM Do") + `)`
        const category = categories.find(({ matcher }) => matcher(tx))
        if (category) {
          return {
            title: category.title + dateString,
            tx
          }
        }

        // check if tx is in a month this year
        const date = moment(tx.timestamp)
        const today = moment()
        if (date.year() === today.year()) {
          return {
            title: date.format("MMMM Do"),
            tx
          }
        }

        // tx is in a month another year
        return {
          title: date.format("MMMM Do, YYYY"),
          tx
        }
      })
    }
  }
}
</script>
<style scoped>
h3 {
  margin: 2rem 0 0.25rem 1rem;
  color: var(--dim);
  font-size: var(--sm);
  font-weight: 500;
}
</style>
