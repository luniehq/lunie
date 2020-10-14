<template>
  <div v-if="undelegations.length > 0" class="undelegations">
    <div class="table-container">
      <div
        v-if="$apollo.queries.undelegations.loading && !undelegationsLoaded"
        class="loading-image-container"
      >
        <img
          class="loading-image"
          src="/img/portfolio-loading.svg"
          alt="geometric placeholder shapes"
        />
      </div>
      <div v-else>
        <div class="header-container">
          <h1>Unstaking</h1>
          <div class="buttons">
            <TmBtn
              v-if="currentNetwork.network_type === `polkadot`"
              class="withdraw-button"
              value="Withdraw Unstaked"
              @click.native="onWithdraw()"
            />
          </div>
        </div>
        <template v-if="currentNetwork.network_type === `polkadot`">
          <BalanceRow
            v-for="balance in balances"
            :key="balance.id"
            :balance="balance"
          />
        </template>
        <TableUndelegations v-else :undelegations="undelegations" />
      </div>
    </div>
    <ModalWithdrawUnstaked ref="WithdrawModal" />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import BalanceRow from "common/BalanceRow"
import TmBtn from "common/TmBtn"
import TableUndelegations from "staking/TableUndelegations"
import ModalWithdrawUnstaked from "src/ActionModal/components/ModalWithdrawUnstaked"
import { ValidatorFragment, UserTransactionAdded } from "src/gql"
import gql from "graphql-tag"

export default {
  name: `undelegations`,
  components: {
    TableUndelegations,
    BalanceRow,
    ModalWithdrawUnstaked,
    TmBtn,
  },
  data: () => ({
    undelegations: [],
    undelegationsLoaded: false,
  }),
  computed: {
    ...mapGetters([`address`, `network`, `currentNetwork`]),
    balances() {
      return this.undelegations.map((undelegation) => {
        return {
          ...undelegation,
          total: undelegation.amount,
          denom: this.currentNetwork.stakingDenom,
        }
      })
    },
    readyUndelegations() {
      const now = new Date()
      return !!this.undelegations.find(({ endTime }) => {
        return new Date(endTime) <= now
      })
    },
  },
  methods: {
    onWithdraw() {
      this.$refs.WithdrawModal.open()
    },
  },
  apollo: {
    undelegations: {
      query() {
        /* istanbul ignore next */
        return gql`
        query undelegations($networkId: String!, $delegatorAddress: String!) {
          undelegations(networkId: $networkId, delegatorAddress: $delegatorAddress) {
            id
            validator {
              ${ValidatorFragment}
            }
            amount
            startHeight
            endTime
          }
        }
      `
      },
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network,
          delegatorAddress: this.address,
        }
      },
      /* istanbul ignore next */
      update(data) {
        this.undelegationsLoaded = true
        return data.undelegations
      },
    },
    $subscribe: {
      userTransactionAdded: {
        variables() {
          /* istanbul ignore next */
          return {
            networkId: this.network,
            address: this.address,
          }
        },
        skip() {
          /* istanbul ignore next */
          return !this.address
        },
        query: UserTransactionAdded,
        result({ data }) {
          /* istanbul ignore next */
          if (data.userTransactionAddedV2.success) {
            this.$apollo.queries.undelegations.refetch()
          }
        },
      },
    },
  },
}
</script>
<style scoped>
h1 {
  font-size: 24px;
  color: var(--bright);
  font-weight: 400;
  padding: 1rem 0 2rem;
}

.undelegations {
  background: var(--app-fg);
}

.table-container {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 0 2rem 8rem;
}

.balance-row {
  display: flex;
}

.header-container {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  padding: 1rem 2rem 2rem;
  width: 100%;
}

.header-container button {
  margin-right: 0.5rem;
}

.buttons {
  display: flex;
  align-items: center;
}

@media screen and (max-width: 667px) {
  h1 {
    padding: 2rem;
    text-align: center;
  }

  .table-container {
    padding: 0 1rem 8rem;
  }

  .header-container {
    flex-direction: column;
    padding: 0 1rem 1rem 0;
  }
}
</style>
