<template>
  <div class="tool-bar">
    <slot />
    <a v-if="session.signedIn" id="signOut-btn" @click="signOut()">
      <i v-tooltip.bottom.end="'Sign Out'" class="material-icons">
        exit_to_app
      </i>
    </a>
    <TmBtn
      v-if="!session.signedIn"
      class="sign-in-button"
      value="Sign In"
      color="primary"
      @click.native="signIn()"
    />
  </div>
</template>

<script>
import { mapState } from "vuex"
import TmBtn from "common/TmBtn"
export default {
  name: `tool-bar`,
  components: { TmBtn },
  props: {
    displayText: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState([`session`])
  },
  methods: {
    signIn() {
      this.$router.push(`/welcome`)
    },
    signOut() {
      this.$store.dispatch(`signOut`)
    }
  }
}
</script>
<style scoped>
.tool-bar {
  display: flex;
  align-items: center;
  max-height: 2rem;
  justify-content: flex-end;
  width: 100%;
}

.sign-in-button {
  margin-left: 1rem;
}

.tool-bar i {
  padding: 0.5rem;
}

.tool-bar i,
.tool-bar a {
  color: var(--dim);
  font-size: var(--lg);
  display: flex;
  align-items: center;
}

.tool-bar i:hover {
  background: var(--app-nav);
  padding: 0.5rem;
  border-radius: 50%;
}

.tool-bar a:hover {
  cursor: pointer;
  color: var(--bright);
}

@media screen and (max-width: 1023px) {
  .tool-bar a {
    display: none;
  }

  .sign-in-button {
    display: none;
  }
}
</style>
