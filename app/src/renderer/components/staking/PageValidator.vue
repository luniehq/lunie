<template>
  <tm-page
    :loading="delegates.loading"
    :loaded="delegates.loaded"
    :error="delegates.error"
    :data-empty="!validator"
    data-title="Validator"
  >
    <template v-if="validator" slot="managed-body">
      <!-- we need the v-if as the template somehow is rendered in any case -->
      <div class="page-profile__header page-profile__section">
        <div class="row">
          <img
            v-if="validator.keybase"
            :src="validator.keybase.avatarUrl"
            class="avatar"
          /><img
            v-else
            class="avatar"
            src="~assets/images/validator-icon.svg"
          />

          <div class="page-profile__header__info">
            <div>
              <div class="validator-name-and-address">
                <div class="page-profile__status-and-title">
                  <span
                    v-tooltip.top="status"
                    :class="statusColor"
                    class="page-profile__status"
                  />
                  <div class="page-profile__title">
                    {{ validator.description.moniker }}
                  </div>
                </div>
                <short-bech32 :address="validator.operator_address" />
              </div>
            </div>

            <div class="page-profile__header__actions">
              <tm-btn
                id="delegation-btn"
                :disabled="!connected"
                :value="connected ? 'Delegate' : 'Connecting...'"
                color="primary"
                @click.native="onDelegation"
              />
              <tm-btn
                id="undelegation-btn"
                :disabled="!connected"
                :value="connected ? 'Undelegate' : 'Connecting...'"
                color="secondary"
                @click.native="onUndelegation"
              />
            </div>
          </div>
        </div>

        <div class="row">
          <div class="row row-unjustified">
            <dl class="info_dl colored_dl">
              <dt>My Delegation</dt>
              <dd>{{ myDelegation }}</dd>
            </dl>
            <dl class="info_dl colored_dl">
              <dt>My Rewards</dt>
              <dd>{{ rewards || "--" }}</dd>
            </dl>
          </div>

          <div class="row row-unjustified">
            <dl class="info_dl colored_dl">
              <dt>Voting Power</dt>
              <dd id="page-profile__power">
                {{ percent(powerRatio) }}
              </dd>
            </dl>
            <dl class="info_dl colored_dl">
              <dt>Uptime</dt>
              <dd id="page-profile__uptime">
                {{ uptime }}
              </dd>
            </dl>
            <dl class="info_dl colored_dl">
              <dt>Commission</dt>
              <dd id="page-profile__commission">
                {{ percent(validator.commission.rate) }}
              </dd>
            </dl>
            <dl v-if="session.experimentalMode" class="info_dl colored_dl">
              <dt>Slashes</dt>
              <dd>--</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="page-profile__section">
        <div class="row">
          <div class="column">
            <dl class="info_dl">
              <dt>First Seen</dt>
              <dd>Block #{{ validator.bond_height }}</dd>
            </dl>
            <dl class="info_dl">
              <dt>Full Operator Address</dt>
              <dd>{{ validator.operator_address }}</dd>
            </dl>
            <dl class="info_dl">
              <dt>Keybase ID</dt>
              <dd>
                {{ translateEmptyDescription(validator.description.identity) }}
              </dd>
            </dl>
            <dl class="info_dl">
              <dt>Website</dt>
              <dd>
                {{ translateEmptyDescription(validator.description.website) }}
              </dd>
            </dl>
            <dl class="info_dl">
              <dt>Description</dt>
              <dd class="info_dl__text-box">
                {{ translateEmptyDescription(validator.description.details) }}
              </dd>
            </dl>
          </div>
          <div class="column">
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
            <dl class="info_dl">
              <dt>Self Delegation</dt>
              <dd id="page-profile__self-bond">
                {{ selfBond }}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <delegation-modal
        ref="delegationModal"
        :from-options="delegationTargetOptions()"
        :to="validator.operator_address"
        :validator="validator"
        :denom="bondDenom"
      />
      <undelegation-modal
        ref="undelegationModal"
        :maximum="Number(myBond)"
        :from-options="delegationTargetOptions()"
        :to="session.signedIn ? session.address : ``"
        :validator="validator"
        :denom="bondDenom"
      />
    </template>
  </tm-page>
</template>

<script>
import BigNumber from "bignumber.js"
import moment from "moment"
import { calculateTokens } from "scripts/common"
import { mapGetters } from "vuex"
import { percent, pretty, atoms, full } from "scripts/num"
import TmBtn from "common/TmBtn"
import { shortAddress, ratToBigNumber } from "scripts/common"
import DelegationModal from "staking/DelegationModal"
import UndelegationModal from "staking/UndelegationModal"
import ShortBech32 from "common/ShortBech32"
import TmPage from "common/TmPage"
import { isEmpty } from "lodash"
export default {
  name: `page-validator`,
  components: {
    ShortBech32,
    DelegationModal,
    UndelegationModal,
    TmBtn,
    TmPage
  },
  data: () => ({
    percent,
    pretty,
    showCannotModal: false,
    shortAddress,
    tabIndex: 1,
    moment
  }),
  computed: {
    ...mapGetters([
      `lastHeader`,
      `bondDenom`,
      `delegates`,
      `distribution`,
      `committedDelegations`,
      `keybase`,
      `liquidAtoms`,
      `session`,
      `connected`
    ]),
    validator() {
      const validator = this.delegates.delegates.find(
        v => this.$route.params.validator === v.operator_address
      )
      if (validator) {
        validator.keybase = this.keybase[validator.description.identity]
      }

      return validator
    },
    selfBond() {
      return percent(this.validator.selfBond)
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
      return BigNumber(
        atoms(
          calculateTokens(
            this.validator,
            this.committedDelegations[this.validator.operator_address] || 0
          )
        )
      )
    },
    myDelegation() {
      const { bondDenom, myBond } = this
      const myDelegation = full(myBond)
      const myDelegationString = `${myDelegation} ${bondDenom}`
      return Number(myBond) === 0 ? `--` : myDelegationString
    },
    powerRatio() {
      return ratToBigNumber(this.validator.tokens)
        .div(this.delegates.globalPower)
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
    status() {
      // status: jailed
      if (this.validator.revoked)
        return `This validator has been jailed and is not currently validating`

      // status: inactive
      if (parseFloat(this.validator.voting_power) === 0)
        return `This validator does not have enough voting power yet and is inactive`

      // status: active
      return `This validator is actively validating`
    },
    statusColor() {
      // status: jailed
      if (this.validator.revoked) return `red`

      // status: inactive
      if (parseFloat(this.validator.voting_power) === 0) return `yellow`

      // status: active
      return `green`
    },
    rewards() {
      const { session, bondDenom, distribution, validator } = this
      if (!session.signedIn) {
        return null
      }

      const validatorRewards = distribution.rewards[validator.operator_address]
      const amount = validatorRewards
        ? full(atoms(validatorRewards[bondDenom]) || 0)
        : null

      if (amount) {
        return `${amount} ${bondDenom}`
      }
      return null
    }
  },
  watch: {
    validator: {
      immediate: true,
      handler(validator) {
        if (!validator) return
        this.$store.dispatch(`getSelfBond`, validator)
      }
    },
    lastHeader: {
      immediate: true,
      handler() {
        if (this.session.signedIn) {
          this.$store.dispatch(
            `getRewardsFromValidator`,
            this.$route.params.validator
          )
        }
      }
    }
  },
  mounted() {
    if (this.session.signedIn) {
      this.$store.dispatch(
        `getRewardsFromValidator`,
        this.$route.params.validator
      )
    }
  },
  methods: {
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
          key: `My Wallet - ${shortAddress(session.address, 20)}`,
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
            key: `${delegate.description.moniker} - ${shortAddress(
              delegate.operator_address,
              20
            )}`,
            value: index + 1
          }
        })
      return myWallet.concat(redelegationOptions)
    },
    // empty descriptions have a strange '[do-not-modify]' value which we don't want to show
    translateEmptyDescription(value) {
      if (!value || value === `[do-not-modify]`) return `--`
      return value
    }
  }
}
</script>
<style scoped>
@media screen and (max-width: 425px) {
  .page-profile__header__actions {
    width: 100%;
  }
}

@media screen and (max-width: 525px) {
  .page-profile__header__info {
    align-items: center;
    flex-direction: column;
  }

  .validator-name-and-address {
    padding-bottom: 2rem;
  }

  .page-profile__header .avatar {
    padding: 0;
    margin: 1rem auto;
  }
}
</style>

