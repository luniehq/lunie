<template>
  <div
    v-if="network.powered"
    class="powered-by-container"
    :class="{
      'powered-by-line': poweredByLine,
      'hide-on-mobile': hideOnMobile,
      'on-menu': isMenu,
    }"
  >
    <span class="powered-by-text">Powered by</span>
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
      class="validator-name"
      :class="{
        active: network.powered.providerAddress && isCurrentNetwork,
        inactive: !network.powered.providerAddress,
      }"
      @click="
        isMenu
          ? $router.push({
              name: 'validator',
              params: {
                networkId: network.slug,
                validator: network.powered.providerAddress,
              },
            })
          : handleClick()
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
    Avatar,
  },
  props: {
    network: {
      type: Object,
      required: true,
    },
    isCurrentNetwork: {
      type: Boolean,
      default: true,
    },
    poweredByLine: {
      type: Boolean,
      default: false,
    },
    hideOnMobile: {
      type: Boolean,
      default: false,
    },
    isMenu: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleClick() {
      this.$emit(`close-menu`)
      window.scrollTo(0, 0)
    },
  },
}
</script>

<style scoped>
.powered-by-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.powered-by-line {
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid var(--menu-border);
}

.powered-by-text {
  color: var(--bright);
  font-size: 12px;
}

.powered-by-image {
  width: 1rem;
  border-radius: 100%;
  margin: 0 0.5rem;
}

.validator-name {
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  color: var(--bright);
}

.inactive {
  cursor: default;
}

.on-menu .validator-name,
.on-menu .powered-by-text {
  color: var(--menu-text);
}

.on-menu .validator-name:hover {
  color: var(--link-hover);
}

@media screen and (max-width: 640px) {
  .powered-by-container.hide-on-mobile {
    display: none;
  }
}
</style>
