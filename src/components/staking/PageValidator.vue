<template>
  <TmPage
    :managed="true"
    :loading="$apollo.queries.validator.loading"
    :loaded="!$apollo.queries.validator.loading"
    :error="$apollo.queries.validator.error"
    :data-empty="!validator.operatorAddress"
    :hide-header="true"
    data-title="Validator"
    class="small"
  >
    <template v-if="validator.operatorAddress" slot="managed-body">
      <div class="status-container">
        <span :class="validator.status | toLower" class="validator-status">
          {{ validator.status }}
        </span>
        <span v-if="validator.statusDetailed" class="validator-status-detailed">
          {{ validator.statusDetailed }}
        </span>
      </div>
      <tr class="li-validator">
        <td class="data-table__row__info">
          <Avatar
            v-if="!validator.picture"
            class="li-validator-image"
            alt="generic geometric symbol - generated avatar from address"
            :address="validator.operatorAddress"
          />
          <img
            v-else-if="validator.picture"
            :src="validator.picture"
            :alt="`validator logo for ` + validator.moniker"
            class="li-validator-image"
          />
          <div class="validator-info">
            <h3 class="li-validator-name">
              {{ validator.moniker }}
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
          :disabled="!delegation"
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
          <span v-if="validator.website !== ``">
            <a
              id="validator-website"
              :href="validator.website"
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
            {{ validator.tokens | atoms | shortDecimals }}
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
          <span id="page-profile__uptime">
            {{ validator.uptimePercentage | percent }}
          </span>
        </li>
        <li>
          <h4>Current Commission Rate</h4>
          <span>{{ validator.commission | percent }}</span>
        </li>
        <li>
          <h4>Max Commission Rate</h4>
          <span>{{ validator.maxCommission | percent }}</span>
        </li>
        <li>
          <h4>Max Daily Commission Change</h4>
          <span>{{ validator.maxChangeCommission | percent }}</span>
        </li>
        <li>
          <h4>Last Commission Change</h4>
          <span>{{ validator.commissionUpdateTime | fromNow }}</span>
        </li>
      </ul>

      <DelegationModal
        ref="delegationModal"
        :from-options="delegationTargetOptions()"
        :to="validator.operatorAddress"
        :validator="validator"
        :denom="metaData.stakingDenom"
      />
      <UndelegationModal
        ref="undelegationModal"
        :maximum="delegation.amount"
        :to="session.signedIn ? session.address : ``"
        :validator="validator"
        :denom="metaData.stakingDenom"
        @switchToRedelegation="onDelegation({ redelegation: true })"
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
import { mapState } from "vuex"
import { atoms, shortDecimals, fullDecimals, percent } from "scripts/num"
import { formatBech32, noBlanks, fromNow } from "src/filters"
import TmBtn from "common/TmBtn"
import DelegationModal from "src/ActionModal/components/DelegationModal"
import UndelegationModal from "src/ActionModal/components/UndelegationModal"
import Avatar from "common/Avatar"
import Bech32 from "common/Bech32"
import TmPage from "common/TmPage"
import gql from "graphql-tag"
import { ValidatorProfile, MetaData } from "src/gql"

function getStatusText(statusDetailed) {
  switch (statusDetailed) {
    case "inactive":
      return "Validator is currently not validating"
    case "banned":
      return "Validator is banned from the network"
    default:
      return "Validator is actively validating"
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
    delegations: []
  }),
  computed: {
    ...mapState([`session`]),
    ...mapState({ network: state => state.connection.network })
  },
  methods: {
    shortDecimals,
    atoms,
    percent,
    moment,
    onDelegation(options) {
      this.$refs.delegationModal.open(options)
    },
    onUndelegation() {
      this.$refs.undelegationModal.open()
    },
    delegationTargetOptions() {
      if (!this.session.signedIn) return []

      const balance = this.balance.find(
        ({ denom }) => this.metaData.stakingDenom === denom
      ).amount

      //- First option should always be your wallet (i.e normal delegation)
      const myWallet = [
        {
          address: this.session.address,
          maximum: Math.floor(balance),
          key: `My Wallet - ${formatBech32(this.session.address, false, 20)}`,
          value: 0
        }
      ]

      const result = this.delegations
        .filter(d => d.validatorAddress != this.$route.params.validator)
        .map((d, i) => {
          return {
            address: this.session.address,
            maximum: Math.floor(d.shares),
            // Get names of delegation validators
            key: `${d.validatorAddress} - ${formatBech32(
              d.validatorAddress,
              false,
              20
            )}`,
            value: i + 1
          }
        })
        .concat(myWallet)

      return result
    }
  },
  apollo: {
    balance: {
      query: gql`
        query balance($networkId: String!, $address: String!) {
          balance(networkId: $networkId, address: $address) {
            amount
            denom
          }
        }
      `,
      variables() {
        return {
          networkId: this.network,
          address: this.session.address
        }
      },
      update: data => {
        return data.balance
      }
    },
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
      variables() {
        return {
          networkId: this.network,
          delegatorAddress: this.session.address,
          operatorAddress: this.$route.params.validator
        }
      },
      update: result => {
        return {
          ...result.delegation,
          amount: Number(result.delegation.amount)
        }
      }
    },
    rewards: {
      query: gql`
        query rewards(
          $networkId: String!
          $delegatorAddress: String
          $operatorAddress: String
        ) {
          rewards(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
            operatorAddress: $operatorAddress
          ) {
            amount
            denom
          }
        }
      `,
      variables() {
        return {
          networkId: this.network,
          delegatorAddress: this.session.address,
          operatorAddress: this.$route.params.validator
        }
      },
      update: result =>
        result.rewards.length > 0 ? result.rewards[0] : { amount: 0 }
    },
    validator: {
      query: ValidatorProfile,
      variables() {
        return {
          networkId: this.network,
          operatorAddress: this.$route.params.validator
        }
      },
      update: result => {
        return {
          ...result.validator,
          statusDetailed: getStatusText(result.validator.statusDetailed)
        }
      }
    },
    metaData: {
      query() {
        /* istanbul ignore next */
        return MetaData(this.network)
      },
      update(data) {
        /* istanbul ignore next */
        return data.metaData
      }
    }
  }
}
</script>
<style scoped>
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
  color: var(--warning);
  font-size: 0.8rem;
}
</style>
<style>
@media screen and (max-width: 667px) {
  .button-container {
    width: 100%;
    padding: 1rem;
  }

  .button-container button {
    width: 50%;
  }
}
</style>
