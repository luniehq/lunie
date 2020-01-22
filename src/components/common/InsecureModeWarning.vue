<template>
  <div>
    There a number of ways to create an address with Lunie.
    <p
      v-if="
        session.experimentalMode &&
          (connection.network === 'cosmos-hub-mainnet' ||
            connection.network === 'cosmos-hub-testnet')
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
    <ModalTutorial
      v-if="
        showTutorial &&
          session.experimentalMode &&
          (connection.network === 'cosmos-hub-mainnet' ||
            connection.network === 'cosmos-hub-testnet')
      "
      :steps="cosmosKeysTutorial.steps"
      :fullguide="cosmosKeysTutorial.fullguide"
      :background="cosmosKeysTutorial.background"
      :close="hideTutorial"
    />
  </div>
</template>

<script>
import { mapState } from "vuex"
import ModalTutorial from "common/ModalTutorial"

export default {
  name: `insecure-mode-warning`,
  components: {
    ModalTutorial
  },
  data: () => ({
    showTutorial: false,
    cosmosKeysTutorial: {
      fullguide: `http://lunie.io`,
      background: `yellow`,
      steps: [
        {
          title: "How to Manage Your Keys",
          // Each content array item will be enclosed in a span (newline)
          content: [
            "The first rule of cryptocurrency? Secure your keys. The second rule of cryptocurrency? Refer to rule #1. Lunie gives you a backup code that is easy to record and secure. Good security doesn’t need to feel intimidating."
          ]
        },
        {
          title: "The Backup Code",
          content: [
            "If you lose your backup code for your Lunie wallet, or any cryptocurrency wallet, your funds are lost. Forever. Let that settle in. Remember to backup your backup phrase and keys!"
          ]
        },
        {
          title: "Several Copies, Stored Safely",
          content: [
            "Keep a physical copy written down. You should have several copies stored safely in different secure places both physically written on paper and encrypted digitally."
          ]
        },
        {
          title: "The Private Key",
          content: [
            "Never reveal your backup code or private key to anyone under any condition. This key should always remain private."
          ]
        },
        {
          title: "Use a hardware wallet",
          content: [
            "The safest way to store your cryptocurrency is with a hardware wallet. Our browser extension and mobile apps will keep your keys safe, but nothing beats the security of a hardware wallet."
          ]
        },
        {
          title: "Want more?",
          content: [
            "Have more questions about how to secure your keys and funds?"
          ]
        }
      ]
    }
  }),
  computed: {
    ...mapState([`session`, `connection`])
  },
  methods: {
    openTutorial() {
      this.showTutorial = true
    },
    hideTutorial() {
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