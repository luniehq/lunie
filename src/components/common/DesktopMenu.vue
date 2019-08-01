<template>
  <v-navigation-drawer :expand-on-hover="true" absolute dark>
    <v-list dense nav class="py-0">
      <template v-if="signedIn">
        <v-list-item two-line>
          <v-list-item-avatar>
            <v-icon>account_circle</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title
              >{{ totalTokens | atoms | shortDecimals }}
              {{ bondDenom | viewDenom }}</v-list-item-title
            >
            <v-list-item-subtitle
              >{{ liquidTokens | atoms | shortDecimals }}
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

      <template v-if="signedIn">
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
export default {
  name: `app-menu`,
  components: {
    ConnectedNetwork
  },
  filters: {
    atoms,
    viewDenom,
    shortDecimals
  },
  props: {
    links: {
      type: Array,
      required: true
    },
    totalTokens: {
      type: String,
      required: true
    },
    liquidTokens: {
      type: String,
      required: true
    },
    signedIn: {
      type: Boolean,
      required: true
    },
    bondDenom: {
      type: String,
      required: true
    }
  },
  methods: {
    signOut() {
      this.$emit(`signOut`)
    },
    signIn() {
      this.$emit(`signIn`)
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
