<template>
  <div class="tm-session">
    <TmFormStruct :submit="onSubmit.bind(this)" class="tm-session-container">
      <div class="tm-session-header">
        <a @click="setState('welcome')">
          <i class="material-icons">arrow_back</i>
        </a>
        <div class="tm-session-title">
          Create Account
        </div>
        <a @click="$store.commit(`toggleSessionModal`, false)">
          <i class="material-icons">close</i>
        </a>
      </div>
      <div class="tm-session-main">
        <TmFormGroup
          :error="$v.fields.signUpName.$error"
          field-id="sign-up-name"
          field-label="Account Name"
        >
          <TmField
            id="sign-up-name"
            v-model.trim="fields.signUpName"
            type="text"
            placeholder="Must be at least 5 characters"
          />
          <TmFormMsg
            v-if="$v.fields.signUpName.$error && !$v.fields.signUpName.required"
            name="Name"
            type="required"
          />
          <TmFormMsg
            v-if="
              $v.fields.signUpName.$error && !$v.fields.signUpName.minLength
            "
            name="Name"
            type="minLength"
            min="5"
          />
        </TmFormGroup>
        <TmFormGroup
          :error="$v.fields.signUpPassword.$error"
          field-id="sign-up-password"
          field-label="Password"
        >
          <TmField
            id="sign-up-password"
            v-model="fields.signUpPassword"
            type="password"
            placeholder="Must be at least 10 characters"
          />
          <TmFormMsg
            v-if="
              $v.fields.signUpPassword.$error &&
                !$v.fields.signUpPassword.required
            "
            name="Password"
            type="required"
          />
          <TmFormMsg
            v-if="
              $v.fields.signUpPassword.$error &&
                !$v.fields.signUpPassword.minLength
            "
            name="Password"
            type="minLength"
            min="10"
          />
        </TmFormGroup>
        <TmFormGroup
          :error="$v.fields.signUpPasswordConfirm.$error"
          field-id="sign-up-password-confirm"
          field-label="Confirm Password"
        >
          <TmField
            id="sign-up-password-confirm"
            v-model="fields.signUpPasswordConfirm"
            type="password"
            placeholder="Enter password again"
          />
          <TmFormMsg
            v-if="
              $v.fields.signUpPasswordConfirm.$error &&
                !$v.fields.signUpPasswordConfirm.sameAsPassword
            "
            name="Password confirmation"
            type="match"
          />
        </TmFormGroup>
        <TmFormGroup
          field-id="sign-up-seed"
          class="sign-up-seed-group"
          field-label="Seed Phrase"
        >
          <FieldSeed
            id="sign-up-seed"
            v-model="fields.signUpSeed"
            disabled="disabled"
          />
          <TmFormMsg
            class="sm"
            type="custom"
            msg="Please back up the seed phrase for this account.
            This seed phrase cannot be recovered."
          />
        </TmFormGroup>
        <TmFormGroup
          :error="$v.fields.signUpWarning.$error"
          field-id="sign-up-warning"
          field-label
        >
          <div class="tm-field-checkbox">
            <div class="tm-field-checkbox-input">
              <input
                id="sign-up-warning"
                v-model="fields.signUpWarning"
                type="checkbox"
              />
            </div>
            <label class="tm-field-checkbox-label" for="sign-up-warning">
              I have securely written down my seed. I understand that lost seeds
              cannot be recovered.
            </label>
          </div>
          <TmFormMsg
            v-if="
              $v.fields.signUpWarning.$error &&
                !$v.fields.signUpWarning.required
            "
            name="Recovery confirmation"
            type="required"
          />
        </TmFormGroup>
        <TmFormGroup
          :error="$v.fields.errorCollection.$error"
          field-id="error-collection"
          field-label
        >
          <div class="tm-field-checkbox">
            <div class="tm-field-checkbox-input">
              <input
                id="error-collection"
                v-model="fields.errorCollection"
                type="checkbox"
              />
            </div>
            <label class="tm-field-checkbox-label" for="error-collection">
              I'd like to opt in for remote error tracking to help improve
              Voyager.
            </label>
          </div>
        </TmFormGroup>
      </div>
      <div class="tm-session-footer">
        <TmBtn value="Next" size="lg" />
      </div>
    </TmFormStruct>
  </div>
</template>

<script>
import { required, minLength, sameAs } from "vuelidate/lib/validators"
import PerfectScrollbar from "perfect-scrollbar"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import FieldSeed from "common/TmFieldSeed"
export default {
  name: `tm-session-sign-up`,
  components: {
    TmBtn,
    TmField,
    FieldSeed,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  data: () => ({
    creating: true,
    fields: {
      signUpName: ``,
      signUpSeed: `Creating seed...`,
      signUpPassword: ``,
      signUpPasswordConfirm: ``,
      signUpWarning: false
    }
  }),
  mounted() {
    this.$el.querySelector(`#sign-up-name`).focus()
    this.$store.dispatch(`createSeed`).then(seedPhrase => {
      this.creating = false
      this.fields.signUpSeed = seedPhrase
    })
    new PerfectScrollbar(this.$el.querySelector(`.tm-session-main`))
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
          seedPhrase: this.fields.signUpSeed,
          password: this.fields.signUpPassword,
          name: this.fields.signUpName
        })
        this.$store.commit(`toggleSessionModal`, false)
        this.$store.commit(`notify`, {
          title: `Signed Up`,
          body: `Your account has been created.`
        })
        this.$store.dispatch(`signIn`, {
          password: this.fields.signUpPassword,
          localKeyPairName: this.fields.signUpName
        })
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
      signUpName: { required, minLength: minLength(5) },
      signUpPassword: { required, minLength: minLength(10) },
      signUpPasswordConfirm: { sameAsPassword: sameAs(`signUpPassword`) },
      signUpWarning: { required: sameAs(() => true) },
      errorCollection: false
    }
  })
}
</script>

<style>
.sign-up-seed-group {
  margin-bottom: 2rem;
}
</style>
