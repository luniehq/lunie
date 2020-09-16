<template>
  <TmPage
    data-title="Validator"
    :empty="!validator.operatorAddress"
    :loading="$apollo.queries.validator.loading"
    :empty-title="`Validator not found`"
    :empty-subtitle="`There must be a typo somewhere.`"
    class="readable-width"
  >
    <template v-if="validator.operatorAddress">
      <div class="button-container">
        <BackButton />
        <button
          v-if="
            connection.network === 'cosmos-hub-mainnet' ||
            connection.network === 'cosmos-hub-testnet'
          "
          class="tutorial-button"
          @click="openTutorial()"
        >
          <i v-if="false" class="material-icons notranslate">help_outline</i>
          <span v-else>Want to learn about staking?</span>
        </button>
      </div>
      <div class="status-button-container">
        <div class="status-container">
          <span
            :class="validator.status || `` | toLower"
            class="validator-status"
          >
            {{ validator.status }}
          </span>
          <span
            v-if="validator.statusDetailed"
            class="validator-status-detailed"
            >{{ validator.statusDetailed }}</span
          >
        </div>
      </div>
      <tr class="li-validator">
        <td class="data-table__row__info">
          <div class="li-validator-name-row">
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
              <h3 class="li-validator-name">{{ validator.name }}</h3>
              <div v-if="delegation.amount">
                <h4>{{ delegation.amount | fullDecimals }}</h4>
                <h5 v-if="rewards && rewards.length > 0">
                  +{{ filterStakingDenomReward() | noBlanks }}
                </h5>
              </div>
            </div>
          </div>
          <span
            v-if="!validator.picture || validator.picture === 'null'"
            class="no-img-info"
          >
            Looks like we don't have this validator logo — if this is your
            validator
            <a class="intercom-button" @click="handleIntercom()">contact us</a>.
          </span>
        </td>
      </tr>

      <div class="action-button-container">
        <TmBtn
          id="delegation-btn"
          :value="
            currentNetwork.network_type === `polkadot` ? `Select` : `Stake`
          "
          @click.native="onDelegation"
        />
        <TmBtn
          id="undelegation-btn"
          class="undelegation-btn"
          :disabled="!hasDelegation"
          :value="
            currentNetwork.network_type === `polkadot` ? `Deselect` : `Unstake`
          "
          type="secondary"
          @click.native="onUndelegation"
        />
      </div>

      <ul class="row">
        <li class="column">
          <h4>Description</h4>
          <span>{{ validator.details | noBlanks }}</span>
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
            <Address :address="validator.operatorAddress" />
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
            {{ (validator.selfStake / validator.tokens || 0) | percent }}
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

      <DelegationModal
        ref="delegationModal"
        :target-validator="validator"
        :is-nomination="true"
      />
      <UndelegationModal
        ref="undelegationModal"
        :source-validator="validator"
        :is-unnomination="true"
      />
    </template>

    <ModalTutorial
      v-if="
        showTutorial &&
        (connection.network === 'cosmos-hub-mainnet' ||
          connection.network === 'cosmos-hub-testnet')
      "
      :steps="cosmosStakingTutorial.steps"
      :fullguide="cosmosStakingTutorial.fullguide"
      :background="cosmosStakingTutorial.background"
      :close="hideTutorial"
    />
  </TmPage>
</template>

<script>
import moment from "moment"
import { mapGetters, mapState } from "vuex"
import { shortDecimals, fullDecimals, percent } from "scripts/num"
import { noBlanks, fromNow } from "src/filters"
import BackButton from "common/BackButton"
import TmBtn from "common/TmBtn"
import DelegationModal from "src/ActionModal/components/DelegationModal"
import UndelegationModal from "src/ActionModal/components/UndelegationModal"
import Avatar from "common/Avatar"
import Address from "common/Address"
import TmPage from "common/TmPage"
import gql from "graphql-tag"
import {
  ValidatorProfile,
  DelegationsForDelegator,
  UserTransactionAdded,
} from "src/gql"
import ModalTutorial from "common/ModalTutorial"

function getStatusText(statusDetailed) {
  switch (statusDetailed) {
    case "inactive":
      return "Validator is not currently validating"
    case "banned":
      return "Validator is permanently banned from the network"
    default:
      return "Validator is online and generating rewards"
  }
}

export default {
  name: `page-validator`,
  components: {
    Address,
    BackButton,
    DelegationModal,
    UndelegationModal,
    Avatar,
    TmBtn,
    TmPage,
    ModalTutorial,
  },
  filters: {
    shortDecimals,
    fullDecimals,
    percent,
    toLower: (text) => text.toLowerCase(),
    noBlanks,
    fromNow,
  },
  props: {
    showOnMobile: {
      type: String,
      default: () => "returns",
    },
  },
  data: () => ({
    validator: {},
    rewards: 0,
    delegation: {},
    error: false,
    loaded: false,
    showTutorial: false,
    isMostRelevantRewardSelected: false,
    mostRelevantReward: ``,
    delegations: [],
    cosmosStakingTutorial: {
      fullguide: `https://lunie.io/guides/how-cosmos-staking-works/`,
      background: `blue`,
      steps: [
        {
          title: "Intro to staking",
          // Each content array item will be enclosed in a span (newline)
          content: [
            "First things first, you'll need to have some staking tokens. On this network, they are called ATOMs.",
          ],
        },
        {
          title: "Validators",
          content: [
            "Validators are network operators who collect a fee for maintaining the integrity of the blockchain.",
          ],
        },
        {
          title: "Choosing a validator",
          content: [
            "You can 'stake' your tokens with any validator you like. Choose by comparing their commission rate, their uptime history, and how they vote on proposals.",
          ],
        },
        {
          title: "Earning rewards",
          content: [
            "Once you 'stake' your tokens, you'll instantly start earning rewards. Look for the “Claim Rewards” button on your portfolio page to add your rewards to your wallet.",
          ],
        },
        {
          title: "Lock-up period",
          content: [
            "While your tokens are 'staked' you will not be able to transfer or spend them. It will take a number of days depending on the network for your tokens to be in your wallet after you 'unstake' them.",
          ],
        },
        {
          title: "Have more questions?",
          content: [
            "Check out our full staking guide for an in depth explanation of all things staking.",
          ],
        },
      ],
    },
  }),
  computed: {
    ...mapState([`connection`, `session`]),
    ...mapGetters([`network`, `stakingDenom`, `currentNetwork`]),
    ...mapGetters({ userAddress: `address` }),
    hasDelegation() {
      return !!this.delegations.find(
        (delegation) =>
          delegation.validator.operatorAddress ===
          this.validator.operatorAddress
      )
    },
  },
  mounted() {
    this.$apollo.queries.rewards.refetch()
    this.$apollo.queries.delegation.refetch()
  },
  methods: {
    shortDecimals,
    fullDecimals,
    percent,
    fromNow,
    noBlanks,
    moment,
    /* istanbul ignore next */
    onDelegation() {
      this.$refs.delegationModal.open()
    },
    /* istanbul ignore next */
    onUndelegation() {
      this.$refs.undelegationModal.open()
    },
    /* istanbul ignore next */
    isBlankField(field, alternateFilter) {
      return field ? alternateFilter(field) : noBlanks(field)
    },
    openTutorial() {
      this.showTutorial = true
    },
    hideTutorial() {
      this.showTutorial = false
    },
    handleIntercom() {
      this.$store.dispatch(`displayMessenger`)
    },
    filterStakingDenomReward() {
      if (this.rewards && this.rewards.length > 0) {
        const stakingDenomRewards = this.rewards.filter(
          (reward) => reward.denom === this.stakingDenom
        )
        return stakingDenomRewards.length > 0
          ? stakingDenomRewards[0].amount
          : 0
      }
    },
  },
  apollo: {
    delegation: {
      /* istanbul ignore next */
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
            id
            amount
          }
        }
      `,
      /* istanbul ignore next */
      skip() {
        return (
          !this.userAddress ||
          (!this.$route.params.validator && this.validator.operatorAddress)
        )
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          delegatorAddress: this.userAddress,
          operatorAddress: this.$route.params.validator,
        }
      },
      /* istanbul ignore next */
      update(result) {
        if (!result.delegation) {
          return {
            amount: 0,
          }
        }
        /* istanbul ignore next */
        return {
          ...result.delegation,
          amount: Number(result.delegation.amount),
        }
      },
    },
    rewards: {
      /* istanbul ignore next */
      query: gql`
        query rewards(
          $networkId: String!
          $delegatorAddress: String!
          $operatorAddress: String
        ) {
          rewards(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
            operatorAddress: $operatorAddress
          ) {
            id
            amount
            denom
          }
        }
      `,
      /* istanbul ignore next */
      skip() {
        return (
          !this.userAddress ||
          (!this.$route.params.validator && this.validator.operatorAddress)
        )
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          delegatorAddress: this.userAddress,
          operatorAddress: this.$route.params.validator,
        }
      },
      /* istanbul ignore next */
      update(result) {
        return result.rewards && result.rewards.length > 0
          ? result.rewards
          : { amount: 0 }
      },
    },
    validator: {
      /* istanbul ignore next */
      query: ValidatorProfile,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          operatorAddress: this.$route.params.validator,
        }
      },
      /* istanbul ignore next */
      update(result) {
        if (!result.validator) return {}

        this.loaded = true
        return {
          ...result.validator,
          statusDetailed: getStatusText(result.validator.statusDetailed),
        }
      },
    },
    delegations: {
      /* istanbul ignore next */
      query() {
        return DelegationsForDelegator(this.network)
      },
      /* istanbul ignore next */
      variables() {
        return {
          delegatorAddress: this.userAddress,
          networkId: this.network,
        }
      },
      /* istanbul ignore next */
      skip() {
        return !this.userAddress
      },
      /* istanbul ignore next */
      update(data) {
        return data.delegations || []
      },
    },
    $subscribe: {
      blockAdded: {
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.network,
          }
        },
        /* istanbul ignore next */
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
        /* istanbul ignore next */
        result() {
          this.$apollo.queries.rewards.refetch()
        },
      },
      userTransactionAdded: {
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.network,
            address: this.userAddress,
          }
        },
        /* istanbul ignore next */
        skip() {
          return !this.userAddress
        },
        /* istanbul ignore next */
        query: UserTransactionAdded,
        /* istanbul ignore next */
        result({ data }) {
          if (data.userTransactionAddedV2.success) {
            this.$apollo.queries.delegation.refetch()
          }
        },
      },
    },
  },
}
</script>
<style scoped>
.back-button,
.tutorial-button {
  padding: 0.5rem 1rem;
  width: auto;
  font-size: 14px;
  background: transparent;
  color: #7a88b8;
  border: 2px solid rgb(122, 136, 184, 0.1);
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-family: var(--sans);
}

.back-button i {
  padding-right: 1rem;
}

.back-button i,
.tutorial-button i {
  font-size: 1rem;
}

span {
  font-size: 12px;
  line-height: normal;
}

.tutorial-button span {
  font-size: 14px;
}

.back-button:hover,
.tutorial-button:hover {
  background-color: rgba(255, 255, 255, 0.02);
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
  max-width: 600px;
  word-break: break-word;
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

.li-validator > .data-table__row__info {
  display: block;
  width: 100%;
}

.li-validator .li-validator-name-row {
  display: flex;
  align-items: center;
}

.button-container {
  justify-content: space-between;
}

.button-container,
.action-button-container {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
}

.action-button-container {
  border-bottom: 1px solid var(--bc-dim);
}

.action-button-container button:first-child,
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

.validator-status-detailed,
.no-img-info {
  display: block;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--dim);
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
    padding: 0 1rem;
  }

  .button-container button,
  .action-button-container button {
    width: 50%;
  }
}
</style>
