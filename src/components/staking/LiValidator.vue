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
      <ApolloQuery
        :query="ValidatorProfile"
        :variables="{ address: validator.operator_address }"
        :update="validatorProfileResultUpdate"
      >
        <template v-slot="{ result: { loading, error, data: keybase } }">
          <Avatar
            v-if="!keybase || !keybase.avatarUrl || loading || error"
            class="li-validator-image"
            alt="generic validator logo - generated avatar from address"
            :address="validator.operator_address"
          />
          <img
            v-else-if="keybase && keybase.avatarUrl"
            :src="keybase.avatarUrl"
            class="li-validator-image"
            :alt="`validator logo for ` + validator.description.moniker"
          />
        </template>
      </ApolloQuery>
      <div class="validator-info">
        <h3 class="li-validator-name">
          {{ validator.description.moniker }}
        </h3>
        <div v-if="validator.my_delegations > 0">
          <h4>
            {{
              validator.my_delegations
                ? shortDecimals(atoms(validator.my_delegations))
                : null
            }}
          </h4>
          <h5 v-if="validator.rewards > 0">
            {{
              validator.rewards
                ? `+` + shortDecimals(atoms(validator.rewards))
                : `--`
            }}
          </h5>
        </div>
      </div>
    </td>
    <td :class="{ 'hide-xs': showOnMobile !== 'expectedReturns' }">
      {{
        validator.expectedReturns ? percent(validator.expectedReturns) : `--`
      }}
    </td>
    <td :class="{ 'hide-xs': showOnMobile !== 'voting-power' }">
      {{ validator.tokens ? percentOfVotingPower : `--` }}
    </td>
  </tr>
</template>

<script>
import { mapState } from "vuex"
import { percent, shortDecimals, atoms } from "scripts/num"
import Avatar from "common/Avatar"
import BN from "bignumber.js"
import { ValidatorProfile, validatorProfileResultUpdate } from "src/gql"

export default {
  name: `li-validator`,
  components: {
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
  padding-left: 0.5rem;
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
