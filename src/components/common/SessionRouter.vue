<template>
  <div>
    <component
      :is="currentSessionComponent"
      @route-change="goTo"
      @close="close"
    ></component>
  </div>
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
.session {
  background: var(--app-bg);
  width: 40rem;
  border-radius: 2px;
  padding: 2rem;
  position: relative;
  border: 2px solid var(--bc-dim);
}

.session-header {
  padding: 1rem 1rem 0;
}

.session-main {
  padding: 0 1rem;
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

.session-image {
  height: 6rem;
  padding-left: 1rem;
  margin: 0 auto 1rem;
}

.session-list {
  padding: 1rem 0;
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
  padding: 2rem 1rem 0;
  align-items: center;
  justify-content: flex-end;
}

.footnote {
  padding: 1rem 1rem 0;
  font-size: var(--sm);
}
</style>
