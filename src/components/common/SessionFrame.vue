<template>
  <transition name="component-fade" mode="out-in">
    <div class="session-frame">
      <router-link to="/">
        <img class="session-logo" src="~assets/images/lunie-logo-white.svg" />
      </router-link>
      <div class="session-outer-container">
        <div class="session">
          <a v-if="!hideBack" @click="goBack">
            <i class="material-icons circle back">arrow_back</i>
          </a>
          <slot></slot>
        </div>
      </div>
      <div v-if="desktop" class="session-close">
        <TmBtn
          value="Back to Lunie"
          color="secondary"
          @click.native="$router.push(`/`)"
        />
      </div>
      <div v-else class="session-close user-box">
        <a @click="goBack">
          <i class="material-icons">close</i>
        </a>
      </div>
    </div>
  </transition>
</template>

<script>
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
  data: () => ({
    desktop: false
  }),
  mounted() {
    this.watchWindowSize()
    window.onresize = this.watchWindowSize
  },
  updated() {
    this.watchWindowSize()
    window.onresize = this.watchWindowSize
  },
  methods: {
    goBack() {
      this.$router.go(`-1`)
    },
    watchWindowSize() {
      const w = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      )

      if (w >= 1024) {
        this.desktop = true
        return
      } else {
        this.desktop = false
      }
    }
  }
}
</script>

<style>
@import "../../styles/session.css";
</style>
