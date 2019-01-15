<template>
  <div class="tm-tool-bar">
    <slot />
    <a v-tooltip.bottom="'Help'" class="help" @click="enableModalHelp">
      <i class="material-icons">help_outline</i>
    </a>
    <router-link
      v-if="user.signedIn"
      v-tooltip.bottom="'Preferences'"
      id="settings"
      to="/preferences"
    >
      <i class="material-icons">settings</i>
    </router-link>
    <a
      v-if="user.signedIn"
      v-tooltip.bottom.end="'Sign Out'"
      id="signOut-btn"
      @click="signOut"
    >
      <i class="material-icons">exit_to_app</i>
    </a>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex"
export default {
  name: `tool-bar`,
  computed: { ...mapGetters([`user`]) },
  methods: {
    enableModalHelp() {
      this.$store.commit(`setModalHelp`, true)
    },
    signOut() {
      this.$store.dispatch(`signOut`)
    }
  }
}
</script>
<style>
.tm-page-header-text {
  padding-right: 1rem;
}

.tm-page-header-text i {
  padding: 1rem;
  color: var(--dim);
}

.tm-page-header-text i:hover {
  cursor: pointer;
}

.tm-page-header-text i:hover {
  color: var(--bright);
}
</style>
