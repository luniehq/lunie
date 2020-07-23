<template>
  <div v-if="address" class="address">
    <Address
      class="menu-address"
      :address="address || ''"
      :tooltip-text="addressType"
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
import { capitalize } from "src/filters"
import { mapGetters, mapState } from "vuex"
import { showAddressOnLedger } from "scripts/ledger"

export default {
  name: `user-menu-address`,
  components: {
    Address,
  },
  filters: {
    capitalize,
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
          this.session.addressRole | capitalize +
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
