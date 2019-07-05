<template>
  <div>
    <router-view />
  </div>
</template>

<script>
import 'babel-polyfill'

export default {
  async mounted() {
    const signRequest = await this.$store.dispatch('getSignRequest')
    if (signRequest) {
      this.$refs.router.goTo('approve')
    }
  }
}
</script>

<style>
/* TODO use the same styles from lunie overwriting what is necessary */
@import 'app.css';
</style>
