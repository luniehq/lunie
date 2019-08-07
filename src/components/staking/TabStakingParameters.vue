<template>
  <TmDataConnecting v-if="!connected && !stakingParameters.loaded" />
  <TmDataLoading
    v-else-if="!stakingParameters.loaded && stakingParameters.loading"
  />
  <div v-else>
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
                >
                  info_outline
                </i>
              </dt>
              <dd id="unbonding_time">
                {{
                  stakingParameters.parameters.unbonding_time
                    ? unbondingTimeInDays + ` days`
                    : `--`
                }}
              </dd>
            </dl>
            <dl class="info_dl">
              <dt>Current Staking Token</dt>
              <dd id="bond_denom">
                {{ bondDenom ? num.viewDenom(bondDenom) : `--` }}
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
                    : `--`
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
import { mapState, mapGetters } from "vuex"
import num from "scripts/num"
import TmDataConnecting from "common/TmDataConnecting"
import TmDataLoading from "common/TmDataLoading"
export default {
  name: `tab-staking-parameters`,
  components: {
    TmDataConnecting,
    TmDataLoading
  },
  data: () => ({
    num,
    paramsTooltips: {
      description: `Staking parameters define the high level settings for staking`,
      unbonding_time: `Time to complete an undelegation transaction and claim rewards`,
      max_validators: `Maximum number of validators in the validator set`,
      bond_denom: `The token being used for staking`
    }
  }),
  computed: {
    ...mapState([`stakingParameters`]),
    ...mapGetters([`connected`, `bondDenom`]),
    unbondingTimeInDays() {
      return (
        parseInt(this.stakingParameters.parameters.unbonding_time) /
        (10 ** 9 * 60 * 60 * 24)
      )
    }
  },
  async mounted() {
    this.$store.dispatch(`getStakingParameters`)
  }
}
</script>
