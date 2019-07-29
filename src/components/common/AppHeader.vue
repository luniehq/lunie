<template>
  <nav class="app-header" :class="{ mobile: !desktop }">
    <div class="container">
      <div class="header-item">
        <router-link to="/">
          <img
            class="header-item-logo"
            src="~assets/images/cosmos-wallet-logo.svg"
          />
        </router-link>
        <template v-if="!desktop">
          <div v-if="open" class="close-menu" @click="close()">
            <i class="material-icons mobile-menu-action">close</i>
          </div>
          <div v-if="!open" class="open-menu" @click="show()">
            <i class="material-icons mobile-menu-action">menu</i>
          </div>
        </template>
      </div>
      <DesktopMenu id="desktop-menu" />
    </div>
  </nav>
</template>

<script>
import { mapGetters } from "vuex"
import DesktopMenu from "common/DesktopMenu"
export default {
  name: `app-header`,
  components: { DesktopMenu },
  computed: {
    ...mapGetters([`session`])
  }
}
</script>

<style scoped>
.app-header {
  z-index: var(--z-appHeader);
  position: relative;
  background: var(--app-nav);
  min-height: 100vh;
  width: var(--width-side);
}

.mobile-menu-action {
  font-size: 1.5rem !important;
}

.app-header > .container {
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
}

.app-header .header-item {
  padding: 1.25rem;
  font-size: 0;
}

.app-header .header-item a {
  display: inline-block;
}

.header-item-logo {
  height: 3rem;
}

@media screen and (max-width: 1023px) {
  #desktop-menu {
    display: none;
  }

  .app-header {
    width: 100%;
    min-height: 0;
  }

  .container {
    background: var(--app-nav);
  }

  .app-header .header-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    color: var(--link);
    cursor: pointer;
  }

  .header-item-logo {
    height: 2.5rem;
  }
}
</style>
