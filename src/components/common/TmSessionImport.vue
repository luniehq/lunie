<template>
  <SessionFrame>
    <div class="session">
      <TmFormStruct :submit="onSubmit.bind(this)">
        <h2 class="session-title">
          Recover from seed
        </h2>
        <div class="session-main">
          <TmFormGroup
            :error="$v.$error && $v.fields.importName.$invalid"
            field-id="import-name"
            field-label="Account Name"
          >
            <TmField
              id="import-name"
              v-model.trim="fields.importName"
              type="text"
              placeholder="Must have at least 5 characters"
              vue-focus="vue-focus"
            />
            <TmFormMsg
              v-if="
                $v.fields.importName.$error && !$v.fields.importName.required
              "
              name="Name"
              type="required"
            />
            <TmFormMsg
              v-if="
                $v.fields.importName.$error && !$v.fields.importName.minLength
              "
              name="Name"
              type="minLength"
              min="5"
            />
          </TmFormGroup>
          <TmFormGroup
            :error="$v.$error && $v.fields.importPassword.$invalid"
            field-id="import-password"
            field-label="Password"
          >
            <TmField
              id="import-password"
              v-model="fields.importPassword"
              type="password"
              placeholder="Must be at least 10 characters"
            />
            <TmFormMsg
              v-if="
                $v.fields.importPassword.$error &&
                  !$v.fields.importPassword.required
              "
              name="Password"
              type="required"
            />
            <TmFormMsg
              v-if="
                $v.fields.importPassword.$error &&
                  !$v.fields.importPassword.minLength
              "
              name="Password"
              type="minLength"
              min="10"
            />
          </TmFormGroup>
          <TmFormGroup
            :error="$v.$error && $v.fields.importPasswordConfirm.$invalid"
            field-id="import-password-confirmation"
            field-label="Confirm Password"
          >
            <TmField
              id="import-password-confirmation"
              v-model="fields.importPasswordConfirm"
              type="password"
              placeholder="Enter password again"
            />
            <TmFormMsg
              v-if="
                $v.fields.importPasswordConfirm.$error &&
                  !$v.fields.importPasswordConfirm.sameAsPassword
              "
              name="Password confirmation"
              type="match"
            />
          </TmFormGroup>
          <TmFormGroup
            :error="$v.$error && $v.fields.importSeed.$invalid"
            field-id="import-seed"
            field-label="Seed Phrase"
          >
            <FieldSeed
              id="import-seed"
              :value="fields.importSeed"
              placeholder="Must be exactly 24 words"
              @input="val => (fields.importSeed = val)"
            />
            <TmFormMsg
              v-if="
                $v.fields.importSeed.$error && !$v.fields.importSeed.required
              "
              name="Seed"
              type="required"
            />
            <TmFormMsg
              v-else-if="
                $v.fields.importSeed.$error && !$v.fields.importSeed.words24
              "
              name="Seed"
              type="words24"
            />
          </TmFormGroup>
          <TmFormGroup
            :error="$v.$error && $v.fields.errorCollection.$invalid"
            field-id="error-collection"
            field-label
          >
            <div class="field-checkbox">
              <label class="field-checkbox-label" for="error-collection">
                <input
                  id="error-collection"
                  v-model="fields.errorCollection"
                  type="checkbox"
                />
                I'd like to opt in for remote error tracking to help improve
                Voyager.
              </label>
            </div>
          </TmFormGroup>
        </div>
        <div class="session-footer">
          <TmBtn value="Recover" />
        </div>
      </TmFormStruct>
    </div>
  </SessionFrame>
</template>

<script>
import { required, minLength, sameAs } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import FieldSeed from "common/TmFieldSeed"
import SessionFrame from "common/SessionFrame"
import { mapGetters } from "vuex"
export default {
  name: `session-import`,
  components: {
    TmBtn,
    TmField,
    SessionFrame,
    FieldSeed,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  data: () => ({
    fields: {
      importName: ``,
      importPassword: ``,
      importPasswordConfirm: ``,
      importSeed: ``
    }
  }),
  computed: {
    ...mapGetters([`connected`])
  },
  methods: {
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        await this.$store.dispatch(`createKey`, {
          seedPhrase: this.fields.importSeed,
          password: this.fields.importPassword,
          name: this.fields.importName
        })
        this.$router.push(`/`)
      } catch (error) {
        this.$store.commit(`notifyError`, {
          title: `Couldn't create account`,
          body: error.message
        })
      }
    }
  },
  validations: () => ({
    fields: {
      importName: { required, minLength: minLength(5) },
      importPassword: { required, minLength: minLength(10) },
      importPasswordConfirm: { sameAsPassword: sameAs(`importPassword`) },
      importSeed: { required, words24 },
      errorCollection: false
    }
  })
}
const words24 = param => {
  return param && param.split(` `).length === 24
}
</script>
