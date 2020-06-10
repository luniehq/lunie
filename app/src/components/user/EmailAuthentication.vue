<template>
  <TmPage data-title="authentication" hide-header>
    <TmPart>
      <h2>You are now authenticated/ logged in!</h2>
    </TmPart>
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"
import { mapState } from "vuex"
import TmPart from "common/TmPart"
export default {
  name: `email-authentication`,
  components: {
    TmPage,
    TmPart,
  },
  computed: {
    ...mapState([`user`]),
  },
  mounted() {
    if (!this.user.signInError) {
      this.$store.dispatch(`signInUser`, this.user.user)
    }
  },
}
</script>
