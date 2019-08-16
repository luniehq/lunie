<template>
  <TmPage
    :managed="true"
    :loading="delegates.loading"
    :loaded="delegates.loaded"
    :error="delegates.error"
    :data-empty="!validator"
    data-title="Validator"
    :hide-header="true"
    class="small"
  >
    <template v-if="validator" slot="managed-body">
      <div class="status-container">
        <span :class="statusColor" class="validator-status">{{ status }}</span>
      </div>

      <tr class="li-validator">
        <td class="data-table__row__info">
          <ApolloQuery
            :query="ValidatorProfile"
            :variables="{ address: validator.operator_address }"
            :update="validatorProfileResultUpdate"
          >
            <template v-slot="{ result: { loading, error, data: keybase } }">
              <Avatar
                v-if="!keybase || !keybase.avatarUrl || loading || error"
                class="li-validator-image"
                alt="generic geometric symbol - generated avatar from address"
                :address="validator.operator_address"
              />
              <img
                v-else-if="keybase && keybase.avatarUrl"
                :src="keybase.avatarUrl"
                :alt="`validator logo for ` + validator.description.moniker"
                class="li-validator-image"
              />
            </template>
          </ApolloQuery>
          <div class="validator-info">
            <h3 class="li-validator-name">
              {{ validator.description.moniker }}
            </h3>
            <div v-if="myDelegation">
              <h4>
                {{ myDelegation }}
              </h4>
              <h5 v-if="rewards">
                {{ rewards ? `+` + shortDecimals(atoms(rewards)) : `--` }}
              </h5>
            </div>
          </div>
        </td>
      </tr>

      <div class="button-container">
        <TmBtn id="delegation-btn" value="Stake" @click.native="onDelegation" />
        <TmBtn
          id="undelegation-btn"
          :disabled="!myDelegation"
          value="Unstake"
          type="secondary"
          @click.native="onUndelegation"
        />
      </div>

      <div class="row">
        <dl class="info_dl">
          <dt>Description</dt>
          <dd class="info_dl__text-box">
            {{ translateEmptyDescription(validator.description.details) }}
          </dd>
        </dl>
        <dl class="info_dl">
          <dt>Website</dt>
          <dd v-if="website !== `--`">
            <a
              id="validator-website"
              :href="website"
              target="_blank"
              rel="nofollow noreferrer noopener"
              >{{ website }}</a
            >
          </dd>
          <dd v-else>{{ website }}</dd>
        </dl>
        <dl class="info_dl">
          <dt>Validator Address</dt>
          <dd>
            <Bech32 :address="validator.operator_address" />
          </dd>
        </dl>
      </div>

      <div class="row row-condensed">
        <dl class="info_dl">
          <dt>Voting Power / Total Stake</dt>
          <dd id="page-profile__power">
            {{ percent(powerRatio) }} /
            {{ shortDecimals(atoms(validator.tokens)) }}
          </dd>
        </dl>
        <dl class="info_dl">
          <dt>Self Stake</dt>
          <dd id="page-profile__self-bond">
            {{ selfBond }} / {{ selfBondAmount }}
          </dd>
        </dl>
        <dl class="info_dl">
          <dt>Validator Since</dt>
          <dd>Block #{{ validator.signing_info.start_height }}</dd>
        </dl>
        <dl class="info_dl">
          <dt>Uptime / Missed Blocks</dt>
          <dd id="page-profile__uptime">
            {{ uptime }} / {{ validator.signing_info.missed_blocks_counter }}
          </dd>
        </dl>
        <dl class="info_dl">
          <dt>Current Commission Rate</dt>
          <dd>{{ percent(validator.commission.rate) }}</dd>
        </dl>
        <dl class="info_dl">
          <dt>Max Commission Rate</dt>
          <dd>{{ percent(validator.commission.max_rate) }}</dd>
        </dl>
        <dl class="info_dl">
          <dt>Max Daily Commission Change</dt>
          <dd>{{ percent(validator.commission.max_change_rate) }}</dd>
        </dl>
        <dl class="info_dl">
          <dt>Last Commission Change</dt>
          <dd>{{ lastCommissionChange }}</dd>
        </dl>
      </div>

      <DelegationModal
        ref="delegationModal"
        :from-options="delegationTargetOptions()"
        :to="validator.operator_address"
        :validator="validator"
        :denom="bondDenom"
      />
      <UndelegationModal
        ref="undelegationModal"
        :maximum="Number(myBond)"
        :to="session.signedIn ? session.address : ``"
        :validator="validator"
        :denom="bondDenom"
      />
    </template>
    <template v-else>
      <template slot="title"
        >Validator Not Found
      </template>
      <template slot="subtitle">
        <div>
          Please visit the
          <router-link to="/validators/">Validators</router-link>page to view
          all validators
        </div>
      </template>
    </template>
  </TmPage>
</template>

<script>
import moment from "moment"
import { calculateTokens } from "scripts/common"
import { mapState, mapGetters } from "vuex"
import { atoms, viewDenom, shortDecimals, percent, uatoms } from "scripts/num"
import { formatBech32 } from "src/filters"
import { expectedReturns } from "scripts/returns"
import TmBtn from "common/TmBtn"
import { ratToBigNumber } from "scripts/common"
import DelegationModal from "src/ActionModal/components/DelegationModal"
import UndelegationModal from "src/ActionModal/components/UndelegationModal"
import Avatar from "common/Avatar"
import Bech32 from "common/Bech32"
import TmPage from "common/TmPage"
import isEmpty from "lodash.isempty"
import { ValidatorProfile, validatorProfileResultUpdate } from "src/gql"
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
    viewDenom,
    shortDecimals,
    formatBech32
  },
  props: {
    showOnMobile: {
      type: String,
      default: () => "returns"
    }
  },
  data: () => ({
    ValidatorProfile
  }),
  computed: {
    ...mapState(
      [`delegates`, `delegation`, `distribution`, `pool`, `session`],
      {
        annualProvision: state => state.minting.annualProvision
      }
    ),
    ...mapGetters([
      `lastHeader`,
      `bondDenom`,
      `committedDelegations`,
      `liquidAtoms`,
      `connected`
    ]),
    validator() {
      const validator = this.delegates.delegates.find(
        v => this.$route.params.validator === v.operator_address
      )
      if (validator) {
        validator.signing_info = this.delegates.signingInfos[
          validator.operator_address
        ]
      }

      return validator
    },
    selfBond() {
      return percent(this.delegates.selfBond[this.validator.operator_address])
    },
    selfBondAmount() {
      return shortDecimals(
        uatoms(this.delegates.selfBond[this.validator.operator_address])
      )
    },
    uptime() {
      if (!this.validator.signing_info) return null

      const totalBlocks = this.lastHeader.height
      const missedBlocks = this.validator.signing_info.missed_blocks_counter
      const signedBlocks = totalBlocks - missedBlocks
      const uptime = (signedBlocks / totalBlocks) * 100

      return String(uptime).substring(0, 4) + `%`
    },
    myBond() {
      if (!this.validator) return 0
      return atoms(
        calculateTokens(
          this.validator,
          this.committedDelegations[this.validator.operator_address] || 0
        )
      )
    },
    myDelegation() {
      const { bondDenom, myBond } = this
      const myDelegation = shortDecimals(myBond)
      const myDelegationString = `${myDelegation} ${viewDenom(bondDenom)}`
      return Number(myBond) === 0 ? null : myDelegationString
    },
    powerRatio() {
      return ratToBigNumber(this.validator.tokens)
        .div(this.pool.pool.bonded_tokens)
        .toNumber()
    },
    lastCommissionChange() {
      const updateTime = this.validator.commission.update_time
      const dateTime = new Date(updateTime)
      const neverHappened = dateTime.getTime() === 0

      return neverHappened || updateTime === `0001-01-01T00:00:00Z`
        ? `--`
        : moment(dateTime).fromNow()
    },
    returns() {
      return expectedReturns(
        this.validator,
        parseInt(this.pool.pool.bonded_tokens),
        parseFloat(this.annualProvision)
      )
    },
    status() {
      if (this.validator.jailed) return `Jailed`

      if (parseFloat(this.validator.status) === 0) return `Inactive`

      return `Active`
    },
    statusColor() {
      if (this.validator.jailed) return `red`

      if (parseFloat(this.validator.status) === 0) return `orange`

      return `green`
    },
    // empty descriptions have a strange '[do-not-modify]' value which we don't want to show
    website() {
      let url = this.validator.description.website
      // Check if validator url is empty
      if (url === ``) {
        return this.translateEmptyDescription(url)

        // Check if validator url does not contain either http or https
      } else if (!url.includes(`https`) && !url.includes(`http`)) {
        url = `https://` + url
        return this.translateEmptyDescription(url)
      } else {
        return this.translateEmptyDescription(url)
      }
    },
    rewards() {
      const { session, bondDenom, distribution, validator } = this
      if (!session.signedIn) {
        return null
      }

      const validatorRewards = distribution.rewards[validator.operator_address]
      return validatorRewards ? validatorRewards[bondDenom] : 0
    }
  },
  watch: {
    myBond: {
      handler(myBond) {
        if (myBond > 0) {
          this.$store.dispatch(
            `getRewardsFromValidator`,
            this.$route.params.validator
          )
        }
      }
    },
    "validator.operator_address": {
      immediate: true,
      handler(operator_address) {
        if (!operator_address) return
        this.$store.dispatch(`getSelfBond`, this.validator)
      }
    },
    lastHeader: {
      immediate: true,
      handler(newHeader) {
        const waitTwentyBlocks = Number(newHeader.height) % 20 === 0
        if (
          this.session.signedIn &&
          waitTwentyBlocks &&
          this.$route.name === `validator` &&
          this.delegation.loaded &&
          Number(this.myBond) > 0
        ) {
          this.$store.dispatch(
            `getRewardsFromValidator`,
            this.$route.params.validator
          )
        }
      }
    }
  },
  methods: {
    shortDecimals,
    atoms,
    uatoms,
    percent,
    moment,
    validatorProfileResultUpdate,
    onDelegation() {
      this.$refs.delegationModal.open()
    },
    onUndelegation() {
      this.$refs.undelegationModal.open()
    },
    delegationTargetOptions(
      { session, liquidAtoms, committedDelegations, $route, delegates } = this
    ) {
      if (!session.signedIn) return []

      //- First option should always be your wallet (i.e normal delegation)
      const myWallet = [
        {
          address: session.address,
          maximum: Math.floor(liquidAtoms),
          key: `My Wallet - ${formatBech32(session.address, false, 20)}`,
          value: 0
        }
      ]
      const bondedValidators = Object.keys(committedDelegations)
      if (isEmpty(bondedValidators)) {
        return myWallet
      }
      //- The rest of the options are from your other bonded validators
      //- We skip the option of redelegating to the same address
      const redelegationOptions = bondedValidators
        .filter(address => address != $route.params.validator)
        .map((address, index) => {
          const delegate = delegates.delegates.find(function(validator) {
            return validator.operator_address === address
          })
          return {
            address: address,
            maximum: Math.floor(committedDelegations[address]),
            key: `${delegate.description.moniker} - ${formatBech32(
              delegate.operator_address,
              false,
              20
            )}`,
            value: index + 1
          }
        })
      return myWallet.concat(redelegationOptions)
    },
    translateEmptyDescription(value) {
      if (!value || value === `[do-not-modify]`) return `--`
      return value
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

.row {
  padding-top: 2rem;
}

dd {
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

.validator-status.red {
  color: var(--danger);
  border-color: var(--danger);
}

.validator-status.orange {
  color: var(--warning);
  border-color: var(--warning);
}

.validator-status.green {
  color: var(--success);
  border-color: var(--success);
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

.row-condensed dl {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.row-condensed dl dd,
.row-condensed dl dt {
  font-size: 12px;
}
</style>
