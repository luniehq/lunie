<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit.bind(this)">
      <h2 class="session-title">
        Backup code
      </h2>
      <div v-if="session.insecureMode">
        <div class="session-main">
          <Steps
            :steps="[`Create`, `Password`, `Backup`]"
            active-step="Backup"
          />
          <TmFormGroup
            field-id="sign-up-seed"
            class="sign-up-seed-group"
            field-label="Backup Code"
          >
            <FieldSeed id="sign-up-seed" v-model="fieldSeed" disabled />
          </TmFormGroup>
          <TmFormGroup
            class="field-checkbox"
            :error="$v.fieldWarning.$error"
            field-id="sign-up-warning"
            field-label
          >
            <div class="field-checkbox-input">
              <label class="field-checkbox-label" for="sign-up-warning">
                <input
                  id="sign-up-warning"
                  v-model="fieldWarning"
                  type="checkbox"
                />
                I understand that lost seeds cannot be recovered.</label
              >
            </div>
            <TmFormMsg
              v-if="$v.fieldWarning.$error && !$v.fieldWarning.required"
              name="Recovery confirmation"
              type="required"
            />
            <TmFormMsg v-if="error" type="custom" :msg="errorMessage" />
          </TmFormGroup>
        </div>
        <div class="session-footer">
          <TmBtn value="Create" />
        </div>
      </div>
      <div v-else class="session-main">
        <InsecureModeWarning />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import { mapState } from "vuex"
import { sameAs } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmFormMsg from "common/TmFormMsg"
import FieldSeed from "common/TmFieldSeed"
import SessionFrame from "common/SessionFrame"
import InsecureModeWarning from "common/InsecureModeWarning"
import Steps from "../../ActionModal/components/Steps"

export default {
  name: `session-sign-up`,
  components: {
    TmBtn,
    SessionFrame,
    FieldSeed,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct,
    InsecureModeWarning,
    Steps
  },
  data: () => ({
    error: false,
    errorMessage: ``
  }),
  computed: {
    ...mapState([`session`, `signup`]),
    fieldSeed: {
      get() {
        return this.$store.state.signup.signUpSeed
      }
    },
    fieldWarning: {
      get() {
        return this.$store.state.signup.signUpWarning
      },
      set(value) {
        this.$store.commit(`updateField`, { field: `signUpWarning`, value })
      }
    }
  },
  mounted() {
    this.$store.dispatch(`createSeed`).then(seedPhrase => {
      this.$store.commit(`updateField`, {
        field: `signUpSeed`,
        value: seedPhrase
      })
    })
  },
  methods: {
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        await this.$store.dispatch(`createKey`, {
          seedPhrase: this.signup.signUpSeed,
          password: this.signup.signUpPassword,
          name: this.signup.signUpName
        })
        this.$store.dispatch(`resetSignUpData`)
        this.$router.push(`/`)
      } catch (error) {
        this.error = true
        this.errorMessage = error.message
      }
    }
  },
  validations: () => ({
    fieldWarning: { required: sameAs(() => true) }
  })
}
</script>
