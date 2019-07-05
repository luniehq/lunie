<template>
  <transition name="component-fade" mode="out-in">
    <div class="session-frame">
      <router-link to="/">
        <img class="session-logo" src="~assets/images/cosmos-wallet-logo.svg" />
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
import TmBtn from "common/TmBtn"

export default {
  name: `session-frame`,
  components: {
    TmBtn
  }
}
</script>

<style>
@import "../../styles/session.css";
</style>
