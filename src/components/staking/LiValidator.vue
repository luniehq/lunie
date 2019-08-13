<template>
  <tr
    class="li-validator"
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
        class="li-validator-image"
        :alt="`validator logo for ` + validator.description.moniker"
      />
      <img
        v-else
        class="li-validator-image"
        src="~assets/images/validator-icon.svg"
        alt="generic validator logo - graphic triangle supporting atom token"
      />
      <div class="validator-info">
        <h3 class="li-validator-name">{{ validator.description.moniker }}</h3>
        <div v-if="validator.my_delegations > 0">
          <h4>
            {{
            validator.my_delegations
            ? num.shortDecimals(num.atoms(validator.my_delegations))
            : null
            }}
          </h4>
          <h5 v-if="validator.rewards > 0">
            {{
            validator.rewards
            ? `+` + num.shortDecimals(num.atoms(validator.rewards))
            : `--`
            }}
          </h5>
        </div>
      </div>
    </td>
    <td :class="{ 'hide-xs': showOnMobile !== 'expectedReturns' }">
      {{
      validator.expectedReturns
      ? num.percent(validator.expectedReturns)
      : `--`
      }}
    </td>
    <td
      :class="{ 'hide-xs': showOnMobile !== 'voting-power' }"
    >{{ validator.tokens ? percentOfVotingPower : `--` }}</td>
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
    showOnMobile: {
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
.li-validator {
  padding: 0.5rem 1rem;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid var(--bc-dim);
  border-radius: 0.25rem;
}

.li-validator:last-child {
  border-bottom: none;
}

.validator-info {
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
  text-overflow: ellipsis;
}

.li-validator h4,
.li-validator h5 {
  font-size: var(--sm);
  display: inline-block;
}

.li-validator h5 {
  color: var(--success);
}

.li-validator:hover {
  cursor: pointer;
  background: var(--hover-bg);
  color: var(--bright);
}

.li-validator-name {
  font-size: 1rem;
  line-height: 18px;
  font-weight: 500;
  white-space: pre-wrap;
  color: var(--bright);
  display: inline-block;
}

.li-validator-image {
  border-radius: 0.25rem;
  height: 2.5rem;
  min-width: 2.5rem;
  border: 1px solid var(--bc-dim);
}
</style>
