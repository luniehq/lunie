<template>
  <Modal v-if="active" :close="close">
    <div slot="main">
      <SessionRouter @close="close" />
    </div>
    <ConnectedNetwork />
  </Modal>
</template>

<script>
import { mapGetters } from "vuex"
import Modal from "common/TmModal"
import SessionRouter from "common/SessionRouter"
import ConnectedNetwork from "common/TmConnectedNetwork"

export default {
  name: `modal-session`,
  components: {
    Modal,
    SessionRouter,
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
