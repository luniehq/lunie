<template>
  <div class="tool-bar">
    <a
      v-if="!!refresh"
      :disabled="!refresh.connected"
      class="refresh-button"
      @click="refresh.connected && refresh.refresh()"
    >
      <i v-tooltip.bottom="'Refresh'" class="material-icons">refresh</i>
    </a>
    <slot />
    <router-link
      v-if="session.signedIn"
      id="settings"
      to="/preferences"
    >
      <i v-tooltip.bottom="'Preferences'" class="material-icons">settings</i>
    </router-link>
    <a
      v-if="session.signedIn"
      id="signOut-btn"
      @click="signOut()"
    >
      <i v-tooltip.bottom.end="'Sign Out'" class="material-icons">exit_to_app</i>
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
  props: {
    refresh: {
      type: Object,
      default: undefined
    }
  },
  computed: {
    ...mapGetters([`session`])
  },
  methods: {
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
.tool-bar {
  display: flex;
  align-items: center;
  height: fit-content;
  padding: 1rem 0 0;
}

.tool-bar a {
  padding: 0 0 0 1.5rem;
  color: var(--dim);
  display: flex;
  align-items: center;
}

.tool-bar a:hover {
  cursor: pointer;
  color: var(--bright);
}
</style>
