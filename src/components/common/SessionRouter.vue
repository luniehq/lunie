<template>
  <SessionWelcome
    v-if="view == 'welcome'"
    @route-change="goTo"
    @close="close"
  />
  <SessionExisting
    v-else-if="view == 'existing'"
    @route-change="goTo"
    @close="close"
  />
  <SessionExplore
    v-else-if="view == 'explore'"
    @route-change="goTo"
    @close="close"
  />
  <SessionSignUp
    v-else-if="view == 'sign-up'"
    @route-change="goTo"
    @close="close"
  />
  <SessionSignIn
    v-else-if="view == 'sign-in'"
    @route-change="goTo"
    @close="close"
  />
  <SessionAccountDelete
    v-else-if="view == 'delete'"
    @route-change="goTo"
    @close="close"
  />
  <SessionHardware
    v-else-if="view == 'hardware'"
    @route-change="goTo"
    @close="close"
  />
  <SessionImport
    v-else-if="view == 'import'"
    @route-change="goTo"
    @close="close"
  />
</template>

<script>
import SessionWelcome from "common/TmSessionWelcome"
import SessionExisting from "common/TmSessionExisting"
import SessionExplore from "common/TmSessionExplore"
import SessionSignUp from "common/TmSessionSignUp"
import SessionSignIn from "common/TmSessionSignIn"
import SessionHardware from "common/TmSessionHardware"
import SessionImport from "common/TmSessionImport"
import SessionAccountDelete from "common/TmSessionAccountDelete"

export default {
  name: `session-router`,
  components: {
    SessionWelcome,
    SessionExisting,
    SessionExplore,
    SessionSignUp,
    SessionSignIn,
    SessionHardware,
    SessionImport,
    SessionAccountDelete
  },
  data: () => ({
    view: "welcome"
  }),
  methods: {
    goTo(view) {
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
  max-width: 40rem;
  border-radius: 2px;
  padding: 2rem;
  position: relative;
  border: 2px solid var(--bc-dim);
  overflow: auto;
  display: flex;
  flex-flow: column;
}

.session-header {
  padding: 1rem 1rem 0;
  display: block;
}

.session-main {
  flex: 1;
  padding: 0 1rem;
}

.session-main p {
  margin-bottom: 1.5rem;
}

.session-title {
  font-size: 38px;
  line-height: 44px;
  color: var(--bright);
  font-weight: 600;
  padding: 1rem 1rem 1.5rem;
}

.session-image {
  height: 6rem;
  padding-left: 1rem;
  margin: 1rem auto;
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
  padding: 2rem 1rem;
  flex-direction: column;
}

.footnote {
  padding: 1rem 1rem 0;
  font-size: var(--sm);
}

@media screen and (max-width: 1023px) {
  .session {
    height: 100vh;
    padding: 1rem;
  }

  .session-header,
  .session-title,
  .session-main,
  .session-footer {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
