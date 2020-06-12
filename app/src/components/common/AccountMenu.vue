<template>
  <div class="account-menu">
    <div>
      Balance
    </div>
    <div class="account-menu-buttons">
      <div
        class="account-menu-button account-menu-edit"
        @click="accountMenuController(`edit`)"
      >
        <i class="material-icons notranslate">create</i>
      </div>
      <div
        class="account-menu-button account-menu-delete"
        @click="accountMenuController(`delete`)"
      >
        <i class="material-icons notranslate" style="color: #f67f70;">delete</i>
      </div>
      <div
        class="account-menu-button account-menu-show-seed"
        @click="accountMenuController(`show-seed`)"
      >
        <i class="material-icons notranslate" style="color: #3d728e;"
          >visibility</i
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: `account-menu`,
  methods: {
    accountMenuController(command) {
      if (command === `show-seed`) {
        this.$store.dispatch(`getEncryptedWallet`)
      }
    },
  },
}
</script>
<style scoped>
.account-menu {
  display: flex;
  justify-content: space-between;
}

.account-menu-buttons {
  display: flex;
}

.account-menu-button {
  cursor: pointer;
  border-radius: 50%;
  padding: 0.5em;
  height: 2.5em;
  width: 2.5em;
}

.account-menu-button.account-menu-edit {
  background: #62d08e;
}

.account-menu-button.account-menu-delete {
  background: #fad3cd;
}

.account-menu-button.account-menu-show-seed {
  background: #b0d1e3;
}
</style>
