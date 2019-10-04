<template>
  <SessionFrame>
    <TmFormStruct :submit="submit">
      <h2 class="session-title">
        Create a new address
      </h2>
      <div v-if="session.insecureMode" class="session-main">
        <DangerZoneWarning />
        <TmFormGroup
          :error="$v.fieldName.$error"
          field-id="sign-up-name"
          field-label="Account Name"
        >
          <TmField
            id="sign-up-name"
            v-model.trim="fieldName"
            type="text"
            placeholder="Must be at least 5 characters"
            vue-focus="vue-focus"
          />
          <TmFormMsg
            v-if="$v.fieldName.$error && !$v.fieldName.required"
            name="Name"
            type="required"
          />
          <TmFormMsg
            v-if="$v.fieldName.$error && !$v.fieldName.minLength"
            name="Name"
            type="minLength"
            min="5"
          />
        </TmFormGroup>
        <div class="session-footer">
          <TmBtn value="Next" type="submit" :disabled="$v.fieldName.$invalid" />
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
import { required, minLength } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import SessionFrame from "common/SessionFrame"
import DangerZoneWarning from "common/DangerZoneWarning"
import InsecureModeWarning from "common/InsecureModeWarning"

export default {
  name: `session-sign-up`,
  components: {
    TmBtn,
    TmField,
    SessionFrame,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct,
    DangerZoneWarning,
    InsecureModeWarning
  },
  computed: {
    ...mapState([`session`, `signup`]),
    fieldName: {
      get() {
        return this.$store.state.signup.signUpName
      },
      set(value) {
        this.$store.commit(`updateField`, { field: `signUpName`, value })
      }
    }
  },
  methods: {
    submit() {
      this.$router.push(`/create/password`)
    }
  },
  validations: () => ({
    fieldName: { required, minLength: minLength(5) }
  })
}
</script>
