<template>
  <SessionFrame :hide-back="true">
    <div id="session-welcome">
      <img class="lunie-logo" src="../images/lunie-logo-white.svg" />

      <div class="session-list">
        <LiSession
          id="create-new-address"
          icon="person_add"
          title="Create a new address"
          route="create"
        />
        <LiSession
          id="recover-with-backup"
          icon="settings_backup_restore"
          title="Recover with backup code"
          route="recover"
        />
        <LiSession
          v-if="accounts.length > 0"
          id="see-accounts"
          icon="person"
          title="See existing accounts"
          route="/"
        />
      </div>

      <p class="footnote">
        By using Lunie, you accept our
        <a
          href="https://lunie.io/#/terms"
          target="_blank"
          rel="nofollow noreferrer noopener"
          >Terms of Service</a
        >
        and
        <a
          href="https://lunie.io/#/privacy"
          target="_blank"
          rel="nofollow noreferrer noopener"
          >Privacy Policy</a
        >.
      </p>
    </div>
  </SessionFrame>
</template>

<script>
import SessionFrame from 'common/SessionFrame'
import LiSession from 'common/TmLiSession'
export default {
  name: `session-welcome`,
  components: {
    SessionFrame,
    LiSession
  },
  computed: {
    accounts() {
      return this.$store.state.accounts
    }
  }
}
</script>
<style scoped>
.session-title {
  padding-left: 1rem;
  font-size: 28px;
  line-height: normal;
  padding-bottom: 0;
}

.lunie-logo {
  margin: 1rem 0 1rem 1rem;
}

.session-paragraph {
  padding: 0 1rem;
}
</style>
