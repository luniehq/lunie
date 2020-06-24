<template>
  <transition name="component-fade" mode="out-in">
    <div
      v-focus-last
      class="account-frame"
      tabindex="0"
      @keyup.esc="goToPortfolio()"
      @click.self="goToPortfolio()"
    >
      <div class="account-outer-container">
        <div
          v-if="icon.startsWith(`/img`) || icon.startsWith(`https`)"
          class="icon-circle"
        >
          <img class="icon-image" :src="icon" />
        </div>
        <i v-else class="material-icons notranslate circle modal-icon">{{
          icon
        }}</i>
        <div class="account">
          <div class="account-header">
            <a v-if="!hideBack" @click="goBack">
              <i class="material-icons notranslate back">arrow_back</i>
            </a>
            <div v-if="!isExtension" class="account-close">
              <a @click="goToPortfolio()">
                <i class="material-icons notranslate back">close</i>
              </a>
            </div>
          </div>
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import config from "src/../config"
import { mapGetters } from "vuex"

export default {
  name: `account-frame`,
  components: {},
  props: {
    icon: {
      type: String,
      default: `verified_user`,
    },
    hideBack: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    isExtension: config.isExtension,
  }),
  computed: {
    ...mapGetters([`networkSlug`]),
  },
  methods: {
    goBack() {
      this.$router.go(`-1`)
    },
    goToPortfolio() {
      this.$router.push({
        name: "portfolio",
        params: {
          networkId: this.networkSlug,
        },
      })
    },
  },
}
</script>

<style>
@import "../../styles/account.css";

.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.2s ease;
}

.component-fade-enter,
.component-fade-leave-to .component-fade-leave-active {
  opacity: 0;
}

.account {
  max-width: 12rem;
}

.account-subtitle {
  font-size: 1.25rem;
  margin: 0 2rem 0 2rem;
}

.icon-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--app-fg);
  color: var(--dim);
  border-radius: 50%;
  padding: 2.5rem;
  position: absolute;
  top: 0.6rem;
  left: 40%;
  z-index: 1;
  width: 4rem;
  height: 4rem;
}

.icon-image {
  width: 2rem;
  height: 2rem;
  transform: scaleX(-1);
  filter: invert(85%) sepia(9%) saturate(18%) hue-rotate(6deg) brightness(85%)
    contrast(87%); /* converts to same than var(--dim) */
}
</style>
