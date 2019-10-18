<template>
  <PageContainer
    :managed="true"
    :loading="$apollo.queries.validators.loading"
    :loaded="!$apollo.queries.validators.loading"
    :error="$apollo.queries.validators.error"
    :data-empty="validators && validators.length === 0"
    hide-header
  >
    <template slot="managed-body">
      <div class="filterOptions">
        <TmField
          v-model="searchTerm"
          class="searchField"
          placeholder="Search"
        />
        <div class="toggles">
          <TmBtn
            value="All"
            class="btn-radio secondary"
            :type="!activeOnly ? `active` : `secondary`"
            @click.native="activeOnly = !activeOnly"
          />
          <TmBtn
            value="Active"
            class="btn-radio secondary"
            :type="activeOnly ? `active` : `secondary`"
            @click.native="activeOnly = !activeOnly"
          />
        </div>
      </div>
      <TableValidators
        :validators="validatorsPlus"
        show-on-mobile="expectedReturns"
      />
      <div
        v-if="validators && validators.length === 0 && searchTerm"
        class="no-results"
      >
        No results for these search terms
      </div>
    </template>
  </PageContainer>
</template>

<script>
import { mapState } from "vuex"
import TableValidators from "staking/TableValidators"
import PageContainer from "common/PageContainer"
import TmField from "common/TmField"
import TmBtn from "common/TmBtn"
import gql from "graphql-tag"

export default {
  name: `tab-validators`,
  components: {
    TableValidators,
    PageContainer,
    TmField,
    TmBtn
  },
  data: () => ({
    searchTerm: "",
    activeOnly: true,
    validators: [],
    delegations: {},
    rewards: []
  }),
  computed: {
    ...mapState({
      network: state => state.connection.network,
      userAddress: state => state.session.address
    }),
    validatorsPlus() {
      return this.validators.map(validator => {
        if (this.delegations[validator.operatorAddress]) {
          validator.userShares = this.delegations[validator.operatorAddress]
        } else {
          validator.userShares = {
            amount: 0
          }
        }
        return validator
      })
    }
  },
  apollo: {
    delegations: {
      query: gql`
        query delegations($networkId: String!, $delegatorAddress: String!) {
          delegations(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
          ) {
            delegatorAddress
            validatorAddress
            amount
          }
        }
      `,
      variables() {
        return {
          networkId: this.network,
          delegatorAddress: this.userAddress
        }
      },
      update: result => {
        if (result.delegations) {
          return result.delegations.reduce((map, item) => {
            map[item.validatorAddress] = item
            return map
          }, {})
        }
        return {}
      }
    },
    rewards: {
      query: gql`
        query rewards($networkId: String!, $delegatorAddress: String) {
          rewards(networkId: $networkId, delegatorAddress: $delegatorAddress) {
            amount
            denom
          }
        }
      `,
      variables() {
        return {
          networkId: this.network,
          delegatorAddress: this.currentAddress
        }
      },
      update: result => result.rewards
    },
    validators: {
      query: gql`
        query validators($networkId: String!) {
          validators(networkId: $networkId) {
            name
            operatorAddress
            consensusPubkey
            jailed
            details
            website
            identity
            votingPower
            startHeight
            uptimePercentage
            tokens
            updateTime
            commission
            maxCommission
            maxChangeCommission
            status
            statusDetailed
            picture
            expectedReturns
          }
        }
      `,
      variables() {
        return {
          networkId: this.network
        }
      },
      update: result => result.validators
    }
  }
}
</script>

<style lang="scss">
.filterOptions {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  margin: 0.5rem 1rem;
  flex-direction: column-reverse;

  .toggles {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  label {
    cursor: pointer;
  }

  input {
    font-size: 14px;
  }
}

.filterOptions .btn-radio:last-child {
  border-radius: 0 0.5rem 0.5rem 0;
  margin-left: -1px;
}

.filterOptions .btn-radio:first-child {
  border-radius: 0.5rem 0 0 0.5rem;
  margin-right: -1px;
}

.filterOptions .btn-radio {
  border-radius: 0;
}

@media screen and (min-width: 768px) {
  .filterOptions {
    justify-content: space-between;
    flex-direction: row;
    margin: 0.5rem 2rem 1rem;

    .toggles {
      margin-bottom: 0;
    }

    input {
      max-width: 300px;
    }
  }
}

.no-results {
  text-align: center;
  margin: 3rem;
  color: var(--dim);
}
</style>
