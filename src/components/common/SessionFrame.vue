<template>
  <transition name="component-fade" mode="out-in">
    <div class="session-frame">
      <router-link to="/">
        <img class="session-logo" src="~assets/images/lunie-logo-white.svg" />
      </router-link>
      <div class="session-outer-container">
        <div class="session">
          <a v-if="!hideBack" @click="goBack">
            <i class="material-icons notranslate circle back">arrow_back</i>
          </a>
          <slot></slot>
        </div>
      </div>
      <div class="session-close">
        <TmBtn
          class="session-close-button"
          value="Back to Lunie"
          color="secondary"
          @click.native="goToPortfolio()"
        />
        <a class="user-box" @click="goToPortfolio()">
          <i class="material-icons notranslate">close</i>
        </a>
      </div>
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
  props: {
    hideBack: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters([`networkSlug`])
  },
  methods: {
    goBack() {
      this.$router.go(`-1`)
    },
    goToPortfolio() {
      this.$router.push({
        name: "portfolio",
        params: {
          networkId: this.networkSlug
        }
      })
    }
  }
}
</script>

<style>
@import "../../styles/session.css";
</style>
