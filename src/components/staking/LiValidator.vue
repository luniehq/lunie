<template>
  <tr
    class="data-table__row li-validator"
    :data-moniker="validator.description.moniker"
    @click="
      $router.push({
        name: 'validator',
        params: { validator: validator.operator_address }
      })
    "
  >
    <td class="data-table__row__info">
      <img
        v-if="validator.keybase && validator.keybase.avatarUrl"
        :src="validator.keybase.avatarUrl"
        class="data-table__row__info__image"
      />
      <img
        v-else
        class="
          data-table__row__info__image
          data-table__row__info__image--no-img
        "
        src="~assets/images/validator-icon.svg"
      />
      <div class="data-table__row__info__container">
        <span
          v-tooltip.top="status"
          :class="statusColor"
          class="data-table__row__info__container__status"
        />
        <span class="data-table__row__info__container__name">
          {{ validator.description.moniker }}
        </span>
        <div class="data-table__row__info__container__description">
          <Bech32 :address="validator.operator_address" />
        </div>
      </div>
    </td>
    <td :class="{ 'hide-xs': xsProp !== 'my_delegations' }">
      {{
        validator.my_delegations
          ? num.shortDecimals(num.atoms(validator.my_delegations))
          : `--`
      }}
    </td>
    <td :class="{ 'hide-xs': xsProp !== 'rewards' }">
      {{
        validator.rewards
          ? num.shortDecimals(num.atoms(validator.rewards))
          : `--`
      }}
    </td>
    <td :class="{ 'hide-xs': xsProp !== 'voting-power' }">
      {{ validator.tokens ? percentOfVotingPower : `--` }}
    </td>
    <td :class="{ 'hide-xs': xsProp !== 'commission' }">
      {{ validator.commission ? num.percent(validator.commission) : `--` }}
    </td>
    <td :class="{ 'hide-xs': xsProp !== 'uptime' }">
      {{ validator.uptime ? num.percent(validator.uptime) : `--` }}
    </td>
    <td :class="{ 'hide-xs': xsProp !== 'expectedReturns' }">
      {{
        validator.expectedReturns
          ? num.percent(validator.expectedReturns)
          : `--`
      }}
    </td>
  </tr>
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import Bech32 from "common/Bech32"
import BN from "bignumber.js"
export default {
  name: `li-validator`,
  components: {
    Bech32
  },
  props: {
    validator: {
      type: Object,
      required: true
    },
    xsProp: {
      type: String,
      default: () => "returns"
    }
  },
  data: () => ({ num }),
  computed: {
    ...mapGetters([
      `delegates`,
      `distribution`,
      `session`,
      `lastHeader`,
      `pool`
    ]),
    status() {
      // status: jailed
      if (this.validator.jailed)
        return `This validator has been jailed and is not currently validating`

      // status: inactive
      if (parseFloat(this.validator.status) === 0)
        return `This validator does not have enough voting power and is inactive`

      // status: active
      return `This validator is actively validating`
    },
    statusColor() {
      // status: jailed
      if (this.validator.jailed) return `red`

      // status: inactive
      if (parseFloat(this.validator.status) === 0) return `yellow`

      // status: active
      return `green`
    },
    percentOfVotingPower() {
      return num.percent(
        BN(this.validator.tokens)
          .div(this.pool.pool.bonded_tokens)
          .toFixed(4)
      )
    }
  }
}
</script>
<style scoped>
.data-table__row {
  cursor: pointer;
}

@media screen and (max-width: 550px) {
  .hide-xs {
    display: none;
  }

  .data-table__row {
    max-width: calc(100vw - 2px);
    padding: 0;
  }

  .data-table__row__info {
    max-width: calc(100vw - 6rem);
  }
}
</style>
