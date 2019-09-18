<template>
  <tr
    class="li-validator"
    :data-moniker="validator.moniker"
    @click="
      $router.push({
        name: 'validator',
        params: { validator: validator.operator_address }
      })
    "
  >
    <td>{{ index + 1 }}</td>
    <td class="hide-xs">
      <div class="status-container">
        <span :class="status | toLower" class="validator-status">
          {{ status }}
        </span>
      </div>
    </td>
    <td class="data-table__row__info">
      <Avatar
        v-if="!validator || !validator.avatarUrl"
        class="li-validator-image"
        alt="generic validator logo - generated avatar from address"
        :address="validator.operator_address"
      />
      <img
        v-else-if="validator && validator.avatarUrl"
        :src="validator.avatarUrl"
        class="li-validator-image"
        :alt="`validator logo for ` + validator.moniker"
      />
      <div class="validator-info">
        <h3 class="li-validator-name">
          {{ validator.moniker }}
        </h3>
        <div v-if="validator.my_delegations > 0">
          <h4>
            {{ validator.my_delegations | atoms | shortDecimals }}
          </h4>
          <h5 v-if="validator.rewards > 0">
            +{{ validator.rewards | atoms | shortDecimals }}
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
      {{ validator.voting_power | percent }}
    </td>
  </tr>
</template>

<script>
import { percent, shortDecimals, atoms } from "scripts/num"
import Avatar from "common/Avatar"

export default {
  name: `li-validator`,
  components: {
    Avatar
  },
  filters: {
    atoms,
    shortDecimals,
    percent,
    toLower: text => text.toLowerCase()
  },
  props: {
    validator: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    showOnMobile: {
      type: String,
      /* istanbul ignore next */
      default: () => "returns"
    }
  },
  computed: {
    status() {
      if (
        this.validator.jailed ||
        this.validator.tombstoned ||
        this.validator.status === 0
      )
        return `Inactive`
      return `Active`
    }
  },
  methods: {
    percent
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
  width: 2.5rem;
  border: 1px solid var(--bc-dim);
}

.validator-status {
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 600;
  border: 2px solid;
  padding: 2px 4px;
  border-radius: 0.25rem;
}

.validator-status.inactive {
  color: var(--warning);
  border-color: var(--warning);
}

.validator-status.active {
  color: var(--success);
  border-color: var(--success);
}
</style>
