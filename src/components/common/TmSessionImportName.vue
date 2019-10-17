<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit">
      <h2 class="session-title">
        Recover with backup code
      </h2>
      <div class="session-main">
        <Steps
          :steps="[`Recover`, `Name`, `Password`, `Success`]"
          active-step="Name"
        />
        <TmFormGroup field-id="import-name" field-label="Your Address">
          <p class="address">{{ importCosmosAddress }}</p>
        </TmFormGroup>
        <TmFormGroup
          :error="$v.$error && $v.name.$invalid"
          field-id="import-name"
          field-label="Account Name"
        >
          <TmField
            id="import-name"
            v-model.trim="name"
            type="text"
            placeholder="Must have at least 5 characters"
            vue-focus="vue-focus"
          />
          <TmFormMsg
            v-if="$v.name.$error && !$v.name.required"
            name="Name"
            type="required"
          />
          <TmFormMsg
            v-if="$v.name.$error && !$v.name.minLength"
            name="Name"
            type="minLength"
            min="5"
          />
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn value="Next" type="submit" />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import { required, minLength } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import SessionFrame from "common/SessionFrame"
import { mapGetters } from "vuex"
import Steps from "../../ActionModal/components/Steps"

export default {
  name: `session-import-name`,
  components: {
    TmBtn,
    TmField,
    SessionFrame,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct,
    Steps
  },
  data: () => ({
    importCosmosAddress: {}
  }),
  computed: {
    ...mapGetters([`connected`, `recover`]),
    name: {
      get() {
        return this.$store.state.recover.name
      },
      set(value) {
        this.$store.commit(`updateField`, { field: `name`, value })
      }
    }
  },
  async created() {
    this.importCosmosAddress = await this.$store.dispatch(
      `getAddressFromSeed`,
      this.$store.state.recover.seed
    )
  },
  methods: {
    onSubmit() {
      this.$v.$touch()
      if (this.$v.name.$invalid) return
      this.$router.push("/recover/password")
    }
  },
  validations: () => ({
    name: { required, minLength: minLength(5) }
  })
}
</script>
<style scoped>
.address {
  word-break: break-all;
  font-size: 0.9rem;
}
</style>
