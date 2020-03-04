<template>
  <div v-if="network.powered" class="powered-div">
    <span class="powered-by">Powered by</span>
    <Avatar
      v-if="!network.powered.picture || network.powered.picture === 'null'"
      class="powered-by-image"
      alt="generic geometric symbol - generated avatar from address"
      :address="network.powered.providerAddress"
    />
    <img
      v-else
      :src="network.powered.picture"
      :alt="`validator logo for ` + network.powered.name"
      class="powered-by-image"
    />
    <span
      :class="{
        active: network.powered.providerAddress,
        inactive: !network.powered.providerAddress
      }"
      @click="
        network.powered.providerAddress
          ? $router.push({
              name: 'validator',
              params: {
                networkId: network.slug,
                validator: network.powered.providerAddress
              }
            })
          : ''
      "
      >{{ network.powered.name }}</span
    >
  </div>
</template>
<script>
import Avatar from "common/Avatar"

export default {
  name: `powered-by`,
  components: {
    Avatar
  },
  props: {
    network: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.powered-div {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 12px;
}

.powered-by {
  color: var(--dim);
}

.powered-by-image {
  width: 1rem;
  border-radius: 100%;
  margin: 0 0.5rem 0 0.5rem;
}

.active {
  font-weight: 500;
  cursor: pointer;
  color: var(--txt);
}

.active:hover {
  color: var(--link-hover);
}

.inactive {
  font-weight: 500;
  color: var(--txt);
}
</style>
