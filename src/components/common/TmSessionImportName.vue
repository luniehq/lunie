<template>
  <SessionFrame>
    <TmFormStruct :submit="() => {}">
      <h2 class="session-title">
        Recover with backup code
      </h2>
      <div class="session-main">
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
        <TmBtn
          value="Confirm Seed"
          :disabled="$v.name.$invalid || $v.name.$invalid"
          @click.native="$router.push('/recover/password')"
        />
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
export default {
  name: `session-import-name`,
  components: {
    TmBtn,
    TmField,
    SessionFrame,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
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
  validations: () => ({
    name: { required, minLength: minLength(5) }
  })
}
</script>
