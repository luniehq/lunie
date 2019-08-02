<template>
  <div>
    <LiAnyTransaction
      v-for="tx in unbondingTransactions"
      :key="tx.txhash"
      :validators="yourValidators"
      :validators-url="`/validators`"
      :proposals-url="`/governance`"
      :transaction="tx"
      :address="session.address"
      :bonding-denom="bondDenom"
      :unbonding-time="
        time.getUnbondingTime(tx, delegation.unbondingDelegations)
      "
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import LiAnyTransaction from "../transactions/LiAnyTransaction"
import time from "scripts/time"

export default {
  name: `delegations-overview`,
  components: {
    LiAnyTransaction
  },
  data: () => ({
    time
  }),
  computed: {
    ...mapGetters([
      `transactions`,
      `delegation`,
      `bondDenom`,
      `session`,
      `yourValidators`
    ]),
    unbondingTransactions: ({ transactions, delegation } = this) =>
      transactions.staking &&
      transactions.staking
        .filter(transaction => {
          // Checking the type of transaction
          if (transaction.tx.value.msg[0].type !== `cosmos-sdk/MsgUndelegate`)
            return false

          // getting the unbonding time and checking if it has passed already
          const unbondingEndTime = time.getUnbondingTime(
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
  },
  watch: {
    "session.signedIn": function() {
      this.loadStakingTxs()
    }
  },
  async mounted() {
    this.loadStakingTxs()
  },
  methods: {
    async loadStakingTxs() {
      if (this.session.signedIn) {
        await this.$store.dispatch(`getAllTxs`)
      }
    }
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
