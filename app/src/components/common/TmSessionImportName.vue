<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit">
      <h2 class="session-title">
        Choose name
      </h2>
      <div class="session-main bottom-indent">
        <Steps :steps="[`Recover`, `Name`, `Password`]" active-step="Name" />
        <TmFormGroup field-id="import-name" :field-label="fieldLabel">
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
              v-if="networkHDPathsOrAlgos.length > 1"
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
import { polkadotAlgosDictionary } from "../../../../common/dictionaries"

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
    networkHDPathsOrAlgos() {
      return JSON.parse(this.currentNetwork.HDPathsOrAlgos)
    },
    currentAlgo() {
      if (this.currentNetwork.network_type === `polkadot`) {
        return polkadotAlgosDictionary[this.networkHDPathsOrAlgos[this.attempt]]
      } else {
        return this.networkHDPathsOrAlgos[this.attempt]
      }
    },
    fieldLabel() {
      let label = `Your Address`
      if (this.networkHDPathsOrAlgos.length > 1) {
        return label.concat(` --- Created using ${this.currentAlgo}`)
      } else {
        return label
      }
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
      const createAddressResponse = await this.$store.dispatch(
        `getAddressFromSeed`,
        {
          seedPhrase: this.$store.state.recover.seed,
          network: this.network,
          attempt: this.attempt,
        }
      )
      this.importedAddress = createAddressResponse.wallet.cosmosAddress
      this.$store.commit(`updateField`, {
        field: `accountType`,
        value: createAddressResponse.wallet.accountType,
      })
      this.attempt = createAddressResponse.attempt
    },
  },
  validations: () => ({
    name: { required, minLength: minLength(3), nameExists },
  }),
}
</script>
<style scoped>
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
</style>
