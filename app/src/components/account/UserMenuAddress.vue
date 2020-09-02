<template>
  <div v-if="address" class="address">
    <Address
      class="menu-address"
      :address="address || ''"
      tooltip-text="Your Address"
      :address-type="
        ['stash', 'controller'].includes(session.addressRole)
          ? capitalizeFirstLetter(session.addressRole)
          : undefined
      "
    />
    <div
      v-if="!session.isMobile && session.sessionType === 'ledger'"
      class="show-on-ledger-container"
    >
      <a class="show-on-ledger" @click="showAddressOnLedger()"
        >Show on Ledger</a
      >
    </div>
    <TmFormMsg
      v-if="ledgerAddressError"
      :msg="ledgerAddressError"
      type="custom"
    />
  </div>
</template>
<script>
import Address from "common/Address"
import TmFormMsg from "common/TmFormMsg"
import { mapGetters, mapState } from "vuex"
import { showAddressOnLedger } from "scripts/ledger"
import { capitalizeFirstLetter } from "scripts/common"
export default {
  name: `user-menu-address`,
  components: {
    Address,
    TmFormMsg,
  },
  data: () => ({
    ledgerAddressError: undefined,
    showAddressOnLedgerFn: showAddressOnLedger,
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`address`, `currentNetwork`]),
  },
  methods: {
    capitalizeFirstLetter,
    async showAddressOnLedger() {
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout)
        this.messageTimeout = undefined
      }
      this.ledgerAddressError = undefined
      try {
        await this.showAddressOnLedgerFn(this.currentNetwork.id, this.$store)
      } catch (error) {
        this.ledgerAddressError = error.message
        this.messageTimeout = setTimeout(
          () => (this.ledgerAddressError = undefined),
          8000
        )
      }
    },
  },
}
</script>
<style scoped>
.address {
  display: flex;
}

.show-on-ledger-container {
  display: inline-block;
  padding: 6px 10px;
  font-size: 12px;
  min-width: 0;
  background-color: var(--app-fg);
  border-radius: 1rem;
  font-weight: 400;
  width: fit-content;
}
</style>
