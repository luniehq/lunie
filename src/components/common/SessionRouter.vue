<template>
  <transition name="component-fade" mode="out-in">
    <component
      :is="currentSessionComponent"
      @route-change="goTo"
      @close="close"
    ></component>
  </transition>
</template>

<script>
import SessionWelcome from "common/TmSessionWelcome"
import SessionExisting from "common/TmSessionExisting"
import SessionExplore from "common/TmSessionExplore"
import SessionSignUp from "common/TmSessionSignUp"
import SessionSignIn from "common/TmSessionSignIn"
import SessionHardware from "common/TmSessionHardware"
import SessionExtension from "common/TmSessionExtension"
import SessionImport from "common/TmSessionImport"
import SessionAccountDelete from "common/TmSessionAccountDelete"
import SessionApprove from "common/SessionApprove"
import SessionBackupCodes from "common/SessionBackupCodes"
import SessionAccounts from "common/SessionAccounts"

export default {
  name: `session-router`,
  components: {
    SessionWelcome,
    SessionExisting,
    SessionExplore,
    SessionSignUp,
    SessionSignIn,
    SessionHardware,
    SessionExtension,
    SessionImport,
    SessionAccountDelete,
    SessionApprove,
    SessionBackupCodes,
    SessionAccounts
  },
  data: () => ({
    view: "welcome"
  }),
  computed: {
    currentSessionComponent: function() {
      // Refers to the name property of the component.
      return "session-" + this.view.toLowerCase()
    }
  },
  methods: {
    goTo(view) {
      console.log("view change", view)
      this.view = view
    },
    close() {
      this.$emit("close")
    }
  }
}
</script>
<style>
@import "../../styles/session.css";

.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.2s ease;
}

.component-fade-enter,
.component-fade-leave-to
/* .component-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
