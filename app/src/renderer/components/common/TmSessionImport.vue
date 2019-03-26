<template>
  <div class="tm-session">
    <tm-form-struct :submit="onSubmit.bind(this)" class="tm-session-container">
      <div class="tm-session-header">
        <a @click="setState('welcome')">
          <i class="material-icons">arrow_back</i>
        </a>
        <div class="tm-session-title">
          Import with Seed
        </div>
        <a @click="$store.commit(`toggleSessionModal`, false)">
          <i class="material-icons">close</i>
        </a>
      </div>
      <div class="tm-session-main">
        <tm-form-group
          :error="$v.$error && $v.fields.importName.$invalid"
          field-id="import-name"
          field-label="Account Name"
        >
          <tm-field
            id="import-name"
            v-model.trim="fields.importName"
            type="text"
            placeholder="Must have at least 5 characters"
          />
          <tm-form-msg
            v-if="$v.fields.importName.$error && !$v.fields.importName.required"
            name="Name"
            type="required"
          />
          <tm-form-msg
            v-if="
              $v.fields.importName.$error && !$v.fields.importName.minLength
            "
            name="Name"
            type="minLength"
            min="5"
          />
        </tm-form-group>
        <tm-form-group
          :error="$v.$error && $v.fields.importPassword.$invalid"
          field-id="import-password"
          field-label="Password"
        >
          <tm-field
            id="import-password"
            v-model="fields.importPassword"
            type="password"
            placeholder="Must be at least 10 characters"
          />
          <tm-form-msg
            v-if="
              $v.fields.importPassword.$error &&
                !$v.fields.importPassword.required
            "
            name="Password"
            type="required"
          />
          <tm-form-msg
            v-if="
              $v.fields.importPassword.$error &&
                !$v.fields.importPassword.minLength
            "
            name="Password"
            type="minLength"
            min="10"
          />
        </tm-form-group>
        <tm-form-group
          :error="$v.$error && $v.fields.importPasswordConfirm.$invalid"
          field-id="import-password-confirmation"
          field-label="Confirm Password"
        >
          <tm-field
            id="import-password-confirmation"
            v-model="fields.importPasswordConfirm"
            type="password"
            placeholder="Enter password again"
          />
          <tm-form-msg
            v-if="
              $v.fields.importPasswordConfirm.$error &&
                !$v.fields.importPasswordConfirm.sameAsPassword
            "
            name="Password confirmation"
            type="match"
          />
        </tm-form-group>
        <p class="fundraiser-warning">
          Warning – Do not enter your actual 12 or 24 word seed phrase. This
          feature is intended for testing and is considered highly unsafe.
        </p>
        <tm-form-group
          :error="$v.$error && $v.fields.importSeed.$invalid"
          field-id="import-seed"
          field-label="Seed Phrase"
        >
          <field-seed
            id="import-seed"
            :value="fields.importSeed"
            placeholder="Must be exactly 24 words"
            @input="val => (fields.importSeed = val)"
          />
          <tm-form-msg
            v-if="$v.fields.importSeed.$error && !$v.fields.importSeed.required"
            name="Seed"
            type="required"
          />
          <tm-form-msg
            v-else-if="
              $v.fields.importSeed.$error && !$v.fields.importSeed.words24
            "
            name="Seed"
            type="words24"
          />
        </tm-form-group>
        <tm-form-group
          :error="$v.$error && $v.fields.errorCollection.$invalid"
          field-id="error-collection"
          field-label
        >
          <div class="tm-field-checkbox">
            <div class="tm-field-checkbox-input">
              <input
                id="error-collection"
                v-model="fields.errorCollection"
                type="checkbox"
              >
            </div>
            <label class="tm-field-checkbox-label" for="error-collection">
              I'd like to opt in for remote error tracking to help improve
              Voyager.
            </label>
          </div>
        </tm-form-group>
        <p
          v-if="error"
          class="tm-form-msg sm tm-form-msg--error"
        >
          {{ error }}
        </p>
      </div>
      <div class="tm-session-footer">
        <tm-btn v-if="connected" value="Next" size="lg" />
        <tm-btn
          v-else
          value="Connecting..."
          size="lg"
          disabled="true"
        />
      </div>
    </tm-form-struct>
  </div>
</template>

<script>
import { required, minLength, sameAs } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import FieldSeed from "common/TmFieldSeed"
import { mapGetters } from "vuex"
export default {
  name: `tm-session-import`,
  components: {
    TmBtn,
    TmField,
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
    },
    error: undefined
  }),
  computed: {
    ...mapGetters([`connected`])
  },
  mounted() {
    this.$el.querySelector(`#import-name`).focus()
  },
  methods: {
    setState(value) {
      this.$store.commit(`setSessionModalView`, value)
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        await this.$store.dispatch(`createKey`, {
          seedPhrase: this.fields.importSeed,
          password: this.fields.importPassword,
          name: this.fields.importName
        })
        await this.$store.dispatch(`signIn`, {
          localKeyPairName: this.fields.importName,
          password: this.fields.importPassword,
          sessionType: `local`,
          errorCollection: this.fields.errorCollection
        })
        this.$store.commit(`notify`, {
          title: `Welcome back!`,
          body: `Your account has been successfully imported.`
        })
      } catch (error) {
        this.error = `Couldn't import account: ${error.message}`
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
<style>
.fundraiser-warning {
  color: var(--danger);
  font-size: var(--sm);
  font-weight: 500;
}
</style>

