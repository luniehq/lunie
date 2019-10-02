<template>
  <SessionFrame>
    <TmFormStruct :submit="() => {}">
      <h2 class="session-title">
        Recover with backup code
      </h2>
      <div class="session-main">
        <TmFormGroup
          :error="$v.$error && $v.seed.$invalid"
          field-id="import-seed"
          field-label="Backup code"
        >
          <FieldSeed
            id="import-seed"
            :value="seed"
            placeholder="Must be exactly 24 words"
            @input="val => (seed = val)"
          />
          <TmFormMsg
            v-if="$v.seed.$error && !$v.seed.required"
            name="Seed"
            type="required"
          />
          <TmFormMsg
            v-else-if="$v.seed.$error && !$v.seed.words24"
            name="Seed"
            type="words24"
          />
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn
          value="Confirm Seed"
          :disabled="$v.seed.$invalid || $v.seed.$invalid"
          @click.native="$router.push('recover-confirm-address')"
        />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import { mapState } from "vuex"
import { required } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmFormMsg from "common/TmFormMsg"
import FieldSeed from "common/TmFieldSeed"
import SessionFrame from "common/SessionFrame"

const words24 = param => {
  return param && param.split(` `).length === 24
}

export default {
  name: `session-import-backupcode`,
  components: {
    TmBtn,
    SessionFrame,
    FieldSeed,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  computed: {
    ...mapState([`session`]),
    seed: {
      get() {
        return this.$store.state.session.seed
      },
      set(value) {
        this.$store.commit(`updateField`, { field: `seed`, value })
      }
    }
  },
  validations: () => ({
    seed: { required, words24 }
  })
}
</script>
