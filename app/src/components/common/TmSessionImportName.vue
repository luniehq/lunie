<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit">
      <h2 class="session-title">
        Choose name
      </h2>
      <div class="session-main bottom-indent">
        <Steps :steps="[`Recover`, `Name`, `Password`]" active-step="Name" />
        <TmFormGroup field-id="import-name" field-label="Your Address">
          <img
            v-if="importedAddress === undefined"
            class="tm-data-msg__icon"
            src="~assets/images/loader.svg"
            alt="a small spinning circle to display loading"
          />
          <p v-else class="address">{{ importedAddress }}</p>
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
  }),
  computed: {
    ...mapGetters([`recover`]),
    ...mapGetters([`network`]),
    name: {
      get() {
        return this.$store.state.recover.name
      },
      set(value) {
        this.$store.commit(`updateField`, { field: `name`, value })
      },
    },
  },
  async created() {
    this.importedAddress = await this.$store.dispatch(`getAddressFromSeed`, {
      seedPhrase: this.$store.state.recover.seed,
      network: this.network,
    })
  },
  methods: {
    onSubmit() {
      this.$v.$touch()
      if (this.$v.name.$invalid) return
      this.$router.push("/recover/password")
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
</style>
