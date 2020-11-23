<template>
  <div class="session session-approve">
    <h2>Approve Transaction</h2>
    <br />
    <div class="from">
      From
      <Address :address="senderAddress" />
    </div>
    <TmFormGroup v-if="signRequest">
      <TransactionItem
        v-if="tx"
        :key="tx.hash"
        :transaction="tx"
        :validators="validatorsAddressMap"
        :address="senderAddress"
        :show-meta-data="false"
      />
      <!-- Going to take some more logic based on how transactions are passed in -->
      <TableInvoice
        v-if="tx"
        class="approval-table"
        :amount="amount"
        :fee="fees"
        :transaction-denom="invoiceDenom"
      />
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
        <TmFormMsg
          v-if="
            $v.password.$error &&
            !$v.password.passwordCorrect &&
            errorOnApproval === 'Incorrect password'
          "
          name="Password"
          type="custom"
          msg="is incorrect"
        />
        <TmFormMsg
          v-if="errorOnApproval && errorOnApproval !== 'Incorrect password'"
          name=""
          type="custom"
          :msg="errorOnApproval"
        />
      </TmFormGroup>

      <div class="session-approve-footer">
        <TmBtn
          id="reject-btn"
          value="Reject"
          class="left-button"
          type="secondary"
          @click.native="reject"
        />
        <TmBtn
          id="approve-btn"
          value="Approve"
          class="right-button"
          type="primary"
          :loading="isTransactionBroadcasting"
          @click.native="approve"
        />
      </div>
    </TmFormGroup>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import TmBtn from 'common/TmBtn'
import TmFormGroup from 'common/TmFormGroup'
import TmField from 'common/TmField'
import TmFormMsg from 'common/TmFormMsg'
import TransactionItem from 'transactions/TransactionItem'
import TableInvoice from 'src/ActionModal/components/TableInvoice'
import Address from 'common/Address'
import { required } from 'vuelidate/lib/validators'
import hardcodedValidators from '../../validators'
import actions from '../store/actions.js'
import { getDisplayTransaction } from '../scripts/parsers'

const getValidatorsData = actions({}).getValidatorsData

export default {
  name: `session-approve`,
  components: {
    TmBtn,
    TmFormGroup,
    TransactionItem,
    TableInvoice,
    Address,
    TmField,
    TmFormMsg
  },
  data: () => ({
    validators: [],
    password: null,
    isTransactionBroadcasting: false,
    passwordError: false,
    errorOnApproval: null
  }),
  computed: {
    ...mapState([`session`, `accounts`]),
    ...mapGetters(['signRequest', 'networks']),
    tx() {
      if (!this.signRequest) return undefined
      if (this.networks.length === 0) return undefined
      return getDisplayTransaction(
        this.network,
        this.signRequest.messageType,
        this.signRequest.message,
        this.signRequest.transactionData
      )
    },
    network() {
      return this.signRequest
        ? this.networks.find(({ id }) => id === this.signRequest.network)
        : null
    },
    fees() {
      return this.tx && this.tx.fees[0] ? this.tx.fees[0] : {}
    },
    senderAddress() {
      return this.signRequest ? this.signRequest.senderAddress : "null"
    },
    amountCoin() {
      return this.tx ? (this.tx.details.amount || this.tx.details.amounts[0]) : null
    },
    amount() {
      return this.amountCoin ? Number(this.amountCoin.amount) : 0
    },
    invoiceDenom() {
      if (this.amountCoin) {
        return this.amountCoin.denom
      }
      if (this.tx && this.tx.fees[0]) {
        return this.tx.fees.find(({ denom }) => denom).denom
      }
      return ''
    },
    validatorsAddressMap() {
      const names = {}

      this.validators.forEach((item) => {
        names[item.operatorAddress] =
          hardcodedValidators[item.operatorAddress] || item
        names[item.operatorAddress].picture =
          names[item.operatorAddress].picture || this.network.icon
      })
      return names
    }
  },
  watch: {
    password: function () {
      this.passwordError = false
    },
    tx: {
      immediate: true,
      handler: async function (tx) {
        if (tx) {
          const validatorsObject = await getValidatorsData(tx)
          this.validators = validatorsObject
        }
      }
    }
  },
  methods: {
    isValidInput(property) {
      this.$v[property].$touch()

      return !this.$v[property].$invalid
    },
    async approve() {
      this.errorOnApproval = null
      if (this.isValidInput('password')) {
        this.isTransactionBroadcasting = true
        const thisAccount = this.accounts.find(
          ({ address }) => address === this.signRequest.senderAddress
        )
        await this.$store
          .dispatch('approveSignRequest', {
            ...this.signRequest,
            password: this.password,
            HDPath: thisAccount.HDPath || this.network.defaultHDPath,
            curve: thisAccount.curve || this.network.defaultCurve
          })
          .catch((error) => {
            this.errorOnApproval = error
            this.passwordError =
              this.errorOnApproval === 'Incorrect password' ? true : false
            console.error(error)
            return
          })
        this.isTransactionBroadcasting = false
        if (!this.errorOnApproval) {
          this.$router.push(`/success`)
        }
      }
    },
    async reject() {
      await this.$store.dispatch('rejectSignRequest', {
        ...this.signRequest
      })
      window.close()
    }
  },
  validations() {
    return {
      password: {
        required,
        passwordCorrect: () => !this.passwordError
      }
    }
  }
}
</script>

<style scoped>
.session-approve {
  padding: 2rem;
  border-left: 1px solid var(--bc-dim);
  background: var(--app-bg);
  color: var(--bright);
}

.session-approve h2 {
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

.session-approve-footer {
  display: flex;
  justify-content: flex-end;
  padding: 2rem 0 0;

  /* keeps button in bottom right no matter the size of the action modal */
  flex-grow: 1;
}

.from {
  font-size: 14px;
}

.left-button {
  margin-right: 0.5rem;
}

.approval-table .table-invoice {
  padding: 0.5rem 0;
  margin: 1rem 0;
  font-size: 14px;
}
</style>
