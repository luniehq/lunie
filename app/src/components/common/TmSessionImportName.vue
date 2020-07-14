<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit">
      <h2 class="session-title">
        Choose name
      </h2>
      <div class="session-main bottom-indent">
        <Steps :steps="[`Recover`, `Name`, `Password`]" active-step="Name" />
        <TmFormGroup field-id="import-name" field-label="Your Address">
          <span v-if="networkCryptoTypes.length > 1" class="algo"
            >created using {{ currentCrypto }}</span
          >
          <img
            v-if="importedAddress === undefined"
            class="tm-data-msg__icon"
            src="~assets/images/loader.svg"
            alt="a small spinning circle to display loading"
          />
          <div v-else>
            <p class="address">{{ importedAddress }}</p>
            <!-- only show the retry option if the networks supports more than one algo -->
            <span
              v-if="networkCryptoTypes.length > 1"
              class="retry-link"
              @click="created(true)"
              >Not your address?</span
            >
          </div>
        </TmFormGroup>
        <TmFormGroup
          :error="$v.$error && $v.name.$invalid"
          field-id="import-name"
          field-label="Account Name"
        >
          <TmField
            id="import-name"
            v-model.trim="name"
            type="text"
            placeholder="Must have at least 3 characters"
            vue-focus="vue-focus"
          />
          <TmFormMsg
            v-if="$v.name.$error && !$v.name.required"
            name="Name"
            type="required"
          />
          <TmFormMsg
            v-if="$v.name.$error && !$v.name.minLength"
            name="Name"
            type="minLength"
            min="3"
          />
          <TmFormMsg
            v-if="$v.name.$error && !$v.name.nameExists"
            name="Name"
            type="custom"
            msg="already exists"
          />
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn value="Next" type="submit" />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import { required, minLength } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import SessionFrame from "common/SessionFrame"
import { mapGetters } from "vuex"
import Steps from "../../ActionModal/components/Steps"
import { getWalletIndex } from "@lunie/cosmos-keys"

const nameExists = (value) => {
  const walletIndex = getWalletIndex()
  if (walletIndex.some((e) => e.name === value)) {
    return false
  } else {
    return true
  }
}

export default {
  name: `session-import-name`,
  components: {
    TmBtn,
    TmField,
    SessionFrame,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct,
    Steps,
  },
  data: () => ({
    importedAddress: undefined,
    attempt: 0,
  }),
  computed: {
    ...mapGetters([`connected`, `recover`]),
    ...mapGetters([`network`, `currentNetwork`]),
    name: {
      get() {
        return this.$store.state.recover.name
      },
      set(value) {
        this.$store.commit(`updateField`, { field: `name`, value })
      },
    },
    networkCryptoTypes() {
      if (this.currentNetwork.network_type === `cosmos`) {
        return JSON.parse(this.currentNetwork.HDPaths)
      } else if (this.currentNetwork.network_type === `polkadot`) {
        return JSON.parse(this.currentNetwork.curves)
      } else {
        return []
      }
    },
    currentCrypto() {
      return this.networkCryptoTypes[this.attempt]
    },
  },
  mounted() {
    this.created()
  },
  methods: {
    onSubmit() {
      this.$v.$touch()
      if (this.$v.name.$invalid) return
      this.$router.push("/recover/password")
    },
    async created(retry = false) {
      if (retry) this.attempt++
      this.attempt = this.numberAttemptsController(
        this.networkCryptoTypes,
        this.attempt
      )
      const wallet = await this.$store.dispatch(`getAddressFromSeed`, {
        seedPhrase: this.$store.state.recover.seed,
        network: this.network,
        networkCryptoTypes: this.networkCryptoTypes,
        attempt: this.attempt,
      })
      this.importedAddress = wallet.cosmosAddress
      this.$store.commit(`updateField`, {
        field: `HDPathOrCurve`,
        value: this.currentCrypto,
      })
    },
    numberAttemptsController(networkCryptoTypes, attempt) {
      if (attempt >= networkCryptoTypes.length) {
        return attempt - networkCryptoTypes.length
      } else {
        return attempt
      }
    },
  },
  validations: () => ({
    name: { required, minLength: minLength(3), nameExists },
  }),
}
</script>
<style>
.address {
  word-break: break-all;
  font-size: 0.9rem;
  color: var(--txt);
}

.session-main p {
  margin-bottom: 0;
}

.retry-link {
  font-size: 12px;
  cursor: pointer;
  color: var(--link);
}

.retry-link:hover {
  color: var(--link-hover);
}

.tm-form-group__field {
  position: unset;
}

.algo {
  position: absolute;
  top: 1.1rem;
  left: 5.75rem;
  font-size: 14px;
  font-weight: 500;
}
</style>
