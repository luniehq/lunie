<template>
  <div class="tool-bar">
    <a
      v-if="!!refresh"
      v-tooltip.bottom="'Refresh'"
      :disabled="!refresh.connected"
      class="refresh-button"
      @click="refresh.connected && refresh.refresh()"
    >
      <i class="material-icons">refresh</i>
    </a>
    <a v-tooltip.bottom="'Help'" class="help" @click="enableModalHelp">
      <i class="material-icons">help_outline</i>
    </a>
    <slot />
    <router-link
      v-if="session.signedIn"
      id="settings"
      v-tooltip.bottom="'Preferences'"
      to="/preferences"
    >
      <i class="material-icons">settings</i>
    </router-link>
    <a
      v-if="session.signedIn"
      id="signOut-btn"
      v-tooltip.bottom.end="'Sign Out'"
      @click="signOut()"
    >
      <i class="material-icons">exit_to_app</i>
    </a>
    <tm-btn
      v-if="!session.signedIn"
      id="signIn-btn"
      value="Sign In"
      color="primary"
      @click.native="signIn()"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TmBtn from "common/TmBtn"
export default {
  name: `tool-bar`,
  components: { TmBtn },
  computed: {
    ...mapGetters([`session`])
  },
  methods: {
    enableModalHelp() {
      this.$store.commit(`setModalHelp`, true)
    },
    signIn() {
      this.$store.commit(`setSessionModalView`, `welcome`)
      this.$store.commit(`toggleSessionModal`, true)
    },
    signOut() {
      this.$store.dispatch(`signOut`)
      this.$router.push(`/`)
    }
  }
}
</script>
<style>
.tm-page-header-text {
  padding-right: 1rem;
}

.tool-bar {
  display: flex;
  align-items: center;
  height: fit-content;
}

.tool-bar a {
  padding: 0 0.5rem;
  color: var(--dim);
  display: flex;
  align-items: center;
}

.tool-bar a:hover {
  cursor: pointer;
  color: var(--bright);
}
</style>
