<template>
  <SessionFrame>
    <TmFormStruct :submit="() => {}">
      <h2 class="session-title">
        Choose Password
      </h2>
      <div v-if="session.insecureMode" class="session-main">
        <DangerZoneWarning />
        <TmFormGroup
          :error="$v.fieldPassword.$error"
          field-id="sign-up-password"
          field-label="Password"
        >
          <TmField
            id="sign-up-password"
            v-model="fieldPassword"
            type="password"
            placeholder="Must be at least 10 characters"
          />
          <TmFormMsg
            v-if="$v.fieldPassword.$error && !$v.fieldPassword.required"
            name="Password"
            type="required"
          />
          <TmFormMsg
            v-if="$v.fieldPassword.$error && !$v.fieldPassword.minLength"
            name="Password"
            type="minLength"
            min="10"
          />
        </TmFormGroup>
        <TmFormGroup
          :error="$v.fieldPasswordConfirm.$error"
          field-id="sign-up-password-confirm"
          field-label="Confirm Password"
        >
          <TmField
            id="sign-up-password-confirm"
            v-model="fieldPasswordConfirm"
            type="password"
            placeholder="Enter password again"
          />
          <TmFormMsg
            v-if="
              $v.fieldPasswordConfirm.$error &&
                !$v.fieldPasswordConfirm.sameAsPassword
            "
            name="Password confirmation"
            type="match"
          />
        </TmFormGroup>
        <div class="session-footer">
          <TmBtn
            value="Confirm"
            :disabled="
              $v.fieldPassword.$invalid || $v.fieldPasswordConfirm.$invalid
            "
            @click.native="$router.push('create-confirm')"
          />
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
import { required, minLength, sameAs } from "vuelidate/lib/validators"
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
    fieldPassword: {
      get() {
        return this.$store.state.signup.signUpPassword
      },
      set(value) {
        this.$store.commit(`updateField`, { field: `signUpPassword`, value })
      }
    },
    fieldPasswordConfirm: {
      get() {
        return this.$store.state.signup.signUpPasswordConfirm
      },
      set(value) {
        this.$store.commit(`updateField`, {
          field: `signUpPasswordConfirm`,
          value
        })
      }
    }
  },
  validations: () => ({
    fieldPassword: { required, minLength: minLength(10) },
    fieldPasswordConfirm: { sameAsPassword: sameAs(`fieldPassword`) }
  })
}
</script>
