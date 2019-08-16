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
import { getUnbondTimeFromTX } from "scripts/time"

export default {
  name: `undelegations`,
  components: {
    TransactionList
  },
  data: () => ({
    getUnbondTimeFromTX
  }),
  computed: {
    ...mapState([`transactions`, `delegation`, `bondDenom`, `session`]),
    ...mapGetters([`yourValidators`]),
    unbondingTransactions: ({ transactions, delegation } = this) =>
      transactions.staking &&
      transactions.staking
        .filter(transaction => {
          // Checking the type of transaction
          if (transaction.tx.value.msg[0].type !== `cosmos-sdk/MsgUndelegate`)
            return false

          // getting the unbonding time and checking if it has passed already
          const unbondingEndTime = getUnbondTimeFromTX(
            transaction,
            delegation.unbondingDelegations
          )

          if (unbondingEndTime && unbondingEndTime >= Date.now()) return true
        })
        .map(transaction => ({
          ...transaction,
          unbondingDelegation:
            delegation.unbondingDelegations[
              transaction.tx.value.msg[0].value.validator_address
            ]
        }))
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
