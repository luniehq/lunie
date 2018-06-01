<template lang="pug">
page(title="Preferences")
  div(slot="menu"): tool-bar

  part(title='Settings')
    list-item(type="field" title="Select network to connect to")
      field#select-network(
        type="select"
        v-model="networkSelectActive"
        :options="networkSelectOptions"
        placeholder="Select network..."
        @change.native="setMockedConnector")
    list-item(type="field" title="Select theme")
      field#select-theme(
        type="select"
        v-model="themes.active"
        :options="themeSelectOptions"
        placeholder="Select theme..."
        @change="setAppTheme")
    list-item(type="field" title="View tutorial for Voyager")
      btn#toggle-onboarding(
        @click.native="setOnboarding"
        value="Launch Tutorial"
        icon="open_in_new")
    list-item(type="field"
      title="Automatically send usage statistics and crash reports"
      subtitle="to the Voyager development team")
      field(
        type="toggle"
        :style="{margin:'1em auto 0 auto'}"
        :options=`{
          checked: " ",
          unchecked: " "
          }`
        :value="user.errorCollection || undefined"
        @change.native="setErrorCollection")
  part(title='Account')
    list-item(type="field" title="Switch account")
      btn(
        icon='exit_to_app'
        type='button'
        @click.native="signOut"
        value='Sign Out')
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
  name: "page-preferences",
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
  data: () => ({
    themeSelectOptions: [
      {
        value: "light",
        key: "Light"
      },
      {
        value: "dark",
        key: "Dark"
      }
    ],
    networkSelectActive: "live",
    networkSelectOptions: [
      {
        value: "live",
        key: "Live Testnet"
      },
      {
        value: "mock",
        key: "Mock Testnet"
      }
    ]
  }),
  mounted() {
    this.networkSelectActive = this.mockedConnector ? "mock" : "live"
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
      if (this.networkSelectActive === "mock" && !this.mockedConnector) {
        this.$store.dispatch("setMockedConnector", true)
      } else if (this.networkSelectActive === "live" && this.mockedConnector) {
        this.$store.dispatch("setMockedConnector", false)
      }
    }
  }
}
</script>
