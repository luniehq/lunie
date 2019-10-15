<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit">
      <h2 class="session-title">
        Create a new address
      </h2>
      <div v-if="!session.insecureMode" class="session-main">
        <InsecureModeWarning />
      </div>
      <div v-else>
        <div class="session-main">
          <Steps
            :steps="[`Create`, `Password`, `Seed`, `Success`]"
            active-step="Create"
          />
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
        </div>
        <div class="session-footer">
          <TmBtn value="Next" type="submit" />
        </div>
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
import Steps from "../../ActionModal/components/Steps"

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
    InsecureModeWarning,
    Steps
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
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      this.$router.push(`/create/password`)
    }
  },
  validations: () => ({
    fieldName: { required, minLength: minLength(5) }
  })
}
</script>
