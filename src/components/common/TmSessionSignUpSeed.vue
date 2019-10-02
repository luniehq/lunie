<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit.bind(this)">
      <h2 class="session-title">
        Confirm
      </h2>
      <div v-if="session.insecureMode" class="session-main">
        <TmFormGroup
          field-id="sign-up-seed"
          class="sign-up-seed-group"
          field-label="Seed Phrase"
        >
          <FieldSeed id="sign-up-seed" v-model="fieldSeed" />
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
        </TmFormGroup>
        <div class="session-footer">
          <TmBtn value="Create" :disabled="$v.fieldWarning.$invalid" />
        </div>
      </div>
      <div v-if="!session.insecureMode" class="session-main">
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
import DangerZoneWarning from "common/DangerZoneWarning"
import InsecureModeWarning from "common/InsecureModeWarning"

export default {
  name: `session-sign-up`,
  components: {
    TmBtn,
    SessionFrame,
    FieldSeed,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct,
    DangerZoneWarning,
    InsecureModeWarning
  },
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
        this.$router.push(`/create/success`)
      } catch (error) {
        this.$store.commit(`notifyError`, {
          title: `Couldn't create account`,
          body: error.message
        })
      }
    }
  },
  validations: () => ({
    fieldWarning: { required: sameAs(() => true) }
  })
}
</script>
