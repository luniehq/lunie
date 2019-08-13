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
      <ApolloQuery
        :query="ValidatorProfile"
        :variables="{ address: validator.operator_address }"
        :update="validatorProfileResultUpdate"
      >
        <template v-slot="{ result: { loading, error, data: keybase } }">
          <Avatar
            v-if="!keybase || !keybase.avatarUrl || loading || error"
            class="data-table__row__info__image data-table__row__info__image--no-img"
            alt="generic validator logo - generated avatar from address"
            :address="validator.operator_address"
          />
          <img
            v-else-if="keybase && keybase.avatarUrl"
            :src="keybase.avatarUrl"
            class="data-table__row__info__image"
            :alt="`validator logo for ` + validator.description.moniker"
          />
        </template>
      </ApolloQuery>
      <div class="data-table__row__info__container">
        <span
          v-tooltip.top="status"
          :class="statusColor"
          class="data-table__row__info__container__status"
        />
        <span class="data-table__row__info__container__name">
          {{
          validator.description.moniker
          }}
        </span>
        <div class="data-table__row__info__container__description">
          <Bech32 :address="validator.operator_address" />
        </div>
      </div>
    </td>
    <td :class="{ 'hide-xs': showOnMobile !== 'my_delegations' }">
      {{
      validator.my_delegations
      ? shortDecimals(atoms(validator.my_delegations))
      : `--`
      }}
    </td>
    <td
      :class="{ 'hide-xs': showOnMobile !== 'rewards' }"
    >{{ validator.rewards ? shortDecimals(atoms(validator.rewards)) : `--` }}</td>
    <td
      :class="{ 'hide-xs': showOnMobile !== 'voting-power' }"
    >{{ validator.tokens ? percentOfVotingPower : `--` }}</td>
    <td
      :class="{ 'hide-xs': showOnMobile !== 'commission' }"
    >{{ validator.commission ? percent(validator.commission) : `--` }}</td>
    <td
      :class="{ 'hide-xs': showOnMobile !== 'uptime' }"
    >{{ validator.uptime ? percent(validator.uptime) : `--` }}</td>
    <td :class="{ 'hide-xs': showOnMobile !== 'expectedReturns' }">
      {{
      validator.expectedReturns ? percent(validator.expectedReturns) : `--`
      }}
    </td>
  </tr>
</template>

<script>
import { mapState } from "vuex"
import { percent, shortDecimals, atoms } from "scripts/num"
import Bech32 from "common/Bech32"
import Avatar from "common/Avatar"
import BN from "bignumber.js"
import { ValidatorProfile, validatorProfileResultUpdate } from "src/gql"

export default {
  name: `li-validator`,
  components: {
    Bech32,
    Avatar
  },
  props: {
    validator: {
      type: Object,
      required: true
    },
    showOnMobile: {
      type: String,
      default: () => "returns"
    }
  },
  data: () => ({
    ValidatorProfile
  }),
  computed: {
    ...mapState([`pool`]),
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
      return percent(
        BN(this.validator.tokens)
          .div(this.pool.pool.bonded_tokens)
          .toFixed(4)
      )
    }
  },
  methods: {
    shortDecimals,
    atoms,
    percent,
    validatorProfileResultUpdate
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
