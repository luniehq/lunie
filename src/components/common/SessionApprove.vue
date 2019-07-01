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

      <!-- <TableInvoice :fees="fees" /> -->

      <TmFormGroup
        :error="$v.password.$error && $v.password.$invalid"
        class="action-modal-group"
        field-id="password"
        field-label="Password"
      >
        <TmField
          id="password"
          v-model="password"
          v-focus
          type="password"
          placeholder="Password"
        />
        <TmFormMsg
          v-if="$v.password.$error && !$v.password.required"
          name="Password"
          type="required"
        />
      </TmFormGroup>

      <div class="approve-tran-footer">
        <TmBtn
          value="Reject"
          class="left-button"
          color="secondary"
          @click.native="reject"
        />
        <TmBtn
          value="Approve"
          class="right-button"
          color="primary"
          @click.native="approve"
        />
      </div>
    </TmFormGroup>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import LiAnyTransaction from "transactions/LiAnyTransaction"
import TableInvoice from "src/ActionModal/components/TableInvoice"
import Bech32 from "common/Bech32"
import { required } from "vuelidate/lib/validators"

// TODO move into own helper file
// Parse into Lunie tx format from signMessage to display tx properly
function parseTx(signMessage) {
  const { msgs, fee, memo, delegates } = JSON.parse(signMessage)

  return {
    tx: {
      type: "auth/StdTx",
      value: {
        msg: msgs,
        fee,
        memo,
        delegates
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
    Bech32,
    TmField,
    TmFormMsg
  },
  data: () => ({
    password: null
  }),
  computed: {
    ...mapGetters(["signRequest"]),
    tx() {
      return this.signRequest ? parseTx(this.signRequest.signMessage) : null
    },
    fees() {
      return this.tx ? this.tx.tx.value.fee.amount : null
    },
    senderAddress() {
      return this.signRequest ? this.signRequest.senderAddress : null
    },
    delegates() {
      return this.tx ? this.tx.tx.value.delegates : null
    }
  },
  methods: {
    setState(value) {
      this.$emit(`route-change`, value)
    },
    close() {
      this.$emit(`close`)
    },
    isValidInput(property) {
      this.$v[property].$touch()

      return !this.$v[property].$invalid
    },
    async approve() {
      if (this.isValidInput("password")) {
        await this.$store.dispatch("approveSignRequest", {
          ...this.signRequest,
          password: this.password
        })
        this.close()
      }
    },
    async reject() {
      await this.$store.dispatch("rejectSignRequest", {
        ...this.signRequest
      })
      this.close()
    }
  },
  validations() {
    return {
      password: {
        required
      }
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
