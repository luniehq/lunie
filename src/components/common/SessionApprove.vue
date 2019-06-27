<template>
  <div class="approve-tran" hide-header>
    <h2>Approve Transaction</h2>
    <div>
      <p>Verify the transaction details below.</p>
    </div>
    <TmFormGroup field-id="to" field-label="Your address">
      <LiAnyTransaction
        v-if="tx"
        :validators="deligates"
        :transaction="tx"
        :hide-meta-data="true"
        validators-url="/"
        proposals-url="/"
        bonding-denom="Atoms"
      />

      <!-- Going to take some more logic based on how transactions are passed in -->
      <div>
        From
        <Bech32 :address="senderAddress" />
      </div>

      <TableInvoice
        :amount="12"
        :gas-estimate="Number(tx.gas_wanted)"
        :gas-price="0.000004"
      />

      <div class="approve-tran-footer">
        <TmBtn
          value="Reject"
          class="left-button"
          color="secondary"
          @click="reject"
        />
        <TmBtn
          value="Approve"
          class="right-button"
          color="primary"
          @click="approve"
        />
      </div>
    </TmFormGroup>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import LiAnyTransaction from "transactions/LiAnyTransaction"
import TableInvoice from "src/ActionModal/components/TableInvoice"
import Bech32 from "common/Bech32"

// Parse StdTx from signMessage to display tx properly
function getStdTx(signMessage) {
  const { msgs, fee, memo } = JSON.parse(signMessage)

  return {
    tx: {
      type: "auth/StdTx",
      value: {
        msg: msgs,
        fee,
        memo
      }
    }
  }
}

export default {
  name: `session-ext-approve-tran`,
  components: {
    TmBtn,
    TmFormGroup,
    LiAnyTransaction,
    TableInvoice,
    Bech32
  },
  data: () => ({
    deligates: []
  }),
  computed: {
    ...mapGetters(["signRequest"]),
    tx() {
      console.log(
        getStdTx(this.signRequest.signMessage),
        this.signRequest.signMessage
      )
      return this.signRequest ? getStdTx(this.signRequest.signMessage) : null
    },
    senderAddress() {
      return this.signRequest ? this.signRequest.senderAddress : null
    }
  },
  methods: {
    setState(value) {
      this.$emit(`route-change`, value)
    },
    close() {
      this.$emit(`close`)
    },
    approve() {
      this.$store.dispatch("approveSignRequest")
    },
    reject() {
      this.$store.dispatch("rejectSignRequest")
    }
  }
}
</script>

<style scoped>
.approve-tran {
  padding: 2rem;
  background: var(--fg);
  border-left: 1px solid var(--bc-dim);
}

.approve-tran h2 {
  color: var(--bright);
  font-size: var(--h1);
  font-weight: 500;
  line-height: 3rem;
}

.card {
  background: var(--app-nav);
  border-radius: 2px;
  padding: 1rem;
  font-size: var(--m);
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc);
}

.card h3 {
  font-size: 14px;
  font-weight: 400;
}

.content-left {
  display: flex;
  flex-direction: column;
}

.approve-tran-footer {
  display: flex;
  justify-content: space-around;
  padding: 1.5rem 0 1rem;

  /* keeps button in bottom right no matter the size of the action modal */
  flex-grow: 1;
  align-self: flex-end;
}
</style>
