<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit.bind(this)">
      <h2 class="session-title">
        Create a new address — Done!
      </h2>
      <div>
        <p>🎈🎈🎈 Congratulations! 🎈🎈🎈</p>
        <router-link to="/" tag="button">Go to Lunie Home</router-link>
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import { mapState } from "vuex"
import { required, minLength, sameAs } from "vuelidate/lib/validators"
// import TmBtn from "common/TmBtn"
// import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
// import TmField from "common/TmField"
// import TmFormMsg from "common/TmFormMsg"
// import FieldSeed from "common/TmFieldSeed"
import SessionFrame from "common/SessionFrame"
export default {
  name: `session-sign-up`,
  components: {
    // TmBtn,
    // TmField,
    SessionFrame,
    // FieldSeed,
    // TmFormGroup,
    // TmFormMsg,
    TmFormStruct
  },
  data: () => ({
    // fields: {
    //   signUpName: ``,
    //   signUpSeed: `Creating seed...`,
    //   signUpPassword: ``,
    //   signUpPasswordConfirm: ``,
    //   signUpWarning: false
    // }
  }),
  computed: {
    ...mapState([`session`, `signup`]),
    fieldName: {
      get() {
        return this.$store.state.signup.signUpName
      },
      set(value) {
        this.$store.commit(`updateField`, { field: `signUpName`, value })
      }
    },
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
    },
    fieldSeed: {
      get() {
        return this.$store.state.signup.signUpSeed
      },
      set(value) {
        this.$store.commit(`updateField`, { field: `signUpSeed`, value })
      }
    },
    fieldWarning: {
      get() {
        return this.$store.state.signup.signUpName
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
  methods: {
    updateField(e) {
      this.$store.commit(`updateField`, `field`, e.target.value)
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        await this.$store.dispatch(`createKey`, {
          seedPhrase: this.fieldSeed,
          password: this.fieldPassword,
          name: this.fieldName
        })
        this.$router.push(`/`)
      } catch (error) {
        this.$store.commit(`notifyError`, {
          title: `Couldn't create account`,
          body: error.message
        })
      }
    }
  },
  validations: () => ({
    // fields: {
    fieldName: { required, minLength: minLength(5) },
    fieldPassword: { required, minLength: minLength(10) },
    fieldPasswordConfirm: { sameAsPassword: sameAs(`fieldPassword`) },
    fieldWarning: { required: sameAs(() => true) },
    errorCollection: false
    // }
  })
}
</script>

<style scoped>
.danger-zone {
  border: 2px solid var(--danger-bc);
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  padding: 1rem;
}

.danger-zone p {
  font-size: var(--sm);
  color: var(--danger);
  margin: 0;
}

.danger-zone h2 {
  font-weight: 700;
  font-size: var(--m);
  color: var(--danger);
  padding-bottom: 0.25rem;
}
</style>
