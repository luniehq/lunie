<template>
  <tm-page data-title="Validator"
    ><template slot="menu-body">
      <tm-balance />
    </template>
    <div slot="menu">
      <tm-tool-bar>
        <router-link to="/staking/validators" exact="exact"
          ><i class="material-icons">arrow_back</i></router-link
        >
      </tm-tool-bar>
    </div>
    <tm-data-error v-if="!validator" /><template v-else>
      <div class="validator-profile__header validator-profile__section">
        <div class="column">
          <img
            v-if="validator.keybase"
            :src="validator.keybase.avatarUrl"
            class="avatar"
          /><img
            v-else
            class="avatar"
            src="~assets/images/validator-icon.svg"
          />
        </div>
        <div class="column validator-profile__header__info">
          <div class="row validator-profile__header__name">
            <div class="column">
              <div class="validator-profile__status-and-title">
                <span
                  v-tooltip.top="status"
                  :class="statusColor"
                  class="validator-profile__status"
                />
                <div class="validator-profile__header__name__title">
                  {{ validator.description.moniker }}
                </div>
              </div>
              <short-bech32 :address="validator.operator_address" />
            </div>
            <div class="column validator-profile__header__actions">
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
          <div class="row validator-profile__header__data">
            <dl class="colored_dl">
              <dt>Delegated {{ bondingDenom }}</dt>
              <dd>
                {{
                  myBond.isLessThan(0.01) && myBond.isGreaterThan(0)
                    ? `< 0.01` // eslint-disable-line
                    : num.shortNumber(myBond)
                }}
              </dd>
            </dl>
            <dl v-if="config.devMode" class="colored_dl">
              <dt>My Rewards</dt>
              <dd>n/a</dd>
            </dl>
            <div class="validator-profile__header__data__break" />
            <dl class="colored_dl">
              <dt>Voting Power</dt>
              <dd id="validator-profile__power">
                {{ pretty(powerRatio * 100) }} %
              </dd>
            </dl>
            <dl v-if="config.devMode" class="colored_dl">
              <dt>Uptime</dt>
              <dd id="validator-profile__uptime">
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
              <dd id="validator-profile__commission">
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
      <div class="validator-profile__details validator-profile__section">
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
              <dt>Self Delegated {{ bondingDenom }}</dt>
              <dd id="validator-profile__self-bond">{{ selfBond }} %</dd>
            </dl>
            <dl v-if="config.devMode" class="info_dl">
              <dt>Minimum Self Delegated {{ bondingDenom }}</dt>
              <dd>0 %</dd>
            </dl>
          </div>
        </div>
      </div>
      <delegation-modal
        v-if="showDelegationModal"
        :show-delegation-modal.sync="showDelegationModal"
        :from-options="delegationTargetOptions()"
        :to="validator.operator_address"
        @submitDelegation="submitDelegation"
      />
      <undelegation-modal
        v-if="showUndelegationModal"
        :show-undelegation-modal.sync="showUndelegationModal"
        :maximum="myBond"
        :to="wallet.address"
        @submitUndelegation="submitUndelegation"
      />
      <tm-modal v-if="showCannotModal" :close="closeCannotModal">
        <div slot="title">
          Cannot {{ action == `delegate` ? `Delegate` : `Undelegate` }}
        </div>
        <p>
          You have no {{ bondingDenom }}s
          {{ action == `undelegate` ? ` delegated ` : ` ` }}to
          {{ action == `delegate` ? ` delegate.` : ` this validator.` }}
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
  </tm-page>
</template>

<script>
import moment from "moment"
import { calculateTokens } from "scripts/common"
import { mapGetters } from "vuex"
import num from "scripts/num"
import { TmBtn, TmListItem, TmPage, TmPart, TmToolBar } from "@tendermint/ui"
import TmModal from "common/TmModal"
import TmDataError from "common/TmDataError"
import { shortAddress, ratToBigNumber } from "scripts/common"
import DelegationModal from "staking/DelegationModal"
import UndelegationModal from "staking/UndelegationModal"
import numeral from "numeral"
import ShortBech32 from "common/ShortBech32"
import TmBalance from "common/TmBalance"
import { isEmpty } from "lodash"
export default {
  name: `page-validator`,
  components: {
    ShortBech32,
    DelegationModal,
    UndelegationModal,
    TmBtn,
    TmListItem,
    TmModal,
    TmPage,
    TmPart,
    TmToolBar,
    TmDataError,
    TmBalance
  },
  data: () => ({
    num,
    showCannotModal: false,
    showDelegationModal: false,
    showUndelegationModal: false,
    shortAddress,
    tabIndex: 1,
    action: ``,
    moment
  }),
  computed: {
    ...mapGetters([
      `bondingDenom`,
      `delegates`,
      `delegation`,
      `committedDelegations`,
      `config`,
      `keybase`,
      `oldBondedAtoms`,
      `totalAtoms`,
      `wallet`,
      `connected`
    ]),
    validator() {
      let validator = this.delegates.delegates.find(
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
    },
    availableAtoms() {
      return this.totalAtoms - this.oldBondedAtoms
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
      if (this.availableAtoms > 0) {
        this.showDelegationModal = true
      } else {
        this.showCannotModal = true
      }
    },
    onUndelegation() {
      this.action = `undelegate`
      if (this.myBond.isGreaterThan(0)) {
        this.showUndelegationModal = true
      } else {
        this.showCannotModal = true
      }
    },
    async submitDelegation({ amount, from, password }) {
      const delegatorAddr = this.wallet.address
      let stakingTransactions = {}
      let txTitle,
        txBody,
        txAction = ``

      if (from === delegatorAddr) {
        txTitle = `delegation`
        txBody = `delegated`
        txAction = `delegating`

        stakingTransactions.delegations = [
          {
            atoms: amount,
            validator: this.validator
          }
        ]
      } else {
        txTitle = `redelegation`
        txBody = `redelegated`
        txAction = `redelegating`

        let validatorFrom = this.delegates.delegates.find(
          v => from === v.operator_address
        )

        stakingTransactions.redelegations = [
          {
            atoms: amount,
            validatorSrc: validatorFrom,
            validatorDst: this.validator
          }
        ]
      }

      try {
        await this.$store.dispatch(`submitDelegation`, {
          stakingTransactions,
          password
        })

        this.$store.commit(`notify`, {
          title: `Successful ${txTitle}!`,
          body: `You have successfully ${txBody} your ${this.bondingDenom}s`
        })
      } catch ({ message }) {
        this.$store.commit(`notifyError`, {
          title: `Error while ${txAction} ${this.bondingDenom}s`,
          body: message
        })
      }
    },
    async submitUndelegation({ amount, password }) {
      try {
        await this.$store.dispatch(`submitDelegation`, {
          stakingTransactions: {
            unbondings: [
              {
                atoms: -amount,
                validator: this.validator
              }
            ]
          },
          password
        })

        this.$store.commit(`notify`, {
          title: `Successful Undelegation!`,
          body: `You have successfully undelegated ${amount} ${
            this.bondingDenom
          }s.`
        })
      } catch ({ message }) {
        this.$store.commit(`notifyError`, {
          title: `Error while undelegating ${this.bondingDenom}s`,
          body: message
        })
      }
    },
    delegationTargetOptions() {
      //- First option should always be your wallet (i.e normal delegation)
      let myWallet = [
        {
          address: this.wallet.address,
          maximum: Math.floor(this.totalAtoms - this.oldBondedAtoms),
          key: `My Wallet - ${shortAddress(this.wallet.address, 20)}`,
          value: 0
        }
      ]
      let bondedValidators = Object.keys(this.committedDelegations)
      if (isEmpty(bondedValidators)) {
        return myWallet
      }
      //- The rest of the options are from your other bonded validators
      //- We skip the option of redelegating to the same address
      let redelegationOptions = bondedValidators
        .filter(address => address != this.$route.params.validator)
        .map((address, index) => {
          let delegate = this.delegates.delegates.find(function(validator) {
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

<style>
.validator-profile__section {
  background-color: var(--app-fg);
  display: flex;
  margin-bottom: 1rem;
  padding: 2rem;
  min-width: 63rem;
}

.column {
  display: flex;
  flex-flow: column;
  position: relative;
}

.row {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.validator-profile__header .avatar {
  background: var(--app-nav);
  border-radius: 50%;
  height: 155px;
  margin-right: 2rem;
  padding: 1rem;
  width: 155px;
}

.validator-profile__header__info {
  flex: 1;
}

.validator-profile__header__name {
  margin-bottom: 2rem;
}

.validator-profile__header__name__title {
  color: #fff;
  display: inline-block;
  font-size: var(--h1);
  line-height: var(--h1);
  font-weight: 400;
  padding: 0 0.5rem 0.5rem 0;
}

.validator-profile__header__name__address {
  font-size: var(--sm);
}

.validator-profile__header__actions {
  flex-flow: column;
  margin-left: auto;
}

.validator-profile__header__actions button:not(:last-child) {
  margin-bottom: 0.5rem;
}

.validator-profile__header__data__break {
  border-right: 1px solid var(--bc-dim);
  margin-right: 1rem;
}

.validator-profile__status {
  border-radius: 50%;
  display: inline-block;
  height: 0.5rem;
  left: -1rem;
  position: absolute;
  width: 0.5rem;
}

.validator-profile__status.red {
  background: var(--danger);
}

.validator-profile__status.yellow {
  background: var(--warning);
}

.validator-profile__status.green {
  background: var(--success);
}

.validator-profile__status.blue {
  background: var(--primary);
}

.validator-profile__status-and-title {
  align-items: center;
  display: flex;
}

.validator-profile__details > .row > .column {
  flex: 1;
}

.info_dl {
  display: flex;
  flex-flow: column;
  margin-bottom: 1.5rem;
  margin-right: 1rem;
}

.info_dl dt {
  color: var(--dim);
  font-size: var(--sm);
  margin-bottom: 4px;
}

.info_dl dd {
  border: solid 1px #31354e;
  border-radius: 2px;
  font-size: 1rem;
  line-height: 1rem;
  padding: 0.5rem;
}

.info_dl dd.info_dl__text-box {
  min-height: 6.91rem;
}

.colored_dl {
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 7rem;
}

.colored_dl:not(:last-child) {
  margin-right: 1rem;
}

.colored_dl dt {
  color: var(--dim);
  font-size: var(--sm);
  margin-bottom: 0.5rem;
  text-align: center;
}

.colored_dl dd {
  background-color: var(--white-fade-1);
  border: 1px solid var(--white-fade-2);
  border-radius: 4px;
  color: var(--dim);
  display: block;
  font-size: h6;
  line-height: h6;
  padding: 4px 4px;
  text-align: right;
  width: 100%;
}

.colored_dl dd.red {
  background-color: rgba(209, 2, 0, 0.15);
  border: solid 0.5px rgba(209, 2, 0, 0.25);
  color: #ff0200;
}

.colored_dl dd.yellow {
  background-color: rgba(255, 149, 2, 0.15);
  border: solid 0.5px rgba(255, 149, 2, 0.25);
  color: #ff9502;
}

.colored_dl dd.green {
  background-color: rgba(46, 164, 45, 0.15);
  border: solid 0.5px rgba(46, 164, 45, 0.25);
  color: #2ea42d;
}
</style>
