<template>
  <div v-if="address" class="address">
    <Address
      class="menu-address"
      :address="address || ''"
      :tooltip-text="addressType"
    />
    <a
      v-if="!session.isMobile && session.sessionType === 'ledger'"
      class="show-on-ledger"
      @click="showAddressOnLedger()"
      >Show on Ledger</a
    >
    <TmFormMsg
      v-if="ledgerAddressError"
      :msg="ledgerAddressError"
      type="custom"
    />
  </div>
</template>
<script>
import Address from "common/Address"
import { mapGetters, mapState } from "vuex"
import { showAddressOnLedger } from "scripts/ledger"
export default {
  name: `user-menu-address`,
  components: {
    Address,
  },
  data: () => ({
    ledgerAddressError: undefined,
    showAddressOnLedgerFn: showAddressOnLedger,
  }),
  computed: {
    ...mapState([`session`, `connection`, `account`]),
    ...mapGetters([`address`, `network`]),
    addressType() {
      if (
        this.session.addressRole &&
        this.session.addressRole !== `stash/controller` &&
        this.session.addressRole !== `none`
      ) {
        return (
          `Your` +
          this.capitalizeFirstLetter(this.session.addressRole) +
          `Address`
        )
      }
      return `Your Address`
    },
  },
  methods: {
    async showAddressOnLedger() {
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout)
        this.messageTimeout = undefined
      }
      this.ledgerAddressError = undefined
      try {
        await this.showAddressOnLedgerFn(this.network, this.$store)
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
