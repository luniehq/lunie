<template>
  <div>
    <table class="data-table">
      <thead>
        <PanelSort
          :sort="sort"
          :properties="properties"
          :show-on-mobile="showOnMobile"
        />
      </thead>
      <tbody>
        <LiValidator
          v-for="validator in sortedEnrichedValidators"
          :key="validator.operator_address"
          :validator="validator"
          :show-on-mobile="showOnMobile"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import num from "scripts/num"
import orderBy from "lodash.orderby"
import LiValidator from "staking/LiValidator"
import PanelSort from "staking/PanelSort"
import BN from "bignumber.js"
import { expectedReturns } from "scripts/returns"
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
    showOnMobile: {
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
      `lastHeader`
    ]),
    ...mapState({
      annualProvision: state => state.minting.annualProvision
    }),
    enrichedValidators(
      {
        validators,
        delegates: { signingInfos },
        pool,
        annualProvision,
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
          expectedReturns: annualProvision
            ? expectedReturns(
                v,
                parseInt(pool.pool.bonded_tokens),
                parseFloat(annualProvision)
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
          title: `Name`,
          value: `small_moniker`,
          tooltip: `The validator's moniker`
        },
        {
          title: `Rewards`,
          value: `expectedReturns`,
          tooltip: `Approximate annualized reward`
        },
        {
          title: `Voting Power`,
          value: `voting_power`,
          tooltip: `Percentage of voting shares`
        }
      ]
    }
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
