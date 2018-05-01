<template lang="pug">
page(title="My Profile")
  div(slot="menu"): tool-bar

  part(title='My Profile')
    list-item(dt="Account Name" :dd="user.account")
    list-item(dt="Address" :dd="user.address")
    list-item(dt="Remote error tracking")
      div(slot="dd"): .ni-field-checkbox: .ni-field-checkbox-input
        input#toggle-error-reports(
          type="checkbox"
          :checked="user.errorCollection || undefined"
          @change="setErrorCollection")
    list-item(dt="Light theme")
      div(slot="dd"): .ni-field-checkbox: .ni-field-checkbox-input
        input#toggle-light-theme(
          type="checkbox"
          :checked="themes.active === 'light'"
          @change="setAppTheme")
    list-item(dt="Onboarding tutorial")
      div(slot="dd"): .ni-field-checkbox: .ni-field-checkbox-input
        input#toggle-onboarding(
          type="checkbox"
          :checked="onboarding.active"
          @change="setOnboarding")

  .ni-session-footer
    btn(icon='exit_to_app' type='button' @click.native="signOut" value='Sign Out')
</template>

<script>
import { mapGetters } from "vuex"
import Btn from "@nylira/vue-button"
import ListItem from "common/NiListItem"
import ToolBar from "common/NiToolBar"
import Page from "common/NiPage"
import Part from "common/NiPart"
export default {
  name: "page-profile",
  components: {
    Btn,
    ListItem,
    Page,
    Part,
    ToolBar
  },
  computed: { ...mapGetters(["user", "themes", "onboarding"]) },
  methods: {
    signOut() {
      this.$store.dispatch("signOut")
      this.$store.commit("notifySignOut")
    },
    setAppTheme() {
      if (this.themes.active === "dark") {
        this.$store.commit("setTheme", "light")
      } else {
        this.$store.commit("setTheme", "dark")
      }
    },
    setErrorCollection() {
      this.$store.dispatch("setErrorCollection", {
        account: this.user.account,
        optin: !this.user.errorCollection
      })
    },
    setOnboarding(value) {
      this.$store.commit("setOnboardingState", 0)
      this.$store.commit("setOnboardingActive", true)
    }
  }
}
</script>
