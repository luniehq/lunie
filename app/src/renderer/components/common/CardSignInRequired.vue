<template>
  <tm-data-msg icon="account_box">
    <div slot="title">
      Sign In Required
    </div>
    <div slot="subtitle">
      This page shows data for a specific address. To access the page, please
      <a @click="goToSession">sign in</a>.
    </div>
  </tm-data-msg>
</template>

<script>
import TmDataMsg from "common/TmDataMsg"
export default {
  name: `card-sign-in-required`,
  components: { TmDataMsg },
  methods: {
    goToSession() {
      this.$store.commit(`setSessionModalView`, `welcome`)
      this.$store.commit(`toggleSessionModal`, true)
    }
  }
}
</script>
<style scoped>
a {
  cursor: pointer;
}
</style>

