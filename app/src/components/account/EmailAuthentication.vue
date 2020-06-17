<template>
  <TmPage data-title="authentication" hide-header>
    <TmPart>
      <h2 v-if="user.userSignedIn">You are now authenticated/ logged in!</h2>
      <h2 v-else>Good bye, see you soon!</h2>
    </TmPart>
    <TmBtn value="Sign Out" type="secondary" @click.native="signOut()" />
    <TmPart>
      <label class="field-checkbox-label" for="check-premium">
        <input id="check-premium" v-model="premium" type="checkbox" />
        Premium
      </label>
    </TmPart>
    <TmBtn value="Store User" type="secondary" @click.native="storeUser()" />
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
  data: () => ({
    premium: false,
  }),
  computed: {
    ...mapState([`user`]),
  },
  mounted() {
    this.$store.dispatch(`signInUser`)
  },
  methods: {
    signOut() {
      this.$store.dispatch(`signOutUser`)
    },

    storeUser() {
      this.$store.dispatch(`storeUser`, { premium: this.premium })
    },
  },
}
</script>
