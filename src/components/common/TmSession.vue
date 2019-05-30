<template>
  <Modal v-if="active" :close="close">
    <div slot="main">
      <SessionWelcome v-if="session.modals.session.state == 'welcome'" />
      <SessionExplore v-else-if="session.modals.session.state == 'explore'" />
      <SessionSignUp v-else-if="session.modals.session.state == 'sign-up'" />
      <SessionSignIn v-else-if="session.modals.session.state == 'sign-in'" />
      <SessionAccountDelete
        v-else-if="session.modals.session.state == 'delete'"
      />
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
  name: `session`,
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
.session {
  background: var(--app-bg);
  max-width: 40rem;
  border-radius: 2px;
  padding: 2rem;
  position: relative;
}

.session-header {
  padding: 1rem 0;
}

.session-main p {
  margin-bottom: 1.5rem;
}

.session-title {
  font-size: 38px;
  color: var(--bright);
  font-weight: 600;
  margin-bottom: 1rem;
}

.session-list h3 {
  font-size: var(--h3);
  color: var(--bright);
  font-weight: 500;
  padding: 1rem 1rem 0.5rem;
}

.session-paragraph {
  margin-bottom: 1rem;
}

.material-icons.session-back,
.material-icons.session-close {
  font-size: var(--lg);
  cursor: pointer;
  position: absolute;
  top: 1rem;
}

.session-back {
  left: 1rem;
}

.session-close {
  right: 1rem;
}

.session-footer {
  display: flex;
  justify-content: end;
}
</style>
