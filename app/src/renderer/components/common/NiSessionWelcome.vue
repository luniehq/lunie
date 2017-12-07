<template lang="pug">
.ni-session: .ni-session-container
  .ni-session-header
    .ni-session-title Welcome to Cosmos!
  .ni-session-main
    list-item(
      @click.native="setState('sign-up')"
      icon="create"
      title="Create new account")
    list-item(
      @click.native="setState('sign-in')"
      icon="short_text"
      title="Sign in with seed")
    list-item(
      v-if="config.devMode"
      @click.native="setState('hardware')"
      icon="usb"
      title="Sign in with hardware")
  .ni-session-footer
</template>

<script>
import {mapGetters} from 'vuex'
import ListItem from 'common/NiListItem'
export default {
  name: 'ni-session-welcome',
  components: {
    ListItem
  },
  computed: {
    ...mapGetters(['config'])
  },
  methods: {
    setState (value) { this.$store.commit('setModalSessionState', value) }
  }
}
</script>
