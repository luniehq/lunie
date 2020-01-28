<template>
  <div>
    There a number of ways to create an address with Lunie.
    <p
      v-if="
        connection.network === 'cosmos-hub-mainnet' ||
          connection.network === 'cosmos-hub-testnet'
      "
    >
      We'd recommend starting with our guide:
      <a href="#" @click="openTutorial()">how to manage your&nbsp;keys</a>.
    </p>
    <p>If you're ready to get started, here are your options:</p>
    <ul>
      <li><router-link to="ledger">Ledger Nano</router-link></li>
      <li>
        <a
          href="http://bit.ly/lunie-ext"
          rel="noopener norefferer"
          target="_blank"
        >
          Lunie browser extension</a
        >
      </li>
      <li>
        <a
          href="http://bit.ly/lunie-ios"
          rel="noopener norefferer"
          target="_blank"
          >Lunie iOS</a
        >
      </li>
      <li>
        <a
          href="http://bit.ly/lunie-android"
          rel="noopener norefferer"
          target="_blank"
          >Lunie Android</a
        >
      </li>
    </ul>

    <router-link to="existing">Want to use an existing address?</router-link>
    <AnyTutorial
      v-if="showTutorial"
      :network="connection.network"
      topic="keys"
      @close-tutorial="closeTutorial"
    />
  </div>
</template>

<script>
import { mapState } from "vuex"
import AnyTutorial from "common/AnyTutorial"

export default {
  name: `insecure-mode-warning`,
  components: {
    AnyTutorial
  },
  data: () => ({
    showTutorial: false
  }),
  computed: {
    ...mapState([`connection`])
  },
  methods: {
    openTutorial() {
      this.showTutorial = true
    },
    closeTutorial() {
      this.showTutorial = false
    }
  }
}
</script>
<style scoped>
ul {
  margin: 0 0 2rem 2rem;
  list-style-type: circle;
}
</style>
