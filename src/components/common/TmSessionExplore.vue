<template>
  <div class="session">
    <TmFormStruct :submit="onSubmit" class="tm-session-container">
      <div class="tm-session-header">
        <a @click="goToWelcome()">
          <i class="material-icons">arrow_back</i>
        </a>
        <div class="tm-session-title">
          Sign in with Address
        </div>
        <a @click="$store.commit(`toggleSessionModal`, false)">
          <i class="material-icons">close</i>
        </a>
      </div>
      <div class="tm-session-main">
        <TmFormGroup field-id="sign-in-name" field-label="Address">
          <TmField
            v-model="address"
            type="text"
            placeholder="Your Cosmos Address"
            vue-focus="vue-focus"
          />
          <TmFormMsg
            v-if="$v.address.$error && !$v.address.required"
            name="Name"
            type="required"
          />
          <TmFormMsg
            v-else-if="$v.address.$error && !$v.address.bech32Validate"
            name="Address"
            type="bech32"
          />
        </TmFormGroup>
      </div>
      <div class="tm-session-footer">
        <TmBtn value="Next" />
      </div>
    </TmFormStruct>
  </div>
</template>

<script>
import { required } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import bech32 from "bech32"
export default {
  name: `tm-session-explore`,
  components: {
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  data: () => ({
    address: ``,
    error: ``
  }),
  mounted() {
    this.address = localStorage.getItem(`prevAddress`)
  },
  methods: {
    goToWelcome() {
      this.$store.commit(`setSessionModalView`, `welcome`)
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return

      this.$store.dispatch(`signIn`, {
        sessionType: `explore`,
        address: this.address
      })
      localStorage.setItem(`prevAddress`, this.address)
      this.$router.push(`/`)
      this.$store.commit(`toggleSessionModal`, false)
    },
    bech32Validate(param) {
      try {
        bech32.decode(param)
        return true
      } catch (error) {
        return false
      }
    }
  },
  validations() {
    return {
      address: { required, bech32Validate: this.bech32Validate }
    }
  }
}
</script>
<style>
.tm-form-group a {
  cursor: pointer;
}
</style>
