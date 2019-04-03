<template>
  <div>
    <div>
      <h3>
        Deposit Parameters
        <i
          v-tooltip.top="depositTooltips.description"
          class="material-icons info-button"
          >info_outline</i
        >
      </h3>
      <div class="parameters__details parameters__section">
        <div class="row">
          <div class="column">
            <dl class="info_dl">
              <dt>
                Minimum Deposit
                <i
                  v-tooltip.top="depositTooltips.min_deposit"
                  class="material-icons info-button"
                  >info_outline</i
                >
              </dt>
              <dd>
                {{
                  governanceParameters.parameters.deposit.min_deposit
                    ? minimumDeposit
                    : `n/a`
                }}
              </dd>
            </dl>
          </div>
          <div class="column">
            <dl class="info_dl">
              <dt>
                Maximum Deposit Period
                <i
                  v-tooltip.top="depositTooltips.max_deposit_period"
                  class="material-icons info-button"
                  >info_outline</i
                >
              </dt>
              <dd>
                {{
                  governanceParameters.parameters.deposit.max_deposit_period
                    ? depositPeriodInDays + ` days`
                    : `n/a`
                }}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h3>
        Tally Parameters
        <i
          v-tooltip.top="tallyingTooltips.description"
          class="material-icons info-button"
          >info_outline</i
        >
      </h3>
      <div class="parameters__details parameters__section">
        <div class="row">
          <div class="column">
            <dl class="info_dl">
              <dt>
                Threshold
                <i
                  v-tooltip.top="tallyingTooltips.threshold"
                  class="material-icons info-button"
                  >info_outline</i
                >
              </dt>
              <dd>
                {{
                  governanceParameters.parameters.tallying.threshold
                    ? `${parseFloat(
                        governanceParameters.parameters.tallying.threshold
                      ) * 100} %`
                    : `n/a`
                }}
              </dd>
            </dl>
            <dl class="info_dl">
              <dt>
                Veto
                <i
                  v-tooltip.top="tallyingTooltips.veto"
                  class="material-icons info-button"
                  >info_outline</i
                >
              </dt>
              <dd>
                {{
                  governanceParameters.parameters.tallying.veto
                    ? `${parseFloat(
                        governanceParameters.parameters.tallying.veto
                      ) * 100} %`
                    : `n/a`
                }}
              </dd>
            </dl>
          </div>
          <div class="column">
            <dl class="info_dl">
              <dt>
                Governance Penalty
                <i
                  v-tooltip.top="tallyingTooltips.governance_penalty"
                  class="material-icons info-button"
                  >info_outline</i
                >
              </dt>
              <dd>
                {{
                  governanceParameters.parameters.tallying.governance_penalty
                    ? governanceParameters.parameters.tallying
                        .governance_penalty
                    : `n/a`
                }}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h3>
        Voting Parameters
        <i
          v-tooltip.top="votingTooltips.description"
          class="material-icons info-button"
          >info_outline</i
        >
      </h3>
      <div class="parameters__details parameters__section">
        <div class="row">
          <div class="column">
            <dl class="info_dl">
              <dt>
                Voting Period
                <i
                  v-tooltip.top="votingTooltips.voting_period"
                  class="material-icons info-button"
                  >info_outline</i
                >
              </dt>
              <dd>
                {{
                  governanceParameters.parameters.voting.voting_period
                    ? votingPeriodInDays + ` days`
                    : `n/a`
                }}
              </dd>
            </dl>
          </div>
          <div class="column"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TmBtn from "common/TmBtn"
import TmPage from "common/TmPage"
import ToolBar from "common/ToolBar"
import TmPart from "common/TmPart"
import TmListItem from "common/TmListItem"
export default {
  name: `tab-staking-parameters`,
  components: {
    TmBtn,
    TmListItem,
    TmPage,
    TmPart,
    ToolBar
  },
  data: () => ({
    depositTooltips: {
      description: `Governance deposit parameters for the Cosmos Hub`,
      min_deposit: `Minimum deposit required before for a proposal can enter the voting period`,
      max_deposit_period: `Deposits must reach the "minimum deposit" threshold in this period of time`
    },
    tallyingTooltips: {
      description: `Tally parameters for governance in the Cosmos Hub`,
      threshold: `Percentage of "Yes" votes required for proposal to pass`,
      veto: `Percentage of "No With Veto" votes required for proposal to be vetoed`,
      governance_penalty: `Penalty for a validator who fails to vote`
    },
    votingTooltips: {
      description: `Voting parameters for governance in the Cosmos Hub`,
      voting_period: `Length of the voting period for proposals on the Cosmos Hub`
    }
  }),
  computed: {
    ...mapGetters([`config`, `governanceParameters`]),
    minimumDeposit() {
      let coin = this.governanceParameters.parameters.deposit.min_deposit[0]
      return `${coin.amount} ${coin.denom}s`
    },
    depositPeriodInDays() {
      return (
        parseInt(
          this.governanceParameters.parameters.deposit.max_deposit_period
        ) /
        (10 ** 9 * 60 * 60 * 24)
      )
    },
    votingPeriodInDays() {
      return (
        parseInt(this.governanceParameters.parameters.voting.voting_period) /
        (10 ** 9 * 60 * 60 * 24)
      )
    }
  },
  async mounted() {
    this.$store.dispatch(`getGovParameters`)
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
