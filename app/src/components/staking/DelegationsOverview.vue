<template>
  <div class="delegations-overview">
    <div class="table-container">
      <div
        v-if="$apollo.queries.delegations.loading && !delegationsLoaded"
        class="loading-image-container"
      >
        <img
          class="loading-image"
          src="/img/portfolio-loading.svg"
          alt="geometric placeholder shapes"
        />
      </div>
      <div v-else-if="delegations.length > 0 || stakedBalance.total > 0">
        <h1>Your Stake</h1>
        <BalanceRow
          v-if="stakedBalance.total > 0"
          :balance="stakedBalance"
          :total-rewards-per-denom="totalRewardsPerDenom"
          :stake="currentNetwork.network_type === 'polkadot'"
          :unstake="currentNetwork.network_type === 'polkadot'"
        />
        <TableValidators
          v-if="delegations.length > 0"
          :validators="delegations.map(({ validator }) => validator)"
          :delegations="delegations"
          class="table-validators"
          show-on-mobile="expectedReturns"
        />
      </div>
      <TmDataMsg
        v-if="!$apollo.loading && delegations.length === 0"
        icon="sentiment_dissatisfied"
      >
        <div slot="title">No validators in your portfolio</div>
        <div slot="subtitle">
          Head over to the
          <a @click="goToValidators()">validator list</a>&nbsp;to
          {{
            stakedBalance.total > 0 ? `start earning rewards` : `get staking`
          }}!
        </div>
      </TmDataMsg>
      <UndelegationModal ref="UnstakeModal" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import BalanceRow from "common/BalanceRow"
import TmDataMsg from "common/TmDataMsg"
import TableValidators from "staking/TableValidators"
import UndelegationModal from "src/ActionModal/components/UndelegationModal"
import {
  ValidatorFragment,
  DelegationsForDelegator,
  UserTransactionAdded,
} from "src/gql"
import gql from "graphql-tag"

export default {
  name: `delegations-overview`,
  components: {
    BalanceRow,
    TableValidators,
    UndelegationModal,
    TmDataMsg,
  },
  data: () => ({
    delegations: [],
    balances: [],
    rewards: [],
    delegationsLoaded: false,
    preferredCurrency: "USD",
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`address`, `currentNetwork`]),
    stakedBalance() {
      // balances not loaded yet
      if (!this.balances.length) {
        return {
          total: 0,
          denom: this.currentNetwork.stakingDenom,
        }
      }
      const stakingDenomBalance = this.balances.find(
        ({ denom }) => denom === this.currentNetwork.stakingDenom
      )
      return {
        total: stakingDenomBalance
          ? Number(stakingDenomBalance.staked).toFixed(3)
          : 0,
        denom: this.currentNetwork.stakingDenom,
      }
    },
    totalRewardsPerDenom() {
      return this.rewards.reduce((all, reward) => {
        return {
          ...all,
          [reward.denom]: parseFloat(reward.amount) + (all[reward.denom] || 0),
        }
      }, {})
    },
  },
  mounted: function () {
    const persistedPreferredCurrency = this.session.preferredCurrency
    if (persistedPreferredCurrency) {
      this.preferredCurrency = persistedPreferredCurrency
    }
  },
  methods: {
    goToValidators() {
      this.$router.push({
        name: "validators",
        params: {
          networkId: this.currentNetwork.slug,
        },
      })
    },
    openUnstakeModal() {
      this.$refs.UnstakeModal.open()
    },
  },
  apollo: {
    balances: {
      query: gql`
        query($networkId: String!, $address: String!) {
          balancesV2(networkId: $networkId, address: $address) {
            id
            type
            denom
            available
            total
            staked
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.currentNetwork.id,
          address: this.address,
        }
      },
      /* istanbul ignore next */
      skip() {
        return !this.address
      },
      update(result) {
        return result.balancesV2
      },
    },
    delegations: {
      query() {
        /* istanbul ignore next */
        return DelegationsForDelegator(this.currentNetwork.id)
      },
      variables() {
        /* istanbul ignore next */
        return {
          delegatorAddress: this.address,
          networkId: this.currentNetwork.id,
        }
      },
      /* istanbul ignore next */
      update(data) {
        this.delegationsLoaded = true
        return data.delegations || []
      },
    },
    rewards: {
      query: gql`
        query rewards(
          $networkId: String!
          $delegatorAddress: String!
          $fiatCurrency: String
        ) {
          rewards(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
            fiatCurrency: $fiatCurrency
          ) {
            id
            amount
            denom
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.currentNetwork.id,
          delegatorAddress: this.address,
          fiatCurrency: this.preferredCurrency,
        }
      },
      /* istanbul ignore next */
      skip() {
        return !this.address
      },
    },
    $subscribe: {
      userTransactionAdded: {
        variables() {
          return {
            networkId: this.currentNetwork.id,
            address: this.address,
          }
        },
        skip() {
          return !this.address
        },
        query: UserTransactionAdded,
        result({ data }) {
          /* istanbul ignore next */
          if (data.userTransactionAddedV2.success) {
            this.$apollo.queries.delegations.refetch()
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
  padding-bottom: 2rem;
}

.delegations-overview {
  background: var(--app-fg);
}

.table-container {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 4rem 2rem;
}

.table-validators {
  margin-top: 2rem;
}

.tm-form-msg--desc {
  padding-bottom: 1rem;
}

.tm-data-msg {
  margin-top: 1rem;
}

@media screen and (max-width: 667px) {
  h1 {
    padding: 2rem;
    text-align: center;
  }

  .loading-image-container {
    padding: 2rem;
  }

  .table-container {
    padding: 4rem 1rem;
  }
}
</style>
