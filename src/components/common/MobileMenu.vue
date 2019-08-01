<template>
  <div>
    <v-app-bar dark>
      <v-icon v-if="signedIn">account_circle</v-icon>
      <v-toolbar-title v-if="signedIn">{{ totalTokens | atoms | shortDecimals }} {{ bondDenom | viewDenom }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn v-if="signedIn" icon @click.native="signOut">
        <v-icon>power_settings_new</v-icon>
      </v-btn>
      <v-btn v-else icon @click.native="signIn">
        <v-icon>power_settings_new</v-icon>
      </v-btn>
    </v-app-bar>
    <v-footer :padless="true" :fixed="true" dark>
      <v-card flat tile width="100%" class="text-center">
        <v-card-text>
          <v-btn
            v-for="link in links"
            :key="link.icon"
            icon
            exact
            small
            link
            :to="link.route"
          >
            <v-icon size="24px">{{ link.icon }}</v-icon>
            <!-- <span>{{ link.title }}</span> -->
          </v-btn>
        </v-card-text>
      </v-card>
    </v-footer>
  </div>
</template>

<script>
import { atoms, viewDenom, shortDecimals } from "scripts/num.js"
export default {
  name: `mobile-menu`,
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
.v-footer,
.v-card {
  background: var(--app-nav);
  text-align: center;
}

.v-card__text {
  padding: 0.5rem;
}

.v-btn:not(:last-child) {
  margin-right: 1.5rem;
}

.v-toolbar {
  background: var(--app-nav);
}

.v-toolbar__title {
    margin-left: 1rem;
}

.v-footer .theme--dark.v-btn--active {
  color: var(--link);
}
</style>
