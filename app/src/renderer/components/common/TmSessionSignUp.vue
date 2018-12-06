<template>
  <div class="tm-session">
    <tm-form-struct :submit="onSubmit" class="tm-session-container">
      <div class="tm-session-header">
        <a @click="setState('welcome')"
          ><i class="material-icons">arrow_back</i></a
        >
        <div class="tm-session-title">Create Account</div>
        <a @click="help"><i class="material-icons">help_outline</i></a>
      </div>
      <div class="tm-session-main">
        <tm-form-group
          :error="$v.fields.signUpName.$error"
          field-id="sign-up-name"
          field-label="Account Name"
        >
          <tm-field
            id="sign-up-name"
            v-model.trim="fields.signUpName"
            type="text"
            placeholder="Must be at least 5 characters"
          />
          <tm-form-msg
            v-if="!$v.fields.signUpName.required"
            name="Name"
            type="required"
          />
          <tm-form-msg
            v-if="!$v.fields.signUpName.minLength"
            name="Name"
            type="minLength"
            min="5"
          />
        </tm-form-group>
        <tm-form-group
          :error="$v.fields.signUpPassword.$error"
          field-id="sign-up-password"
          field-label="Password"
        >
          <tm-field
            id="sign-up-password"
            v-model="fields.signUpPassword"
            type="password"
            placeholder="Must be at least 10 characters"
          />
          <tm-form-msg
            v-if="!$v.fields.signUpPassword.required"
            name="Password"
            type="required"
          />
          <tm-form-msg
            v-if="!$v.fields.signUpPassword.minLength"
            name="Password"
            type="minLength"
            min="10"
          />
        </tm-form-group>
        <tm-form-group
          :error="$v.fields.signUpPasswordConfirm.$error"
          field-id="sign-up-password-confirm"
          field-label="Confirm Password"
        >
          <tm-field
            id="sign-up-password-confirm"
            v-model="fields.signUpPasswordConfirm"
            type="password"
            placeholder="Enter password again"
          />
          <tm-form-msg
            v-if="!$v.fields.signUpPasswordConfirm.sameAsPassword"
            name="Password confirmation"
            type="match"
          />
        </tm-form-group>
        <tm-form-group field-id="sign-up-seed" field-label="Seed Phrase">
          <field-seed
            id="sign-up-seed"
            v-model="fields.signUpSeed"
            disabled="disabled"
          />
          <tm-form-msg class="sm"
            >Please back up the seed phrase for this account. This seed phrase
            cannot be recovered.</tm-form-msg
          >
        </tm-form-group>
        <tm-form-group
          :error="$v.fields.signUpWarning.$error"
          field-id="sign-up-warning"
          field-label=""
        >
          <div class="tm-field-checkbox">
            <div class="tm-field-checkbox-input">
              <input
                id="sign-up-warning"
                v-model="fields.signUpWarning"
                type="checkbox"
              />
            </div>
            <label class="tm-field-checkbox-label" for="sign-up-warning"
              >I have securely written down my seed. I understand that lost
              seeds cannot be recovered.</label
            >
          </div>
          <tm-form-msg
            v-if="!$v.fields.signUpWarning.required"
            name="Recovery confirmation"
            type="required"
          />
        </tm-form-group>
        <tm-form-group
          :error="$v.fields.errorCollection.$error"
          field-id="error-collection"
          field-label=""
        >
          <div class="tm-field-checkbox">
            <div class="tm-field-checkbox-input">
              <input
                id="error-collection"
                v-model="fields.errorCollection"
                type="checkbox"
              />
            </div>
            <label class="tm-field-checkbox-label" for="error-collection"
              >I'd like to opt in for remote error tracking to help improve
              Voyager.</label
            >
          </div>
        </tm-form-group>
      </div>
      <div class="tm-session-footer">
        <tm-btn
          v-if="connected"
          :disabled="creating"
          icon="arrow_forward"
          icon-pos="right"
          value="Next"
          size="lg"
        />
        <tm-btn
          v-else
          icon-pos="right"
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
import PerfectScrollbar from "perfect-scrollbar"
import {
  TmBtn,
  TmFormGroup,
  TmFormStruct,
  TmField,
  TmFormMsg
} from "@tendermint/ui"
import FieldSeed from "common/TmFieldSeed"
import { mapGetters } from "vuex"
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
  computed: {
    ...mapGetters([`connected`])
  },
  mounted() {
    this.$el.querySelector(`#sign-up-name`).focus()
    this.$store.dispatch(`createSeed`).then(seedPhrase => {
      this.creating = false
      this.fields.signUpSeed = seedPhrase
    })
    new PerfectScrollbar(this.$el.querySelector(`.tm-session-main`))
  },
  methods: {
    help() {
      this.$store.commit(`setModalHelp`, true)
    },
    setState(value) {
      this.$store.commit(`setModalSessionState`, value)
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        let key = await this.$store.dispatch(`createKey`, {
          seedPhrase: this.fields.signUpSeed,
          password: this.fields.signUpPassword,
          name: this.fields.signUpName
        })
        if (key) {
          this.$store.dispatch(`setErrorCollection`, {
            account: this.fields.signUpName,
            optin: this.fields.errorCollection
          })
          this.$store.commit(`setModalSession`, false)
          this.$store.commit(`notify`, {
            title: `Signed Up`,
            body: `Your account has been created.`
          })
          this.$store.dispatch(`signIn`, {
            password: this.fields.signUpPassword,
            account: this.fields.signUpName
          })
        }
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
      signUpWarning: { required },
      errorCollection: false
    }
  })
}
</script>
