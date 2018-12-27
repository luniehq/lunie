<template>
  <tm-page data-title="Preferences"
    ><template slot="menu-body">
      <tm-balance />
      <tool-bar />
    </template>
    <tm-part title="Settings">
      <tm-list-item type="field" title="Select network to connect to">
        <tm-field
          id="select-network"
          v-model="networkSelectActive"
          :options="networkSelectOptions"
          type="select"
          placeholder="Select network..."
          @change.native="setMockedConnector()"
        />
      </tm-list-item>
      <tm-list-item type="field" title="Node IP">
        <tm-btn :value="nodeURL" icon="exit_to_app" type="button" />
      </tm-list-item>
      <tm-list-item type="field" title="View tutorial for Voyager">
        <tm-btn
          id="toggle-onboarding"
          value="Launch Tutorial"
          icon="open_in_new"
          @click.native="setOnboarding()"
        />
      </tm-list-item>
      <tm-list-item
        type="field"
        title="Automatically send usage statistics and crash reports"
        subtitle="to the Voyager development team"
      >
        <tm-field
          :style="{ margin: '1em auto 0 auto' }"
          :options="{
            checked: ' ',
            unchecked: ' '
          }"
          :value="user.errorCollection || undefined"
          type="toggle"
          @change.native="setErrorCollection()"
        />
      </tm-list-item>
    </tm-part>
    <tm-part title="Account">
      <tm-list-item type="field" title="Switch account">
        <tm-btn
          id="signOut-btn"
          icon="exit_to_app"
          type="button"
          value="Sign Out"
          @click.native="signOut()"
        />
      </tm-list-item>
    </tm-part>
  </tm-page>
</template>

<script>
import { mapGetters } from "vuex"
import TmListItem from "common/TmListItem"
import TmBtn from "common/TmBtn"
import TmPage from "common/TmPage"
import TmPart from "common/TmPart"
import TmField from "common/TmField"
import ToolBar from "common/ToolBar"
import TmBalance from "common/TmBalance"
import TmModal from "common/TmModal"

export default {
  name: `page-preferences`,
  components: {
    TmBalance,
    TmBtn,
    TmField,
    TmListItem,
    TmPage,
    TmPart,
    ToolBar,
    TmModal
  },
  data: () => ({
    themeSelectActive: null,
    themeSelectOptions: [
      {
        value: `light`,
        key: `Light`
      },
      {
        value: `dark`,
        key: `Dark`
      }
    ],
    networkSelectActive: null,
    networkSelectOptions: [
      {
        value: `live`,
        key: `Live Testnet`
      },
      {
        value: `mock`,
        key: `Offline Mode`
      }
    ]
  }),
  computed: {
    ...mapGetters([
      `user`,
      `themes`,
      `onboarding`,
      `mockedConnector`,
      `config`,
      `nodeURL`
    ])
  },
  mounted() {
    this.networkSelectActive = this.mockedConnector ? `mock` : `live`
    this.themeSelectActive = this.themes.active
  },
  methods: {
    signOut({ $store } = this) {
      $store.dispatch(`signOut`)
      $store.commit(`notifySignOut`)
    },
    setAppTheme({ $store, themes } = this) {
      if (themes.active === `dark`) {
        $store.commit(`setTheme`, `light`)
      } else {
        $store.commit(`setTheme`, `dark`)
      }
    },
    setErrorCollection({ $store } = this) {
      $store.dispatch(`setErrorCollection`, {
        account: this.user.account,
        optin: !this.user.errorCollection
      })
    },
    setOnboarding({ $store } = this) {
      $store.commit(`setOnboardingState`, 0)
      $store.commit(`setOnboardingActive`, true)
    },

    setMockedConnector({ $store, networkSelectActive } = this) {
      $store.dispatch(`setMockedConnector`, networkSelectActive === `mock`)
    }
  }
}
</script>
<style></style>
