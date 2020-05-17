<template>
  <TmPage :sign-in-required="true" :managed="true" :dark-background="true">
    <template v-if="!isRestrictedAddressRole" slot="managed-body">
      <DelegationsOverview />
      <Undelegations />
    </template>
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"
import DelegationsOverview from "staking/DelegationsOverview"
import Undelegations from "staking/Undelegations"
import { mapState } from "vuex"

export default {
  name: `page-portfolio`,
  components: {
    TmPage,
    Undelegations,
    DelegationsOverview
  },
  computed: {
    ...mapState([`session`]),
    isRestrictedAddressRole() {
      return this.session.accountRole === "controller"
    }
  }
}
</script>
