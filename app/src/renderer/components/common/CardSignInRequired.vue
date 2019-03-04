<template>
  <tm-data-msg icon="account_box">
    <div slot="title">
      Sign In Required
    </div>
    <div slot="subtitle">
      This page shows data for your address. To access the page, please <tm-btn
        value="Sign In"
        color="primary"
        @click.native="goToSession"
      />
    </div>
  </tm-data-msg>
</template>

<script>
import TmDataMsg from "common/TmDataMsg"
import TmBtn from "common/TmBtn"
export default {
  name: `card-sign-in-required`,
  components: { TmDataMsg, TmBtn },
  methods: {
    goToSession() {
      this.$store.commit(`setSessionModalView`, `welcome`)
      this.$store.commit(`toggleSessionModal`, true)
    }
  }
}
</script>
