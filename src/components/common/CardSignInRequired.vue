<template>
  <TmDataMsg icon="account_box">
    <div slot="title">
      Sign In Required
    </div>
    <div slot="subtitle">
      This page shows data for a specific address. To access the page, please
      <a @click="goToSession">sign&nbsp;in</a>.
    </div>
  </TmDataMsg>
</template>

<script>
import TmDataMsg from "common/TmDataMsg"
export default {
  name: `card-sign-in-required`,
  components: { TmDataMsg },
  methods: {
    goToSession() {
      this.$router.push(`welcome`)
    }
  }
}
</script>
<style scoped>
a {
  cursor: pointer;
}
</style>
