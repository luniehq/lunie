<template>
  <tm-data-connecting
    v-if="(!stakingParameters.loaded || !pool.loaded) && !connected"
  />
  <tm-data-loading
    v-else-if="
      (!stakingParameters.loaded && stakingParameters.loading) ||
        (!pool.loaded && pool.loading)
    "
  />
  <div v-else>
    <div>
      <h3 class="staking-pool">
        Staking Pool
        <i
          v-tooltip.top="poolTooltips.description"
          class="material-icons info-button"
          >info_outline</i
        >
      </h3>
      <div class="parameters__details parameters__section">
        <div class="row">
          <div class="column">
            <dl class="info_dl">
              <dt>
                Loose
                {{
                  stakingParameters.parameters.bond_denom
                    ? stakingParameters.parameters.bond_denom
                    : bondingDenom
                }}
                <i
                  v-tooltip.top="poolTooltips.loose_tokens"
                  class="material-icons info-button"
                  >info_outline</i
                >
              </dt>
              <dd id="loose_tokens">
                {{ pool.pool.loose_tokens ? pool.pool.loose_tokens : `n/a` }}
              </dd>
            </dl>
          </div>
          <div class="column">
            <dl class="info_dl">
              <dt>
                Delegated
                {{
                  stakingParameters.parameters.bond_denom
                    ? stakingParameters.parameters.bond_denom
                    : bondingDenom
                }}
                <i
                  v-tooltip.top="poolTooltips.bonded_tokens"
                  class="material-icons info-button"
                  >info_outline</i
                >
              </dt>
              <dd id="bonded_tokens">
                {{ pool.pool.bonded_tokens ? pool.pool.bonded_tokens : `n/a` }}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h3 class="staking-parameters">
        Staking Parameters
        <i
          v-tooltip.top="paramsTooltips.description"
          class="material-icons info-button"
          >info_outline</i
        >
      </h3>
      <div class="parameters__details parameters__section">
        <div class="row">
          <div class="column">
            <dl class="info_dl">
              <dt>
                Unbonding Time
                <i
                  v-tooltip.top="paramsTooltips.unbonding_time"
                  class="material-icons info-button"
                  >info_outline</i
                >
              </dt>
              <dd id="unbonding_time">
                {{
                  stakingParameters.parameters.unbonding_time
                    ? unbondingTimeInDays + ` days`
                    : `n/a`
                }}
              </dd>
            </dl>
            <dl class="info_dl">
              <dt>Current Staking Coin Denomination</dt>
              <dd id="bond_denom">
                {{
                  stakingParameters.parameters.bond_denom
                    ? stakingParameters.parameters.bond_denom
                    : `n/a`
                }}
              </dd>
            </dl>
          </div>
          <div class="column">
            <dl class="info_dl">
              <dt>Maximum Number of Validators</dt>
              <dd id="max_validators">
                {{
                  stakingParameters.parameters.max_validators
                    ? stakingParameters.parameters.max_validators
                    : `n/a`
                }}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TmBtn from "common/TmBtn"
import TmListItem from "common/TmListItem"
import TmPage from "common/TmPage"
import TmPart from "common/TmPart"
import ToolBar from "common/ToolBar"
import TmDataConnecting from "common/TmDataConnecting"
export default {
  name: `tab-staking-parameters`,
  components: {
    TmBtn,
    TmListItem,
    TmPage,
    TmPart,
    ToolBar,
    TmDataConnecting
  },
  data: () => ({
    paramsTooltips: {
      description: `Staking parameters define the high level settings for staking`,
      unbonding_time: `Time to complete an undelegation transaction and claim rewards`,
      max_validators: `Maximum number of validators in the validator set`,
      bond_denom: `The token being used for staking`
    },
    poolTooltips: {
      description: `The staking pool represents the dynamic parameters of the Cosmos Hub`,
      loose_tokens: `Total tokens which are not currently delegated to a validator`,
      bonded_tokens: `Total tokens which are currently delegated to a validator`
    }
  }),
  computed: {
    ...mapGetters([
      `config`,
      `stakingParameters`,
      `pool`,
      `bondingDenom`,
      `connected`
    ]),
    unbondingTimeInDays() {
      return (
        parseInt(this.stakingParameters.parameters.unbonding_time) /
        (10 ** 9 * 60 * 60 * 24)
      )
    }
  },
  async mounted() {
    this.$store.dispatch(`getStakingParameters`)
    this.$store.dispatch(`getPool`)
  }
}
</script>
<style>
.parameters__details > .row > .column {
  flex: 1;
}

.parameters__section {
  background-color: var(--app-fg);
  display: flex;
  margin-bottom: 1rem;
  padding: 2rem;
  width: 100%;
}

h3 {
  margin: 1em auto;
}

.info-button {
  color: var(--link);
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
  border: 1px solid var(--white-fade-2);
  border-radius: 2px;
  font-size: 1rem;
  line-height: 1rem;
  padding: 0.5rem;
}

.info_dl dd.info_dl__text-box {
  min-height: 6.91rem;
}
</style>
