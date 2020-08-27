<template>
  <div class="address-item">
    <img
      class="network-icon"
      :src="address.icon || `/img/networks/${address.networkId}.png`"
      alt="little circle with network logo"
    />
    <div class="address-infos">
      <div class="address-name-role">
        <p v-if="address.name" class="address-name">{{ capitalizeFirstLetter(address.name) }}</p>
        <p
          v-if="
            address.addressRole &&
            address.addressRole !== `none` &&
            address.addressRole !== `stash/controller`
          "
        >{{ address.name ? '&nbsp;' : ''}}{{ capitalizeFirstLetter(address.addressRole) }}</p>
      </div>
      <span class="address">{{ address.address | formatAddress }}</span>
      <span class="address" v-if="address.sessionType">{{
        capitalizeFirstLetter(address.sessionType)
      }}</span>
    </div>
  </div>
</template>
<script>
import { formatAddress } from "src/filters"
import { capitalizeFirstLetter } from "scripts/common"
export default {
  name: `user-account-row`,
  filters: {
    formatAddress,
  },
  props: {
    address: {
      type: Object,
      required: true,
    },
  },
  methods: {
    capitalizeFirstLetter,
  },
}
</script>
<style scoped>
.address-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.network-icon {
  display: block;
  position: relative;
  max-height: 100%;
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 50%;
  margin-right: 0.5rem;
  padding: 0.25rem;
}

.address-infos {
  display: flex;
  flex-direction: column;
}

.address-name {
  color: black;
}

.address-name-role {
  display: flex;
  white-space: break-spaces;
}
</style>
