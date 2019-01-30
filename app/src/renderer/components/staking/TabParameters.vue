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
      <div class="parameters__details parameters__section">
        <div class="row">
          <div class="column">
            <dl class="info_dl">
              <dt>
                Total Liquid {{ bondDenom }}
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
                Total Delegated {{ bondDenom }}
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
      <div class="parameters__details parameters__section">
        <div class="row">
          <div class="column">
            <dl class="info_dl">
              <dt>
                Duration of Undelegation Period
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
              <dt>Current Staking Token</dt>
              <dd id="bond_denom">{{ bondDenom ? bondDenom : `--` }}</dd>
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
import TmDataLoading from "common/TmDataLoading"
export default {
  name: `tab-staking-parameters`,
  components: {
    TmBtn,
    TmListItem,
    TmPage,
    TmPart,
    ToolBar,
    TmDataConnecting,
    TmDataLoading
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
      `connected`,
      `bondDenom`
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
