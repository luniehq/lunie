<template>
  <SessionFrame :hide-back="true">
    <h2 class="session-title">
      Success!
    </h2>
    <div class="session-main">
      <p>Your account has been created</p>
    </div>
    <div class="session-footer">
      <TmBtn value="Back to Lunie" @click.native="$router.push('/')" />
    </div>
  </SessionFrame>
</template>

<script>
import TmBtn from "common/TmBtn"
import SessionFrame from "common/SessionFrame"

export default {
  name: `session-session-success`,
  components: {
    TmBtn,
    SessionFrame
  },
  created() {
    this.$store.commit("recoverReset")
  }
}
</script>

<style scoped>
p {
  margin: 1rem auto;
}
</style>
