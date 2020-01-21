<template>
  <TmPage :sign-in-required="true" :managed="true">
    <template slot="managed-body">
      <DelegationsOverview />
      <Undelegations />
      <ModalTutorial
        v-if="showTutorial && session.experimentalMode"
        :steps="cosmosGovernance.steps"
        :fullguide="cosmosGovernance.fullguide"
        :background="cosmosGovernance.background"
        :close="closeTutorial"
      />
    </template>
  </TmPage>
</template>

<script>
import { mapState } from "vuex"
import TmPage from "common/TmPage"
import DelegationsOverview from "staking/DelegationsOverview"
import Undelegations from "staking/Undelegations"
import ModalTutorial from "common/ModalTutorial"

export default {
  name: `page-portfolio`,
  components: {
    TmPage,
    Undelegations,
    DelegationsOverview,
    ModalTutorial
  },
  data: () => ({
    showTutorial: true,
    cosmosGovernance: {
      fullguide: `http://lunie.io`,
      background: `lightblue`,
      steps: [
        {
          title: "How Cosmos Governance Works",
          // Each content array item will be enclosed in a span (newline)
          content: [
            "If you are staking your ATOM on Cosmos, you should also consider participating in it’s on-chain governance. Here we’ll show you how to explore some of the unique governance features that Lunie gives you access to:"
          ]
        },
        {
          title: " Do you have something at stake?",
          content: [
            "If you have tokens staked on this network, you’re eligible to participate in the network’s governance system. If you don’t have tokens yet, click here [link to staking guide]."
          ]
        },
        {
          title: "Proposals",
          content: [
            "In the Proposals view you will see all past and present proposals as well as the “Create Proposal” button to create your own. If you believe in this network and what it stands for, you should participate!!"
          ]
        },
        {
          title: "Deposit Period",
          content: [
            "If a proposal is in the “Deposit Period” you will be able to contribute ATOM to the proposal if you wish to see it move to a voting stage."
          ]
        },
        {
          title: "Vote!",
          content: [
            "If a proposal is in the voting stage you can vote on whether you support it or not."
          ]
        }
      ]
    },
    cosmosStaking: {
      fullguide: `http://lunie.io`,
      background: `blue`,
      steps: [
        {
          title: "Staking tokens",
          // Each content array item will be enclosed in a span (newline)
          content: [
            "Do you have some tokens in your Lunie wallet? Yes? Great! If not, see here (link to get tokens guide)"
          ]
        },
        {
          title: "The Validator list",
          content: [
            "Click the Validators view to browse all active and available validators sorted by expected rewards and voting power."
          ]
        },
        {
          title: "How much will you stake?",
          content: [
            "Choose how much you want to stake with a specific validator based on their fees and validating history. Once you stake, your tokens will be locked up for 21 days, but you can always unstake or restake at a later date."
          ]
        },
        {
          title: "Claim your rewards",
          content: [
            "Everyone is rewarded for putting something at stake but periodically you’ll have to claim your rewards. Look for the “Claim Rewards” button on your portfolio page."
          ]
        },
        {
          title: "Want more?",
          content: ["Learn more about the in’s and out’s of staking on Cosmos."]
        }
      ]
    },
    cosmosTokens: {
      fullguide: `http://lunie.io`,
      background: `red`,
      steps: [
        {
          title: "How To Get Tokens",
          // Each content array item will be enclosed in a span (newline)
          content: [
            "Are you ready to get started staking with Lunie? Time to get some tokens. Let’s go:"
          ]
        },
        {
          title: "Create your address",
          content: [
            "You can receive, store and stake tokens with Lunie using the browser extension wallet, the mobile wallet or Ledger Nano S hardware wallet."
          ]
        },
        {
          title: "Back it up!",
          content: [
            "Seriously, make sure you have recorded your backup code in a secure place. Create several digital and physical copies of it and keep it safe. Don’t show it to anyone!"
          ]
        },
        {
          title: "Purchase some tokens",
          content: [
            "Find a reputable exchange to purchase tokens from, like Coinbase or Binance, based on your geography and jurisdiction."
          ]
        },
        {
          title: "Send to your Lunie address",
          content: [
            "The address will be formatted like this: cosmos1y4xpks58v3439zfs9nsgep9n2ykk3z9qlge6c5"
          ]
        },
        {
          title: "Want more?",
          content: [
            "Once your Lunie balance reflects what you expect you are ready to begin staking and participating in governance!"
          ]
        }
      ]
    },
    manageYourKeys: {
      fullguide: `http://lunie.io`,
      background: `yellow`,
      steps: [
        {
          title: "How to Manage Your Keys",
          // Each content array item will be enclosed in a span (newline)
          content: [
            "The first rule of cryptocurrency? Secure your keys. The second rule of cryptocurrency? Refer to rule #1. Lunie gives you a backup code that is easy to record and secure. Good security doesn’t need to feel intimidating:"
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
            "The safest way to store your cryptocurrency is with a hardware wallet. Our [browser extension] and [mobile] [apps] will keep your keys safe, but nothing beats the security of a [hardware wallet]."
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
    ...mapState([`session`])
  },
  methods: {
    closeTutorial() {
      /* istanbul ignore next */
      this.showTutorial = false
    }
  }
}
</script>
