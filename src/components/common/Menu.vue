<template>
  <div>
    <DesktopMenu
      id="desktop-menu"
      :total-tokens="totalAtoms"
      :liquid-tokens="liquidAtoms.toString()"
      :links="links"
      :signed-in="session.signedIn"
      :bond-denom="bondDenom"
      @signIn="signIn"
      @signOut="signOut"
    />
    <MobileMenu
      id="mobile-footer-menu"
      :total-tokens="totalAtoms"
      :liquid-tokens="liquidAtoms.toString()"
      :links="links"
      :signed-in="session.signedIn"
      :bond-denom="bondDenom"
      @signIn="signIn"
      @signOut="signOut"
    />
  </div>
</template>

<script>
import DesktopMenu from "common/DesktopMenu"
import MobileMenu from "common/MobileMenu"
import BN from "bignumber.js"
import { calculateTokens } from "scripts/common"
import { mapGetters } from "vuex"

export default {
  name: `main-menu`,
  components: {
    DesktopMenu,
    MobileMenu
  },
  computed: {
    ...mapGetters([
      `session`,
      `totalAtoms`,
      `liquidAtoms`,
      `committedDelegations`,
      `delegates`,
      `delegation`,
      `bondDenom`,
      `wallet`
    ]),
    totalAtoms() {
      return new BN(this.liquidAtoms)
        .plus(this.bondedAtoms)
        .plus(this.unbondingAtoms)
        .toString()
    },
    bondedAtoms() {
      return Object.entries(this.committedDelegations).reduce(
        (total, [delegatorAddress, shares]) => {
          const delegator = this.delegates.delegates.find(
            d => d.operator_address === delegatorAddress
          )
          return total.plus(calculateTokens(delegator, shares))
        },
        BN(0)
      )
    },

    unbondingAtoms() {
      return Object.values(this.delegation.unbondingDelegations).reduce(
        // unbondingDelegations can have several active undelegations per validator (key)
        (atoms, entries) => {
          return BN(atoms).plus(
            entries.reduce((sum, { balance }) => sum.plus(balance), BN(0))
          )
        },
        BN(0)
      )
    }
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
  },
  data: () => ({
    links: [
      {
        icon: "account_balance_wallet",
        route: "/portfolio",
        title: "Portfolio"
      },
      {
        icon: "add_box",
        route: "/validators",
        title: "Validators"
      },
      {
        icon: "swap_horiz",
        route: "/transactions",
        title: "Activity"
      },
      {
        icon: "how_to_vote",
        route: "/proposals",
        title: "Proposals"
      }
    ]
  })
}
</script>
