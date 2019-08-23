<template>
  <div>
    <TransactionList
      :transactions="unbondingTransactions"
      :address="session.address"
      :validators="yourValidators"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import TransactionList from "transactions/TransactionList"
import { isPendingUndelegation } from "scripts/transaction-utils"

export default {
  name: `undelegations`,
  components: {
    TransactionList
  },
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`flatOrderedTransactionList`, `yourValidators`]),
    unbondingTransactions: ({ flatOrderedTransactionList } = this) =>
      flatOrderedTransactionList.filter(isPendingUndelegation)
  }
}
</script>
<style>
.unbonding-transactions .tm-li-tx::before {
  position: absolute;
  width: 2rem;
  text-align: right;
  color: var(--dim);
  left: 0;
}
</style>
