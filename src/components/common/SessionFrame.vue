<template>
  <transition name="component-fade" mode="out-in">
    <div class="session-modal">
      <router-link to="/">
        <img class="logo" src="~assets/images/cosmos-wallet-logo.svg" />
      </router-link>
      <div class="session-outer-container">
        <slot></slot>
      </div>
      <TmBtn
        class="session-close"
        value="Back to Lunie"
        color="secondary"
        @click.native="$router.push(`/`)"
      />
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex"
import TmBtn from "common/TmBtn"

export default {
  name: `session-frame`,
  components: {
    TmBtn
  },
  computed: {
    ...mapGetters([`session`])
  }
}
</script>

<style>
@import "../../styles/session.css";

.session-modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-modal);
  width: 100vw;
  height: 100vh;
  background: var(--app-nav-light);
  display: flex;
  justify-content: center;
  align-items: center;
}

.session-outer-container {
  position: relative;
  padding: 3rem 0;
}

.logo {
  height: 3rem;
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
}

.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.2s ease;
}

.component-fade-enter,
.component-fade-leave-to .component-fade-leave-active {
  opacity: 0;
}
</style>
