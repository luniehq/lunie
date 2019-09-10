<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit">
      <h2 class="session-title">
        Explore with any address
      </h2>
      <div class="session-main">
        <TmFormGroup field-id="sign-in-name" field-label="Your Cosmos Address">
          <TmField
            v-model="address"
            type="text"
            placeholder=""
            vue-focus="vue-focus"
          />
          <TmFormMsg
            v-if="$v.address.$error && !$v.address.required"
            name="Name"
            type="required"
          />
          <TmFormMsg
            v-else-if="$v.address.$error && !$v.address.bech32Validate"
            name="Your Cosmos Address"
            type="bech32"
          />
          <TmFormMsg
            v-else-if="$v.address.$error && !$v.address.isNotValidatorAddress"
            name="Your Cosmos Address"
            type="validator"
          />          
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn value="Explore" />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import { required } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import SessionFrame from "common/SessionFrame"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import bech32 from "bech32"
export default {
  name: `session-explore`,
  components: {
    SessionFrame,
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
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return

      this.$store.dispatch(`signIn`, {
        sessionType: `explore`,
        address: this.address
      })
      localStorage.setItem(`prevAddress`, this.address)
      this.$router.push(`/`)
    },
    bech32Validate(param) {
      try {
        bech32.decode(param)
        return true
      } catch (error) {
        return false
      }
    },
    isNotValidatorAddress(param) {
      console.log(param.substring(0, 13))
      if (param.substring(0, 13) !== "cosmosvaloper") {
        return true
      } else {
        return false
      }
    }
  },
  validations() {
    return {
      address: { required, bech32Validate: this.bech32Validate, isNotValidatorAddress: this.isNotValidatorAddress }
    }
  }
}
</script>
