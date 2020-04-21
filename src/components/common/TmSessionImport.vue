<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit">
      <h2 class="session-title">
        Recover with backup code
      </h2>
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
            placeholder="Must be exactly 12 or 24 words"
            @input="val => (seed = val)"
          />
          <TmFormMsg
            v-if="$v.seed.$error && !$v.seed.required"
            name="Seed"
            type="required"
          />
          <TmFormMsg
            v-else-if="$v.seed.$error && !$v.seed.seedHasCorrectLength"
            name="Seed"
            type="words12or24"
          />
          <TmFormMsg
            v-else-if="$v.seed.$error && !$v.seed.seedIsLowerCaseAndSpaces"
            name="Seed"
            type="lowercaseAndSpaces"
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

const has12or24words = param => {
  return (
    param && (param.split(` `).length === 12 || param.split(` `).length === 24)
  )
}

const lowerCaseAndSpaces = param => {
  const seedWordsAreLowerCaseAndSpaces = /^([a-z]+\s)*[a-z]+$/g
  if (param.match(seedWordsAreLowerCaseAndSpaces)) {
    return param === param.match(seedWordsAreLowerCaseAndSpaces)[0]
  }
  return false
}

const polkadotRawSeed = param => {
  const polkadotRawSeedRegExp = /0x[a-z0-9]{64}/
  return polkadotRawSeedRegExp.test(param)
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
    Steps
  },
  computed: {
    ...mapGetters([`recover`]),
    seed: {
      get() {
        return this.$store.state.recover.seed
      },
      set(value) {
        this.$store.commit(`updateField`, {
          field: `seed`,
          value: value.trim() // remove spaces from beginning and end of string
        })
      }
    }
  },
  methods: {
    onSubmit() {
      this.$v.$touch()
      if (this.$v.seed.$invalid || this.$v.seed.$invalid) return
      this.$router.push("/recover/name")
    }
  },
  validations: () => ({
    seed: {
      required,
      seedIsLowerCaseAndSpaces: param =>
        lowerCaseAndSpaces(param) || polkadotRawSeed(param),
      seedHasCorrectLength: param =>
        has12or24words(param) || polkadotRawSeed(param)
    }
  })
}
</script>
