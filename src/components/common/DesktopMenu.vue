<template>
  <v-navigation-drawer :expand-on-hover="true" absolute dark>
    <v-list dense nav class="py-0">
      <template v-if="session.signedIn">
        <v-list-item two-line>
          <v-list-item-avatar>
            <v-icon>account_circle</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title
              >{{ totalAtoms | atoms | shortDecimals }}
              {{ bondDenom | viewDenom }}</v-list-item-title
            >
            <v-list-item-subtitle
              >{{ liquidAtoms | atoms | shortDecimals }}
              {{ bondDenom | viewDenom }}</v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
      </template>
      <template v-else>
        <v-list-item link @click.native="signIn">
          <v-list-item-icon>
            <v-icon>power_settings_new</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>Sign In</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>

      <v-divider></v-divider>

      <v-list-item
        v-for="link in links"
        :key="link.title"
        link
        :to="link.route"
      >
        <v-list-item-icon>
          <v-icon>{{ link.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ link.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <template v-if="session.signedIn">
        <v-divider></v-divider>

        <v-list-item link @click.native="signOut">
          <v-list-item-icon>
            <v-icon>power_settings_new</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>Sign Out</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
      <ConnectedNetwork />
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import ConnectedNetwork from "common/TmConnectedNetwork"
import { atoms, viewDenom, shortDecimals } from "scripts/num.js"
import { mapGetters } from "vuex"
export default {
  name: `app-menu`,
  components: {
    ConnectedNetwork
  },
  props: {
    links: {
      type: Array,
      required: true
    }
  },
  computed: {
    ...mapGetters([
      `session`,
      `totalAtoms`,
      `liquidAtoms`,
      `bondDenom`,
      `wallet`
    ])
  },
  filters: {
    atoms,
    viewDenom,
    shortDecimals
  },
  mounted() {
    // this.ps = new PerfectScrollbar(this.$el.querySelector(`.app-menu-main`))
  },
  methods: {
    signOut() {
      this.$emit(`close`)
      this.$store.dispatch(`signOut`)
    },
    signIn() {
      this.$router.push(`/welcome`)
      this.$emit(`close`)
    }
  }
}
</script>
<style scoped>
#desktop-menu {
  width: 80px;
  position: fixed;
  background: var(--app-nav);
  color: var(--bright);
}

.theme--dark.v-list-item--active::before:not(:hover) {
  opacity: 0;
}
</style>
<style>
#desktop-menu:not(:hover) .tm-connected-network__string {
  display: none;
}
</style>
