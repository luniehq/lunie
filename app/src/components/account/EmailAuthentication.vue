<template>
  <TmPage data-title="authentication" hide-header>
    <TmPart>
      <h2 v-if="account.userSignedIn">You are now authenticated/ logged in!</h2>
      <h2 v-else>Good bye, see you soon!</h2>
    </TmPart>
    <TmBtn value="Sign Out" type="secondary" @click.native="signOut()" />
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"
import { mapState } from "vuex"
import TmPart from "common/TmPart"
import TmBtn from "common/TmBtn"
export default {
  name: `email-authentication`,
  components: {
    TmPage,
    TmPart,
    TmBtn,
  },
  computed: {
    ...mapState([`account`]),
  },
  mounted() {
    this.$store.dispatch(`signInUser`)
  },
  methods: {
    signOut() {
      this.$store.dispatch(`signOutUser`)
    },
  },
}
</script>
