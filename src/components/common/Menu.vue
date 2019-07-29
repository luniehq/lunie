<template>
  <div>
    <DesktopMenu id="desktop-menu" :links="links" />
    <MobileMenu id="mobile-footer-menu" :links="links" />
  </div>
</template>

<script>
import DesktopMenu from "common/DesktopMenu"
import MobileMenu from "common/MobileMenu"

export default {
  name: `main-menu`,
  components: {
    DesktopMenu,
    MobileMenu
  },
  data: () => ({
    links: [
      {
        icon: "account_balance_wallet",
        route: "/staking/my-delegations",
        title: "Portfolio"
      },
      {
        icon: "add_box",
        route: "/staking/validators",
        title: "Validators"
      },
      {
        icon: "swap_horiz",
        route: "/transactions",
        title: "Activity"
      },
      {
        icon: "how_to_vote",
        route: "/governance/proposals",
        title: "Proposals"
      }
    ]
  })
}
</script>

<style scoped></style>
