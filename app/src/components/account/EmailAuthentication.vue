<template>
  <TmPage data-title="email-authentication" hide-header>
    <div class="card">
      <h1 v-if="account.userSignedIn" class="authentication-title">
        You are now signed in! &#128640;
      </h1>
      <h1 v-else class="authentication-title">
        Good bye, see you soon! &#128075;
      </h1>
    </div>
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"
import { mapState } from "vuex"
export default {
  name: `email-authentication`,
  components: {
    TmPage,
  },
  computed: {
    ...mapState([`account`]),
  },
  mounted() {
    this.$store.dispatch(`signInUser`)
  },
}
</script>
<style scoped>
.card {
  padding: 1rem 1.5rem;
  margin: 1.5rem auto;
}

.authentication-title {
  font-size: 2em;
}
</style>
