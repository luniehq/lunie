<template>
  <SessionFrame :goBack="goBack" :hideBack="createdAccount">
    <TmFormStruct>
      <div v-if="createdAccount">
        <h2 class="session-title">
          Success!
        </h2>
        <div class="session-main">
          <p>
            Your account "{{ fieldName }}" has been created.<br />Your new
            address is: "{{ "address here" }}".<br />Happy staking!
          </p>
        </div>
        <div class="session-footer">
          <TmBtn value="Go to Lunie" @click.native="$router.push('/')" />
        </div>
      </div>
      <div v-else>
        <div v-if="!session.insecureMode" class="session-main">
          <h2 class="session-title">
            Create a new address
          </h2>
          <InsecureModeWarning />
        </div>
        <div v-else>
          <div class="session-main">
            <StepsForm :steps="steps" @done="success" ref="steps">
              <div slot="name">
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
              <div slot="password">
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
                    v-if="
                      $v.fieldPassword.$error && !$v.fieldPassword.minLength
                    "
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
              </div>
              <div slot="seed">
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
                </TmFormGroup>
              </div>
            </StepsForm>
          </div>

          <div class="session-footer">
            <TmBtn value="Next" @click.native="() => $refs.steps.onNext()" />
          </div>
        </div>
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
import FieldSeed from "common/TmFieldSeed"
import TmFormMsg from "common/TmFormMsg"
import SessionFrame from "common/SessionFrame"
import DangerZoneWarning from "common/DangerZoneWarning"
import InsecureModeWarning from "common/InsecureModeWarning"
import StepsForm from "./StepsForm"

const defaultData = {
  fieldName: "",
  fieldPassword: "",
  fieldPasswordConfirm: "",
  fieldWarning: false,
  fieldSeed: "",
  createdAccount: false
}

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
    StepsForm,
    FieldSeed
  },
  data: () => ({
    steps: [],
    ...defaultData
  }),
  computed: {
    ...mapState([`session`])
  },
  methods: {
    goBack() {
      if (this.$refs.steps.active === 0) {
        this.$router.go(`-1`)
        return
      }
      this.$refs.steps.goBack()
    },
    async success() {
      try {
        await this.$store.dispatch(`createKey`, {
          seedPhrase: this.fieldSeed,
          password: this.fieldPassword,
          name: this.fieldName
        })
        this.createdAccount = true
      } catch (error) {
        this.$store.commit(`notifyError`, {
          title: `Couldn't create account`,
          body: error.message
        })
      }
    }
  },
  created() {
    this.steps = [
      {
        name: "name",
        validation: function() {
          this.$v.fieldName.$touch()
          return !this.$v.fieldName.$error
        }
      },
      {
        name: "password",
        validation: function() {
          this.$v.fieldPassword.$touch()
          this.$v.fieldPasswordConfirm.$touch()
          return (
            !this.$v.fieldPassword.$error &&
            !this.$v.fieldPasswordConfirm.$error
          )
        }
      },
      {
        name: "seed",
        validation: function() {
          this.$v.fieldWarning.$touch()
          return !this.$v.fieldWarning.$error
        }
      }
    ]
    // the validation function would have the steps object as this somehow
    this.steps.forEach(step => {
      step.validation = step.validation.bind(this)
    })
  },
  async mounted() {
    Object.assign(this, defaultData) // clear data on mount
    this.fieldSeed = await this.$store.dispatch(`createSeed`)
  },
  validations: () => ({
    fieldName: { required, minLength: minLength(5) },
    fieldPassword: { required, minLength: minLength(10) },
    fieldPasswordConfirm: { sameAsPassword: sameAs(`fieldPassword`) },
    fieldWarning: { required: sameAs(() => true) }
  })
}
</script>
