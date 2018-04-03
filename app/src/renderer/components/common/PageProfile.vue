<template lang="pug">
page(title="My Profile")
  div(slot="menu"): tool-bar

  part(title='My Profile')
    list-item(dt="Account Name" :dd="user.account")
    list-item(dt="Address" :dd="user.address")
    .ni-li
      .ni-li-container
        .ni-li-dl
          .ni-li-dt Automatic error reports
          .ni-li-dd
            .ni-field-checkbox
              .ni-field-checkbox-input
                input(type="checkbox" :checked="user.errorCollection || undefined" @change="setErrorCollection")
    .ni-li
      .ni-li-container
        .ni-li-dl
          .ni-li-dt Enable light theme
          .ni-li-dd
            .ni-field-checkbox
              .ni-field-checkbox-input
                input(type="checkbox" :checked="lightTheme" @change="toggleAppTheme")
  .ni-session-footer
    btn(icon='exit_to_app' type='button' @click.native="signOut" value='Sign Out')
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import ListItem from 'common/NiListItem'
import ToolBar from 'common/NiToolBar'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
export default {
  name: 'page-profile',
  components: {
    Btn,
    ListItem,
    Page,
    Part,
    ToolBar
  },
  computed: { ...mapGetters(['user']) },
  data: () => ({
    lightTheme: false
  }),
  methods: {
    signOut () {
      this.$store.dispatch('signOut')
      this.$store.commit('notifySignOut')
    },
    toggleAppTheme () {
      this.lightTheme = !this.lightTheme
      if (this.lightTheme) {
        this.setAppThemeLight()
      } else {
        this.setAppThemeDark()
      }
    },
    setAppThemeLight () {
      this.setCssVar('app-bg', '#fff')
    },
    setAppThemeDark () {
      this.setCssVar('app-bg', '#000')
    },
    setCssVar (key, value) {
      document.documentElement.style.setProperty(`--${key}`, value)
    },
    setErrorCollection () {
      this.$store.dispatch('setErrorCollection', {
        account: this.user.account,
        optin: !this.user.errorCollection
      })
    }
  }
}
</script>
