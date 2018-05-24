<template lang="pug">
page(title="Preferences")
  div(slot="menu"): tool-bar

  part(title='Settings')
    list-item(type="field"
      title="Automatically send usage statistics and crash reports"
      subtitle="to the Voyager development team")
      .ni-field-checkbox: .ni-field-checkbox-input
        input#toggle-error-reports(
          type="checkbox"
          :checked="user.errorCollection || undefined"
          @change="setErrorCollection")
    list-item(type="field" title="Select theme")
      // .ni-field-checkbox: .ni-field-checkbox-input
        input#toggle-light-theme(
          type="checkbox"
          :checked="themes.active === 'light'"
          @change="setAppTheme")
      field#select-light-theme(
        type="select"
        v-model="themes.active"
        :options="themes.options"
        placeholder="Select theme...")
    list-item(type="field" title="View tutorial for Voyager")
      btn#toggle-onboarding(@change="setOnboarding" value="View")
    list-item(type="field" title="Select full node to connect to")
      .ni-field-checkbox: .ni-field-checkbox-input
        input#toggle-mocked-connector(
          type="checkbox"
          :checked="mockedConnector"
          @change="setMockedConnector")

  part(title='Account')
    list-item(type="field" title="Switch Account")
      btn(icon='exit_to_app' type='button' @click.native="signOut" value='Sign Out')
</template>

<script>
import { mapGetters } from "vuex"
import Btn from "@nylira/vue-button"
import Field from "@nylira/vue-field"
import ListItem from "common/NiListItem"
import ToolBar from "common/NiToolBar"
import Page from "common/NiPage"
import Part from "common/NiPart"
export default {
  name: "page-profile",
  components: {
    Btn,
    Field,
    ListItem,
    Page,
    Part,
    ToolBar
  },
  computed: {
    ...mapGetters(["user", "themes", "onboarding", "mockedConnector"])
  },
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
    setOnboarding() {
      this.$store.commit("setOnboardingState", 0)
      this.$store.commit("setOnboardingActive", true)
    },
    setMockedConnector() {
      this.$store.dispatch("setMockedConnector", !this.mockedConnector)
    }
  }
}
</script>
<style lang="stylus">
.sign-out-container
  padding 0 1rem
</style>
