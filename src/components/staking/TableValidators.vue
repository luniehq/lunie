<template>
  <div>
    <table class="data-table">
      <thead>
        <PanelSort :sort="sort" :properties="properties" :xs-prop="xsProp" />
      </thead>
      <tbody>
        <LiValidator
          v-for="validator in sortedEnrichedValidators"
          :key="validator.operator_address"
          :validator="validator"
          :xs-prop="xsProp"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import orderBy from "lodash.orderby"
import LiValidator from "staking/LiValidator"
import PanelSort from "staking/PanelSort"
import BN from "bignumber.js"
import { expectedReturns } from "src/filters"
export default {
  name: `table-validators`,
  components: {
    LiValidator,
    PanelSort
  },
  props: {
    validators: {
      type: Array,
      required: true
    },
    xsProp: {
      type: String,
      default: () => "returns"
    }
  },
  data: () => ({
    num: num,
    query: ``,
    sort: {
      property: `commission`,
      order: `asc`
    },
    rollingWindow: 10000 // param of slashing period
  }),
  computed: {
    ...mapGetters([
      `committedDelegations`,
      `delegates`,
      `session`,
      `distribution`,
      `bondDenom`,
      `keybase`,
      `pool`,
      `minting`,
      `lastHeader`,
      `yourValidators`
    ]),
    enrichedValidators(
      {
        validators,
        delegates: { signingInfos },
        pool,
        minting,
        committedDelegations,
        keybase,
        session,
        distribution,
        rollingWindow
      } = this
    ) {
      return validators.map(v => {
        const signingInfo = signingInfos[v.operator_address]
        return Object.assign({}, v, {
          small_moniker: v.description.moniker.toLowerCase(),
          my_delegations:
            session.signedIn && committedDelegations[v.operator_address] > 0
              ? committedDelegations[v.operator_address]
              : 0,
          commission: v.commission.rate,
          voting_power: BN(v.tokens)
            .div(pool.pool.bonded_tokens)
            .toFixed(10),
          keybase: keybase[v.description.identity],
          rewards:
            session.signedIn && distribution.rewards[v.operator_address]
              ? distribution.rewards[v.operator_address][this.bondDenom]
              : 0,
          uptime: signingInfo
            ? (rollingWindow - signingInfo.missed_blocks_counter) /
              rollingWindow
            : 0,
          expectedReturns: minting.annualProvision
            ? expectedReturns(
                v,
                parseInt(pool.pool.bonded_tokens),
                parseFloat(minting.annualProvision)
              )
            : undefined
        })
      })
    },
    sortedEnrichedValidators() {
      return orderBy(
        this.enrichedValidators.slice(0),
        [this.sort.property],
        [this.sort.order]
      )
    },
    properties() {
      return [
        {
          title: `Moniker`,
          value: `small_moniker`,
          tooltip: `The validator's moniker`
        },
        {
          title: `My Delegations`,
          value: `my_delegations`,
          tooltip: `Number of ${num.viewDenom(
            this.bondDenom
          )} you have delegated to this validator`
        },
        {
          title: `Rewards`,
          value: `rewards`,
          tooltip: `Rewards you have earned from this validator`
        },
        {
          title: `Voting Power`,
          value: `voting_power`,
          tooltip: `Percentage of voting shares`
        },
        {
          title: `Commission`,
          value: `commission`,
          tooltip: `The fee the validator will charge from your rewards`
        },
        {
          title: `Uptime`,
          value: `uptime`,
          tooltip: `Ratio of blocks signed within the last 10k blocks`
        },
        {
          title: `Returns`,
          value: `expectedReturns`,
          tooltip: `Approximate annualized return if validator is never punished`
        }
      ]
    }
  },
  mounted() {
    this.$store.dispatch(`getPool`)
    this.$store.dispatch(`getMintingParameters`)
  }
}
</script>
<style scoped>
@media screen and (max-width: 550px) {
  .data-table td {
    overflow: hidden;
  }

  .data-table__row__info {
    max-width: 22rem;
  }
}
</style>
