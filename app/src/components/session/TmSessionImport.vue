<template>
  <SessionFrame :icon="`settings_backup_restore`">
    <TmFormStruct :submit="onSubmit">
      <h2 class="session-title">Recover with backup code</h2>
      <div class="session-main bottom-indent">
        <Steps :steps="[`Recover`, `Name`, `Password`]" active-step="Recover" />
        <TmFormGroup
          :error="$v.$error && $v.seed.$invalid"
          field-id="import-seed"
          field-label="Backup code"
        >
          <FieldSeed
            id="import-seed"
            :value="seed"
            :placeholder="
              isPolkadot
                ? 'Must be your seed phrase or private key hash'
                : 'Must be exactly 12 or 24 words'
            "
            @input="(val) => (seed = val)"
          />
          <TmFormMsg
            v-if="$v.seed.$error && !$v.seed.required"
            name="Seed"
            type="required"
          />
          <TmFormMsg
            v-else-if="$v.seed.$error && !$v.seed.seedHasCorrectLength"
            name="Seed"
            :type="isPolkadot ? 'incorrectPolkadotSeed' : 'words12or24'"
          />
          <TmFormMsg
            v-else-if="$v.seed.$error && !$v.seed.seedIsLowerCaseAndSpaces"
            name="Seed"
            :type="isPolkadot ? 'incorrectPolkadotSeed' : 'lowercaseAndSpaces'"
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
import { required } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmFormMsg from "common/TmFormMsg"
import FieldSeed from "common/TmFieldSeed"
import SessionFrame from "common/SessionFrame"
import { mapGetters } from "vuex"
import Steps from "../../ActionModal/components/Steps"
import { mnemonicValidate } from "@polkadot/util-crypto"

const has12or24words = (param) => {
  return (
    param && (param.split(` `).length === 12 || param.split(` `).length === 24)
  )
}
const isHex = (value) => {
  return /0x[0-9a-f]+/i.test(value)
}

const lowerCaseAndSpaces = (param) => {
  const seedWordsAreLowerCaseAndSpaces = /^([a-z]+\s)*[a-z]+$/g
  if (param.match(seedWordsAreLowerCaseAndSpaces)) {
    return param === param.match(seedWordsAreLowerCaseAndSpaces)[0]
  }
  return false
}
// exporting these for testing
export const isPolkadotHexSeed = (seed) => {
  return isHex(seed) && seed.length === 66
}

export const polkadotRawSeedValidate = (seed) => {
  return (seed.length > 0 && seed.length <= 32) || isPolkadotHexSeed(seed)
}

export const polkadotValidation = (seed) => {
  return mnemonicValidate(seed) || polkadotRawSeedValidate(seed)
}

export default {
  name: `session-import-backupcode`,
  components: {
    TmBtn,
    SessionFrame,
    FieldSeed,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct,
    Steps,
  },
  computed: {
    ...mapGetters([`recover`, `currentNetwork`]),
    seed: {
      get() {
        return this.$store.state.recover.seed
      },
      set(value) {
        this.$store.commit(`updateField`, {
          field: `seed`,
          value: value.trim(), // remove spaces from beginning and end of string
        })
      },
    },
    isPolkadot() {
      return this.currentNetwork.network_type === "polkadot"
    },
  },
  methods: {
    onSubmit() {
      this.$v.$touch()
      if (this.$v.seed.$invalid || this.$v.seed.$invalid) return
      this.$router.push("/recover/name")
    },
  },
  validations() {
    return {
      seed: {
        required,
        seedIsLowerCaseAndSpaces: (param) =>
          this.isPolkadot
            ? polkadotValidation(param)
            : lowerCaseAndSpaces(param),
        seedHasCorrectLength: (param) =>
          this.isPolkadot ? polkadotValidation(param) : has12or24words(param),
      },
    }
  },
}
</script>
