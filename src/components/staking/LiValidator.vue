<template>
  <tr
    class="li-validator"
    :data-name="validator.name"
    @click="
      $router.push({
        name: 'validator',
        params: { validator: validator.operatorAddress }
      })
    "
  >
    <td>{{ index + 1 }}</td>
    <td class="hide-xs">
      <div class="status-container">
        <span
          :class="validator.status | toLower"
          class="validator-status"
          :title="validator.statusDetailed"
        >
          {{ validator.status }}
        </span>
      </div>
    </td>
    <td class="data-table__row__info">
      <Avatar
        v-if="!validator || !validator.picture"
        class="li-validator-image"
        alt="generic validator logo - generated avatar from address"
        :address="validator.operatorAddress"
      />
      <img
        v-else-if="validator && validator.picture"
        :src="validator.picture"
        class="li-validator-image"
        :alt="`validator logo for ` + validator.name"
      />
      <div class="validator-info">
        <h3 class="li-validator-name">
          {{ validator.name | truncate(30) }}
        </h3>
        <div v-if="delegation.amount > 0">
          <h4>
            {{ delegation.amount | shortDecimals }}
          </h4>
          <h5 v-if="rewards.amount > 0.001">
            +{{ rewards.amount | shortDecimals }}
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
      {{ validator.votingPower | percent }}
    </td>
  </tr>
</template>

<script>
import { truncate } from "src/filters"
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
    truncate,
    toLower: text => text.toLowerCase()
  },
  props: {
    validator: {
      type: Object,
      required: true
    },
    delegation: {
      type: Object,
      default: () => ({})
    },
    rewards: {
      type: Object,
      default: () => ({})
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
