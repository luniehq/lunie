<template>
  <SessionFrame :hide-back="true">
    <h2 class="session-title">
      Success!
    </h2>
    <div class="session-main">
      <Steps
        :steps="[`Create`, `Password`, `Seed`, `Success`]"
        active-step="Success"
      />
      <p>Your account has been created</p>
    </div>
    <div class="session-footer">
      <TmBtn value="Back to Lunie" @click.native="$router.push('/')" />
    </div>
  </SessionFrame>
</template>

<script>
import { mapState } from "vuex"
import TmBtn from "common/TmBtn"
import SessionFrame from "common/SessionFrame"
import Steps from "../../ActionModal/components/Steps"

export default {
  name: `session-sign-up`,
  components: {
    TmBtn,
    SessionFrame,
    Steps
  },
  computed: {
    ...mapState([`signup`])
  },
  mounted() {
    this.$store.dispatch(`resetSignUpData`)
  }
}
</script>

<style scoped>
p {
  margin: 1rem auto;
}
</style>
