<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit.bind(this)">
      <h2 class="session-title">
        Backup code
      </h2>
      <div v-if="!session.insecureMode && !session.mobile" class="session-main">
        <InsecureModeWarning />
      </div>
      <div v-else>
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
import InsecureModeWarning from "common/InsecureModeWarning"
import Steps from "../../ActionModal/components/Steps"
import TmSeed from "common/TmSeed"
import gql from "graphql-tag"

export default {
  name: `session-sign-up`,
  components: {
    TmBtn,
    SessionFrame,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct,
    InsecureModeWarning,
    Steps,
    TmSeed
  },
  data: () => ({
    error: false,
    errorMessage: ``,
    addressPrefixes: []
  }),
  computed: {
    ...mapState([`session`, `signup`]),
    ...mapGetters({ networkId: `network` }),
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
  beforeDestroy: function() {
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
          network: this.networkId
        })
        this.$router.push(`/`)
      } catch (error) {
        this.error = true
        this.errorMessage = error.message
      }
    }
  },
  apollo: {
    addressPrefixes: {
      query: gql`
        query Network {
          networks {
            id
            address_prefix
          }
        }
      `,
      /* istanbul ignore next */
      update(data) {
        return data.networks
      },
      fetchPolicy: "cache-first"
    }
  },
  validations: () => ({
    fieldWarning: { required: sameAs(() => true) }
  })
}
</script>
<style>
.session .field-checkbox-input {
  text-align: center;
}
</style>
