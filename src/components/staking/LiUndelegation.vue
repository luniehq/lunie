<template>
  <tr
    class="li-validator"
    :data-moniker="validator.moniker"
    @click="
      $router.push({
        name: 'validator',
        params: { validator: validator.operatorAddress }
      })
    "
  >
    <td>{{ index + 1 }}</td>
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
        :alt="`validator logo for ` + validator.moniker"
      />
      <div class="validator-info">
        <h3 class="li-validator-name">
          {{ validator.moniker }}
        </h3>
        <h4>
          {{ undelegation.amount }}
        </h4>
      </div>
    </td>
    <td>
      {{ undelegation.endTime | fromNow }}
    </td>
  </tr>
</template>

<script>
import { fromNow } from "src/filters"
import Avatar from "common/Avatar"

export default {
  name: `li-validator`,
  components: {
    Avatar
  },
  filters: {
    fromNow
  },
  props: {
    index: {
      type: Number,
      required: true
    },
    validator: {
      type: Object,
      required: true
    },
    undelegation: {
      type: Object,
      required: true
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
