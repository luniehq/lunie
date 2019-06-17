<template>
  <Modal
    v-if="active"
    :close="close"
  >
    <div slot="main">
      <SessionWelcome v-if="session.modals.session.state == 'welcome'" />
      <SessionExplore v-else-if="session.modals.session.state == 'explore'" />
      <SessionSignUp v-else-if="session.modals.session.state == 'sign-up'" />
      <SessionSignIn v-else-if="session.modals.session.state == 'sign-in'" />
      <SessionAccountDelete v-else-if="session.modals.session.state == 'delete'" />
      <SessionHardware v-else-if="session.modals.session.state == 'hardware'" />
      <SessionImport v-else-if="session.modals.session.state == 'import'" />
    </div>
    <ConnectedNetwork />
  </Modal>
</template>

<script>
import { mapGetters } from "vuex"
import Modal from "common/TmModal"
import SessionWelcome from "common/TmSessionWelcome"
import SessionExplore from "common/TmSessionExplore"
import SessionSignUp from "common/TmSessionSignUp"
import SessionSignIn from "common/TmSessionSignIn"
import SessionHardware from "common/TmSessionHardware"
import SessionImport from "common/TmSessionImport"
import SessionAccountDelete from "common/TmSessionAccountDelete"
import ConnectedNetwork from "common/TmConnectedNetwork"

export default {
  name: `tm-session`,
  components: {
    Modal,
    SessionWelcome,
    SessionExplore,
    SessionSignUp,
    SessionSignIn,
    SessionHardware,
    SessionImport,
    SessionAccountDelete,
    ConnectedNetwork
  },
  computed: {
    ...mapGetters([`session`]),
    active() {
      return this.session.modals.session.active
    }
  },
  methods: {
    close() {
      this.$store.commit(`toggleSessionModal`, false)
    }
  }
}
</script>
<style>
@import "../../styles/session.css";
</style>
