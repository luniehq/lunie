<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit.bind(this)">
      <h2 class="session-title">
        Create a new address — Confirm Seed
      </h2>
      <div v-if="session.insecureMode" class="session-main">
        <div class="danger-zone">
          <h2>DANGER ZONE</h2>
          <p>
            Creating an address in the browser is not advised. This feature is
            only enabled in insecure mode for testing purposes and should not be
            used otherwise.
          </p>
        </div>
        <TmFormGroup
          field-id="sign-up-seed"
          class="sign-up-seed-group"
          field-label="Seed Phrase"
        >
          <FieldSeed id="sign-up-seed" v-model="fieldSeed" />
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
        <div class="session-footer">
          <TmBtn value="Create Address" />
        </div>
      </div>
      <div v-if="!session.insecureMode" class="session-main">
        <p>
          Creating an address in the browser is unsafe. To offer you a secure
          alternative we will be releasing a browser extension and a mobile app
          soon.
        </p>
        <p>
          In the meantime, you can create a new account outside of the browser
          by using a
          <a
            href="https://shop.ledger.com/?r=3dd204ef7508"
            target="_blank"
            rel="noopener norefferer"
            >Ledger Nano</a
          >
          or the
          <a
            href="https://hub.cosmos.network/docs/delegator-guide-cli.html#creating-an-account"
            target="_blank"
            rel="noopener norefferer"
            >command line</a
          >.
        </p>
        <router-link to="existing"
          >Want to use an existing address?</router-link
        >
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
// import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import FieldSeed from "common/TmFieldSeed"
import SessionFrame from "common/SessionFrame"
export default {
  name: `session-sign-up`,
  components: {
    TmBtn,
    // TmField,
    SessionFrame,
    FieldSeed,
    TmFormGroup,
    TmFormMsg,
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
        this.$router.push(`/create-confirm`)
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
