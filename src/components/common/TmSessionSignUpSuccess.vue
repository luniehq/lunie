<template>
  <SessionFrame :hide-back="true">
    <h2 class="session-title">
      Success!
    </h2>
    <div class="session-main">
      <p>
        Your account has been created
      </p>
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
  name: `session-sign-up`,
  components: {
    TmBtn,
    SessionFrame
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
