<template>
  <div>
    <div class="parameters__details parameters__section">
      <div class="row">
        <div class="column">
          <dl class="info_dl">
            <dt>
              Minimum Deposit
              <i
                v-tooltip.top="depositTooltips.min_deposit"
                class="material-icons info-button"
              >
                info_outline
              </i>
            </dt>
            <dd>
              {{
                governanceParameters.parameters.deposit.min_deposit
                  ? minimumDeposit
                  : `--`
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
              >
                info_outline
              </i>
            </dt>
            <dd>
              {{
                governanceParameters.parameters.deposit.max_deposit_period
                  ? depositPeriodInDays + ` days`
                  : `--`
              }}
            </dd>
          </dl>
        </div>
      </div>
    </div>

    <div class="parameters__details parameters__section">
      <div class="row">
        <div class="column">
          <dl class="info_dl">
            <dt>
              Threshold
              <i
                v-tooltip.top="tallyingTooltips.threshold"
                class="material-icons info-button"
              >
                info_outline
              </i>
            </dt>
            <dd>
              {{
                governanceParameters.parameters.tallying.threshold
                  ? `${parseFloat(
                      governanceParameters.parameters.tallying.threshold
                    ) * 100} %`
                  : `--`
              }}
            </dd>
          </dl>
          <dl class="info_dl">
            <dt>
              Veto
              <i
                v-tooltip.top="tallyingTooltips.veto"
                class="material-icons info-button"
              >
                info_outline
              </i>
            </dt>
            <dd>
              {{
                governanceParameters.parameters.tallying.veto
                  ? `${parseFloat(
                      governanceParameters.parameters.tallying.veto
                    ) * 100} %`
                  : `--`
              }}
            </dd>
          </dl>
        </div>

        <div class="column">
          <dl class="info_dl">
            <dt>
              Quorum
              <i
                v-tooltip.top="tallyingTooltips.quorum"
                class="material-icons info-button"
              >
                info_outline
              </i>
            </dt>
            <dd>
              {{
                governanceParameters.parameters.tallying.quorum
                  ? `${parseFloat(
                      governanceParameters.parameters.tallying.quorum
                    ) * 100} %`
                  : `--`
              }}
            </dd>
          </dl>
          <dl class="info_dl">
            <dt>
              Voting Period
              <i
                v-tooltip.top="votingTooltips.voting_period"
                class="material-icons info-button"
              >
                info_outline
              </i>
            </dt>
            <dd>
              {{
                governanceParameters.parameters.voting.voting_period
                  ? votingPeriodInDays + ` days`
                  : `--`
              }}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import num, { atoms } from "../../scripts/num.js"
export default {
  name: `tab-staking-parameters`,
  data: () => ({
    atoms,
    depositTooltips: {
      description: `Governance deposit parameters for the Cosmos Hub`,
      min_deposit: `Minimum deposit required before for a proposal can enter the voting period`,
      max_deposit_period: `Deposits must reach the "minimum deposit" threshold in this period of time`
    },
    tallyingTooltips: {
      description: `Tally parameters for governance in the Cosmos Hub`,
      threshold: `Percentage of "Yes" votes required for proposal to pass`,
      veto: `Percentage of "No With Veto" votes required for proposal to be vetoed`,
      quorum: `Percentage of tokens required to vote on a proposal to be considered valid`
    },
    votingTooltips: {
      description: `Voting parameters for governance in the Cosmos Hub`,
      voting_period: `Length of the voting period for proposals on the Cosmos Hub`
    }
  }),
  computed: {
    ...mapGetters([`session`, `governanceParameters`]),
    minimumDeposit() {
      const coin = num.createDisplayCoin(
        this.governanceParameters.parameters.deposit.min_deposit[0]
      )
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
  async created() {
    this.$store.dispatch(`getGovParameters`)
  }
}
</script>
<style>
.parameters__details > .row > .column {
  flex: 1;
}

.parameters__section {
  margin-bottom: 1rem;
  width: 100%;
}

.parameters__section h3 {
  padding: 0.5rem 1rem;
  font-size: var(--h3);
  font-weight: 500;
}
</style>
