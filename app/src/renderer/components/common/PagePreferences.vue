<template>
  <tm-page data-title="Preferences">
    <template slot="menu-body">
      <tm-balance />
      <tool-bar />
    </template>
    <tm-part>
      <tm-list-item type="field" title="Node IP">{{ nodeURL }}</tm-list-item>
      <tm-list-item type="field" title="View tutorial for Voyager">
        <tm-btn
          id="toggle-onboarding"
          value="Launch Tutorial"
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
          :change="() => setErrorCollection()"
          type="toggle"
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
    ]
  }),
  computed: {
    ...mapGetters([`user`, `themes`, `onboarding`, `config`, `nodeURL`])
  },
  mounted() {
    this.themeSelectActive = this.themes.active
  },
  methods: {
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
    }
  }
}
</script>
<style></style>
