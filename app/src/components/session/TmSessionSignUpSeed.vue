<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit.bind(this)">
      <h2 class="session-title">Backup code</h2>
      <div>
        <div class="session-main bottom-indent reorder">
          <Steps
            v-if="!session.mobile"
            :steps="[`Create`, `Password`, `Backup`]"
            active-step="Backup"
          />
          <TmSeed :value="fieldSeed" />
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
                  v-focus
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
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import { sameAs } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmFormMsg from "common/TmFormMsg"
import SessionFrame from "common/SessionFrame"
import Steps from "../../ActionModal/components/Steps"
import TmSeed from "common/TmSeed"

export default {
  name: `session-sign-up`,
  components: {
    TmBtn,
    SessionFrame,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct,
    Steps,
    TmSeed,
  },
  data: () => ({
    error: false,
    errorMessage: ``,
  }),
  computed: {
    ...mapState([`session`, `signup`]),
    ...mapGetters([`network`, `networkSlug`, `isExtension`, `currentNetwork`]),
    fieldSeed: {
      get() {
        return this.$store.state.signup.signUpSeed
      },
    },
    fieldWarning: {
      get() {
        return this.$store.state.signup.signUpWarning
      },
      set(value) {
        this.$store.commit(`updateField`, { field: `signUpWarning`, value })
      },
    },
  },
  mounted() {
    this.$store.dispatch(`createSeed`).then((seedPhrase) => {
      this.$store.commit(`updateField`, {
        field: `signUpSeed`,
        value: seedPhrase,
      })
    })
  },
  beforeDestroy: function () {
    this.$store.dispatch(`resetSignUpData`)
  },
  methods: {
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        await this.$store.dispatch(`createKey`, {
          seedPhrase: this.signup.signUpSeed,
          password: this.signup.signUpPassword,
          name: this.signup.signUpName,
          HDPath: this.currentNetwork.defaultHDPath,
          curve: this.currentNetwork.defaultCurve,
          network: this.network,
        })
        if (this.isExtension) {
          this.$router.push(`/`)
        } else {
          this.$router.push({
            name: "portfolio",
            params: {
              networkId: this.networkSlug,
            },
          })
        }
      } catch (error) {
        this.error = true
        this.errorMessage = error.message
      }
    },
  },
  validations: () => ({
    fieldWarning: { required: sameAs(() => true) },
  }),
}
</script>
