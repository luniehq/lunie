<template>
  <TmPage
    :managed="true"
    :data-empty="!validator.operatorAddress"
    :loading="$apollo.queries.validator.loading"
    :loaded="loaded"
    :hide-header="true"
    data-title="Validator"
    class="small"
  >
    <template v-if="validator.operatorAddress" slot="managed-body">
      <button
        class="validators-list-button"
        color="secondary"
        @click="$router.push(`/validators`)"
      >
        <div style="display:flex; flex-direction:row; align-items: center;">
          <i class="material-icons arrow">arrow_back</i>
          Back to Validators
        </div>
      </button>
      <div class="status-button-container">
        <div class="status-container">
          <span :class="validator.status | toLower" class="validator-status">
            {{ validator.status }}
          </span>
          <span
            v-if="validator.statusDetailed"
            class="validator-status-detailed"
          >
            {{ validator.statusDetailed }}
          </span>
        </div>
      </div>
      <tr class="li-validator">
        <td class="data-table__row__info">
          <Avatar
            v-if="!validator.picture || validator.picture === 'null'"
            class="li-validator-image"
            alt="generic geometric symbol - generated avatar from address"
            :address="validator.operatorAddress"
          />
          <img
            v-else-if="validator.picture"
            :src="validator.picture"
            :alt="`validator logo for ` + validator.name"
            class="li-validator-image"
          />
          <div class="validator-info">
            <h3 class="li-validator-name">
              {{ validator.name }}
            </h3>
            <div v-if="delegation.amount">
              <h4>{{ delegation.amount | fullDecimals }}</h4>
              <h5 v-if="rewards">
                +{{ rewards.amount | fullDecimals | noBlanks }}
              </h5>
            </div>
          </div>
        </td>
      </tr>

      <div class="button-container">
        <TmBtn id="delegation-btn" value="Stake" @click.native="onDelegation" />
        <TmBtn
          id="undelegation-btn"
          :disabled="delegation.amount === 0"
          value="Unstake"
          type="secondary"
          @click.native="onUndelegation"
        />
      </div>

      <ul class="row">
        <li class="column">
          <h4>Description</h4>
          <span>
            {{ validator.details | noBlanks }}
          </span>
        </li>
        <li class="column">
          <h4>Website</h4>
          <span v-if="validator.website">
            <a
              id="validator-website"
              :href="validator.website + `?ref=lunie`"
              target="_blank"
              rel="nofollow noreferrer noopener"
              >{{ validator.website }}</a
            >
          </span>
          <span v-else id="validator-website">
            {{ validator.website | noBlanks }}
          </span>
        </li>
        <li class="column">
          <h4>Validator Address</h4>
          <span>
            <Bech32 :address="validator.operatorAddress" />
          </span>
        </li>
      </ul>

      <ul class="row">
        <li>
          <h4>Rewards</h4>
          <span id="page-profile__rewards">
            {{ validator.expectedReturns | percent }}
          </span>
        </li>
        <li>
          <h4>Voting Power / Total Stake</h4>
          <span id="page-profile__power">
            {{ validator.votingPower | percent }} /
            {{ validator.tokens | shortDecimals }}
          </span>
        </li>
        <li>
          <h4>Self Stake</h4>
          <span id="page-profile__self-bond">
            {{ validator.selfStake | shortDecimals }} /
            {{ (validator.selfStake / validator.tokens) | percent }}
          </span>
        </li>
        <li>
          <h4>Validator Since</h4>
          <span>Block #{{ validator.startHeight || 0 }}</span>
        </li>
        <li>
          <h4>Uptime</h4>
          <span id="page-profile__uptime">{{
            isBlankField(validator.uptimePercentage, percent)
          }}</span>
        </li>
        <li>
          <h4>Current Commission Rate</h4>
          <span>{{ isBlankField(validator.commission, percent) }}</span>
        </li>
        <li>
          <h4>Max Commission Rate</h4>
          <span>{{ isBlankField(validator.maxCommission, percent) }}</span>
        </li>
        <li>
          <h4>Max Daily Commission Change</h4>
          <span>{{
            isBlankField(validator.maxChangeCommission, percent)
          }}</span>
        </li>
        <li>
          <h4>Last Commission Change</h4>
          <span>{{
            isBlankField(validator.commissionUpdateTime, fromNow)
          }}</span>
        </li>
      </ul>

      <DelegationModal ref="delegationModal" :target-validator="validator" />
      <UndelegationModal
        ref="undelegationModal"
        :source-validator="validator"
      />
    </template>
    <template v-else>
      <div slot="title">Validator Not Found</div>
      <div slot="subtitle">
        Please visit the
        <router-link to="/validators/"> Validators </router-link>page to view
        all validators
      </div>
    </template>
  </TmPage>
</template>

<script>
import moment from "moment"
import { mapGetters, mapState } from "vuex"
import { atoms, shortDecimals, fullDecimals, percent } from "scripts/num"
import { noBlanks, fromNow } from "src/filters"
import TmBtn from "common/TmBtn"
import DelegationModal from "src/ActionModal/components/DelegationModal"
import UndelegationModal from "src/ActionModal/components/UndelegationModal"
import Avatar from "common/Avatar"
import Bech32 from "common/Bech32"
import TmPage from "common/TmPage"
import gql from "graphql-tag"
import { ValidatorProfile, UserTransactionAdded } from "src/gql"

function getStatusText(statusDetailed) {
  switch (statusDetailed) {
    case "inactive":
      return "Validator is not currently validating"
    case "banned":
      return "Validator is permanently banned from the network"
    default:
      return "Validator is online and earning rewards"
  }
}

export default {
  name: `page-validator`,
  components: {
    Bech32,
    DelegationModal,
    UndelegationModal,
    Avatar,
    TmBtn,
    TmPage
  },
  filters: {
    atoms,
    shortDecimals,
    fullDecimals,
    percent,
    toLower: text => text.toLowerCase(),
    noBlanks,
    fromNow
  },
  props: {
    showOnMobile: {
      type: String,
      default: () => "returns"
    }
  },
  data: () => ({
    validator: {},
    rewards: 0,
    delegation: {},
    error: false,
    loaded: false
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`network`]),
    ...mapGetters({ userAddress: `address` })
  },
  mounted() {
    this.$apollo.queries.rewards.refetch()
    this.$apollo.queries.delegation.refetch()
  },
  methods: {
    shortDecimals,
    atoms,
    percent,
    fromNow,
    noBlanks,
    moment,
    onDelegation() {
      this.$refs.delegationModal.open()
    },
    onUndelegation() {
      this.$refs.undelegationModal.open()
    },
    isBlankField(field, alternateFilter) {
      return field ? alternateFilter(field) : noBlanks(field)
    }
  },
  apollo: {
    delegation: {
      query: gql`
        query delegation(
          $networkId: String!
          $delegatorAddress: String!
          $operatorAddress: String!
        ) {
          delegation(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
            operatorAddress: $operatorAddress
          ) {
            amount
          }
        }
      `,
      skip() {
        /* istanbul ignore next */
        return !this.userAddress
      },
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network,
          delegatorAddress: this.userAddress,
          operatorAddress: this.$route.params.validator
        }
      },
      update(result) {
        /* istanbul ignore next */
        return {
          ...result.delegation,
          amount: Number(result.delegation.amount)
        }
      }
    },
    rewards: {
      query: gql`
        query RewardsPageValidator(
          $networkId: String!
          $delegatorAddress: String!
          $operatorAddress: String
        ) {
          rewards(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
            operatorAddress: $operatorAddress
          ) {
            amount
          }
        }
      `,
      skip() {
        /* istanbul ignore next */
        return !this.userAddress
      },
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network,
          delegatorAddress: this.userAddress,
          operatorAddress: this.$route.params.validator
        }
      },
      update(result) {
        /* istanbul ignore next */
        return result.rewards.length > 0 ? result.rewards[0] : { amount: 0 }
      }
    },
    validator: {
      query: ValidatorProfile,
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network,
          operatorAddress: this.$route.params.validator
        }
      },
      update(result) {
        /* istanbul ignore next */
        this.loaded = true
        /* istanbul ignore next */
        return {
          ...result.validator,
          statusDetailed: getStatusText(result.validator.statusDetailed)
        }
      }
    },
    $subscribe: {
      blockAdded: {
        variables() {
          /* istanbul ignore next */
          return {
            networkId: this.network
          }
        },
        query() {
          return gql`
            subscription($networkId: String!) {
              blockAdded(networkId: $networkId) {
                height
                chainId
              }
            }
          `
        },
        result() {
          /* istanbul ignore next */
          this.$apollo.queries.rewards.refetch()
        }
      },
      userTransactionAdded: {
        variables() {
          /* istanbul ignore next */
          return {
            networkId: this.network,
            address: this.userAddress
          }
        },
        skip() {
          /* istanbul ignore next */
          return !this.userAddress
        },
        query: UserTransactionAdded,
        result({ data }) {
          /* istanbul ignore next */
          if (data.userTransactionAdded.success) {
            this.$apollo.queries.delegation.refetch()
          }
        }
      }
    }
  }
}
</script>
<style scoped>
.validators-list-button {
  margin: 0 0 20px 10px;
  width: 177px;
  height: 40px;
  background-color: #272b48;
  font-size: 14px;
  color: #7a88b8;
  border: 1px solid rgb(122, 136, 184, 0.1);
  border-radius: 5px;
  cursor: pointer;
}

.validators-list-button:hover {
  background: #445381;
  color: #f1f3f7;
  border-color: #445381;
}

i.arrow {
  padding-right: 20px;
}

.li-validator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--bc-dim);
}

.li-validator-image {
  border-radius: 0.25rem;
  height: 4rem;
  width: 4rem;
  border: 1px solid var(--bc-dim);
}

.li-validator-name {
  color: var(--bright);
  font-size: var(--h1);
  line-height: 2rem;
  font-weight: 500;
}

.validator-info {
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
  text-overflow: ellipsis;
}

.li-validator h4,
.li-validator h5 {
  font-size: var(--sm);
  display: inline-block;
}

.li-validator h5 {
  padding-left: 0.5rem;
  color: var(--success);
}

span {
  font-size: 12px;
  line-height: normal;
}

.bech32-address {
  font-size: 12px;
  line-height: normal;
}

.button-container {
  display: flex;
  align-items: flex-end;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--bc-dim);
}

.button-container button:first-child {
  margin-right: 0.5rem;
}

.status-container {
  padding: 1rem 1rem 0;
}

.validator-status {
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 600;
  border: 2px solid;
  padding: 2px 4px;
  border-radius: 0.25rem;
}

.validator-status.inactive {
  color: var(--warning);
  border-color: var(--warning);
}

.validator-status.active {
  color: var(--success);
  border-color: var(--success);
}

.validator-status-detailed {
  display: block;
  margin-top: 0.4rem;
  font-size: 0.8rem;
}

@media screen and (max-width: 425px) {
  .status-button-container {
    display: flex;
    flex-direction: column-reverse;
  }
}

@media screen and (max-width: 667px) {
  .button-container {
    width: 100%;
    padding: 1rem;
  }

  .button-container button {
    width: 50%;
  }
}

@media screen and (min-width: 1024px) {
  .validators-list-button {
    display: none;
  }
}
</style>
