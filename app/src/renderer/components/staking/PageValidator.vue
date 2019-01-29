<template>
  <page-profile data-title="Validator">
    <template slot="menu-body">
      <tm-balance />
      <tool-bar />
    </template>
    <tm-data-error v-if="!validator" /><template v-else>
      <div class="page-profile__header page-profile__section">
        <div class="column">
          <img
            v-if="validator.keybase"
            :src="validator.keybase.avatarUrl"
            class="avatar"
          >
          <img v-else class="avatar" src="~assets/images/validator-icon.svg">
        </div>
        <div class="column page-profile__header__info">
          <div class="row page-profile__header__name">
            <div class="column">
              <div class="page-profile__status-and-title">
                <span
                  v-tooltip.top="status"
                  :class="statusColor"
                  class="page-profile__status"
                />
                <div class="page-profile__header__name__title">
                  {{ validator.description.moniker }}
                </div>
              </div>
              <short-bech32 :address="validator.operator_address" />
            </div>
            <div class="column page-profile__header__actions">
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
          <div class="row page-profile__header__data">
            <dl class="colored_dl">
              <dt>Delegated {{ bondDenom }}</dt>
              <dd>
                {{
                  /* eslint-disable */
                  myBond.isLessThan(0.01) && myBond.isGreaterThan(0)
                    ? `< 0.01`
                    : num.shortNumber(myBond)
                  /*eslint-enable */
                }}
              </dd>
            </dl>
            <dl v-if="config.devMode" class="colored_dl">
              <dt>My Rewards</dt>
              <dd>n/a</dd>
            </dl>
            <div class="page-profile__header__data__break" />
            <dl class="colored_dl">
              <dt>Voting Power</dt>
              <dd id="page-profile__power">
                {{ pretty(powerRatio * 100) }} %
              </dd>
            </dl>
            <dl v-if="config.devMode" class="colored_dl">
              <dt>Uptime</dt>
              <dd id="page-profile__uptime">
                {{
                  validator.signing_info
                    ? pretty(validator.signing_info.signed_blocks_counter / 100)
                    : `n/a`
                }}
                %
              </dd>
            </dl>
            <dl class="colored_dl">
              <dt>Commission</dt>
              <dd id="page-profile__commission">
                {{ num.shortNumber(validator.commission.rate) }} %
              </dd>
            </dl>
            <dl v-if="config.devMode" class="colored_dl">
              <dt>Slashes</dt>
              <dd>n/a</dd>
            </dl>
          </div>
        </div>
      </div>
      <div class="page-profile__details page-profile__section">
        <div class="row">
          <div class="column">
            <dl class="info_dl">
              <dt>Operator</dt>
              <dd>{{ validator.operator_address }}</dd>
            </dl>
            <dl class="info_dl">
              <dt>Keybase ID</dt>
              <dd>
                {{ translateEmptyDescription(validator.description.identity) }}
              </dd>
            </dl>
            <dl v-if="config.devMode" class="info_dl">
              <dt>First Seen</dt>
              <dd>n/a</dd>
            </dl>
            <dl class="info_dl">
              <dt>Website</dt>
              <dd>
                {{ translateEmptyDescription(validator.description.website) }}
              </dd>
            </dl>
            <dl class="info_dl">
              <dt>Details</dt>
              <dd class="info_dl__text-box">
                {{ translateEmptyDescription(validator.description.details) }}
              </dd>
            </dl>
          </div>
          <div class="column">
            <dl class="info_dl">
              <dt>Commission Rate</dt>
              <dd>{{ validator.commission.rate }} %</dd>
            </dl>
            <dl class="info_dl">
              <dt>Max Commission Rate</dt>
              <dd>{{ validator.commission.max_rate }} %</dd>
            </dl>
            <dl class="info_dl">
              <dt>Max Daily Commission Change</dt>
              <dd>{{ validator.commission.max_change_rate }} %</dd>
            </dl>
            <dl class="info_dl">
              <dt>Last Commission Change</dt>
              <dd>
                {{
                  new Date(validator.commission.update_time).getTime() === 0
                    ? "Never"
                    : moment(
                      new Date(validator.commission.update_time)
                    ).fromNow()
                }}
              </dd>
            </dl>
            <dl class="info_dl">
              <dt>Self Delegated {{ bondDenom }}</dt>
              <dd id="page-profile__self-bond">
                {{ selfBond }} %
              </dd>
            </dl>
            <dl v-if="config.devMode" class="info_dl">
              <dt>Minimum Self Delegated {{ bondDenom }}</dt>
              <dd>0 %</dd>
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
        :maximum="myBond.toNumber()"
        :from-options="delegationTargetOptions()"
        :to="wallet.address"
        :validator="validator"
        :denom="bondDenom"
      />
      <tm-modal v-if="showCannotModal" :close="closeCannotModal">
        <div slot="title">
          Cannot {{ action === `delegate` ? `Delegate` : `Undelegate` }}
        </div>
        <p>
          You have no {{ bondDenom }}s
          {{ action === `undelegate` ? ` delegated ` : ` ` }}to
          {{ action === `delegate` ? ` delegate.` : ` this validator.` }}
        </p>
        <div slot="footer">
          <tmBtn
            id="no-atoms-modal__btn"
            value="OK"
            @click.native="closeCannotModal"
          />
        </div>
      </tm-modal>
    </template>
  </page-profile>
</template>

<script>
import moment from "moment"
import { calculateTokens } from "scripts/common"
import { mapGetters } from "vuex"
import num from "scripts/num"
import TmBtn from "common/TmBtn"
import ToolBar from "common/ToolBar"
import TmModal from "common/TmModal"
import TmDataError from "common/TmDataError"
import { shortAddress, ratToBigNumber } from "scripts/common"
import DelegationModal from "staking/DelegationModal"
import UndelegationModal from "staking/UndelegationModal"
import numeral from "numeral"
import ShortBech32 from "common/ShortBech32"
import TmBalance from "common/TmBalance"
import PageProfile from "common/PageProfile"
import { isEmpty } from "lodash"

export default {
  name: `page-validator`,
  components: {
    ShortBech32,
    DelegationModal,
    UndelegationModal,
    TmBtn,
    TmModal,
    ToolBar,
    TmDataError,
    TmBalance,
    PageProfile
  },
  data: () => ({
    num,
    showCannotModal: false,
    shortAddress,
    tabIndex: 1,
    action: ``,
    moment
  }),
  computed: {
    ...mapGetters([
      `bondDenom`,
      `delegates`,
      `delegation`,
      `committedDelegations`,
      `config`,
      `keybase`,
      `liquidAtoms`,
      `wallet`,
      `connected`
    ]),
    validator() {
      const validator = this.delegates.delegates.find(
        v => this.$route.params.validator === v.operator_address
      )
      if (validator)
        validator.keybase = this.keybase[validator.description.identity]
      return validator
    },
    selfBond() {
      return this.validator.selfBond
        ? (this.validator.selfBond * 100).toFixed(2)
        : 0
    },
    myBond() {
      return calculateTokens(
        this.validator,
        this.committedDelegations[this.validator.operator_address] || 0
      )
    },
    powerRatio() {
      return ratToBigNumber(this.validator.tokens)
        .div(this.delegates.globalPower)
        .toNumber()
    },
    // TODO enable once we decide on limits
    // powerRatioLevel() {
    //   if (this.powerRatio < 0.01) return `green`
    //   if (this.powerRatio < 0.03) return `yellow`
    //   return `red`
    // },
    // TODO enable once we decide on limits
    // commissionLevel() {
    //   if (this.validator.commission < 0.01) return `green`
    //   if (this.validator.commission < 0.03) return `yellow`
    //   return `red`
    // },
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
    }
  },
  watch: {
    validator: {
      immediate: true,
      handler(validator) {
        if (!validator) return
        this.$store.dispatch(`getSelfBond`, validator)
      }
    }
  },
  methods: {
    closeCannotModal() {
      this.showCannotModal = false
    },
    onDelegation() {
      this.action = `delegate`
      if (this.liquidAtoms > 0) {
        this.$refs.delegationModal.open()
      } else {
        this.showCannotModal = true
      }
    },
    onUndelegation() {
      this.action = `undelegate`
      if (this.myBond.isGreaterThan(0)) {
        this.$refs.undelegationModal.open()
      } else {
        this.showCannotModal = true
      }
    },
    delegationTargetOptions() {
      //- First option should always be your wallet (i.e normal delegation)
      const myWallet = [
        {
          address: this.wallet.address,
          maximum: Math.floor(this.liquidAtoms),
          key: `My Wallet - ${shortAddress(this.wallet.address, 20)}`,
          value: 0
        }
      ]
      const bondedValidators = Object.keys(this.committedDelegations)
      if (isEmpty(bondedValidators)) {
        return myWallet
      }
      //- The rest of the options are from your other bonded validators
      //- We skip the option of redelegating to the same address
      const redelegationOptions = bondedValidators
        .filter(address => address != this.$route.params.validator)
        .map((address, index) => {
          const delegate = this.delegates.delegates.find(function(validator) {
            return validator.operator_address === address
          })
          return {
            address: address,
            maximum: Math.floor(this.committedDelegations[address]),
            key: `${delegate.description.moniker} - ${shortAddress(
              delegate.operator_address,
              20
            )}`,
            value: index + 1
          }
        })
      return myWallet.concat(redelegationOptions)
    },
    pretty(num) {
      return numeral(num).format(`0,0.00`)
    },
    // empty descriptions have a strange '[do-not-modify]' value which we don't want to show
    translateEmptyDescription(value) {
      if (!value || value === `[do-not-modify]`) return `n/a`
      return value
    }
  }
}
</script>
