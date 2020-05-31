<template>
  <div>
    <p>There are a number of ways to create an address with Lunie.</p>
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

    <ModalTutorial
      v-if="
        showTutorial &&
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
    ModalTutorial,
  },
  data: () => ({
    showTutorial: false,
    cosmosKeysTutorial: {
      fullguide: `https://lunie.io/guides/how-to-manage-your-keys/`,
      background: `yellow`,
      steps: [
        {
          title: "Managing your keys",
          // Each content array item will be enclosed in a span (newline)
          content: [
            "When you create an address, we're also creating a public and private key-pair for you in the background. Your address can be public but your backup code should remain private.",
          ],
        },
        {
          title: "The backup code",
          content: [
            "The backup code (aka. seed phrase) needs to be treated with great care. Using your backup key, it's possible to determine your private key and access your tokens.",
          ],
        },
        {
          title: "Several copies, stored safely",
          content: [
            "Keep a physical copy of your backup code written down somewhere. We'd recommend storing it in different places both physically on paper and encrypted digitally.",
          ],
        },
        {
          title: "The 'private' key",
          content: [
            "Never reveal your backup code or private key to anyone. This backup code should always remain private.",
          ],
        },
        {
          title: "Use a hardware wallet",
          content: [
            "Our browser extension and mobile apps will keep your keys safe, but nothing has the same guarantees as a hardware wallet.",
          ],
        },
        {
          title: "Have more questions?",
          content: [
            "Check out our full guide for an in depth explanation of how to manage your keys!",
          ],
        },
      ],
    },
  }),
  computed: {
    ...mapState([`connection`]),
  },
  methods: {
    openTutorial() {
      this.showTutorial = true
    },
    hideTutorial() {
      this.showTutorial = false
    },
  },
}
</script>
<style scoped>
ul {
  margin: 0 0 2rem 2rem;
  list-style-type: circle;
}
</style>
