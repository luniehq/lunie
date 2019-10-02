<template>
  <SessionFrame :hide-back="true">
    <h2 class="session-title">
      Success!
    </h2>
    <div class="wrapper">
      <div class="content-main">
        <p>Your account has been created</p>
        <TmBtn value="Back to Lunie" @click.native="$router.push('/')" />
      </div>
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
.wrapper {
  position: relative;
  width: var(--width-main);
  display: flex;
  height: 100%;
  margin: 1rem auto;
}

.content-main {
  display: flex;
  flex-flow: column;
}

p {
  margin: 1rem auto;
}
</style>
