<template>
  <div class="table four-columns">
    <div class="table-cell big title">Total</div>
    <div class="table-cell title">Rewards</div>
    <div class="table-cell title available">Available</div>
    <div class="table-cell title actions"></div>

    <p
      v-if="
        delegationsLoaded &&
        currentNetwork.network_type === `polkadot` &&
        delegations.length === 0
      "
    >
      You need to select at least one validator to start earning rewards
    </p>

    <table class="data-table">
      <tbody>
        <BalanceRow
          v-for="balance in balances"
          :key="balance.id"
          :balance="balance"
          :total-rewards-per-denom="totalRewardsPerDenom"
          :send="true"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import BalanceRow from "common/BalanceRow"
export default {
  name: `table-balances`,
  components: {
    BalanceRow,
  },
  props: {
    balances: {
      type: Array,
      required: true,
    },
    totalRewardsPerDenom: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({
    sort: {
      property: `id`,
      order: `desc`,
    },
    delegationsLoaded: false,
  }),
  computed: {
    ...mapGetters([`address`, `currentNetwork`]),
  },
  apollo: {
    /* istanbul ignore next */
    delegations: {
      query: gql`
        query delegations($networkId: String!, $delegatorAddress: String!) {
          delegations(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
          ) {
            id
          }
        }
      `,
      /* istanbul ignore next */
      skip() {
        return !this.address
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          delegatorAddress: this.currentNetwork.id,
        }
      },
      /* istanbul ignore next */
      update(data) {
        this.delegationsLoaded = true
        return data.delegations
      },
    },
  },
}
</script>
<style scoped>
.table {
  display: flex;
  flex-wrap: wrap;
  padding: 1rem 2rem 3rem;
  margin: 0 auto;
}

.table-cell {
  flex-grow: 1;
  padding: 0.5rem 0.5rem 0.5rem 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  width: 20%;
  font-family: "SF Pro Text", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
  position: relative;
  white-space: nowrap;
}

.table-cell.big {
  width: 40%;
  padding-left: 1rem;
}

.table-cell.big.title {
  padding-left: 0;
}

.title {
  color: var(--dim);
  font-size: var(--sm);
  padding-bottom: 1rem;
  padding-left: 0;
}

@media screen and (max-width: 667px) {
  .table {
    padding: 1rem;
  }

  .table-cell.big {
    width: 60%;
    padding-left: 0;
    padding-right: 0;
  }

  .table-cell {
    width: 40%;
  }

  .available {
    display: none;
  }
}

@media screen and (max-width: 1254px) {
  .actions {
    display: none;
  }
}
</style>
