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
          <!-- on mobile -->
          <TmBtn
            class="session-close"
            value="Back to Lunie"
            color="secondary"
            @click.native="$router.push(`/`)"
          />
        </div>
      </div>
      <!-- on desktop -->
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
  methods: {
    goBack() {
      this.$router.go(`-1`)
    }
  }
}
</script>

<style>
@import "../../styles/session.css";
</style>
