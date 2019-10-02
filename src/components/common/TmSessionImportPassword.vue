<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit.bind(this)">
      <h2 class="session-title">
        Recover with backup code
      </h2>
      <div class="session-main">
        <TmFormGroup
          :error="$v.$error && $v.password.$invalid"
          field-id="import-password"
          field-label="Password"
        >
          <TmField
            id="import-password"
            v-model="password"
            type="password"
            placeholder="Must be at least 10 characters"
          />
          <TmFormMsg
            v-if="$v.password.$error && !$v.password.required"
            name="Password"
            type="required"
          />
          <TmFormMsg
            v-if="$v.password.$error && !$v.password.minLength"
            name="Password"
            type="minLength"
            min="10"
          />
        </TmFormGroup>
        <TmFormGroup
          :error="$v.$error && $v.passwordConfirm.$invalid"
          field-id="import-password-confirmation"
          field-label="Confirm Password"
        >
          <TmField
            id="import-password-confirmation"
            v-model="passwordConfirm"
            type="password"
            placeholder="Enter password again"
          />
          <TmFormMsg
            v-if="
              $v.passwordConfirm.$error && !$v.passwordConfirm.sameAsPassword
            "
            name="Password confirmation"
            type="match"
          />
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn value="Create" />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import { required, minLength, sameAs } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import SessionFrame from "common/SessionFrame"
import { mapState } from "vuex"
export default {
  name: `session-import-password`,
  components: {
    TmBtn,
    TmField,
    SessionFrame,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  computed: {
    ...mapState([`recover`]),
    password: {
      get() {
        return this.$store.state.recover.password
      },
      set(value) {
        this.$store.commit(`updateField`, { field: `password`, value })
      }
    },
    passwordConfirm: {
      get() {
        return this.$store.state.recover.passwordConfirm
      },
      set(value) {
        this.$store.commit(`updateField`, { field: `passwordConfirm`, value })
      }
    }
  },
  methods: {
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        await this.$store.dispatch(`createKey`, {
          seedPhrase: this.recover.seed,
          password: this.recover.password,
          name: this.recover.name
        })
        this.$router.push(`/recover/success`)
      } catch (error) {
        this.$store.commit(`notifyError`, {
          title: `Couldn't create account`,
          body: error.message
        })
      }
    }
  },
  validations: () => ({
    password: { required, minLength: minLength(10) },
    passwordConfirm: { sameAsPassword: sameAs(`password`) }
  })
}
</script>
