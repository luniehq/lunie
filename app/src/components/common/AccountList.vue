<template>
  <ul class="account-list">
    <li v-for="account in accounts" :key="account.name" class="account">
      <div class="account-info">
        <h3>{{ account.name }}</h3>
        <Address :address="account.address" />
      </div>
      <TmBtn
        v-if="buttonAction"
        class="account-button"
        :value="buttonText"
        color="primary"
        @click.native="buttonAction(account)"
      />
      <div class="account-dropdown-toggle">
        <i class="material-icons notranslate" @click="openAccountDropDown()">more_vert</i>   
      </div>
    </li>
    <TmFormGroup
      v-if="accountDropDownToggle"
      class="action-modal-form-group"
      field-id="account-dropdown"
      field-label="Select"
    >
      <TmField
        id="account-dropdown-option"
        title="Select"
        :options="[`Show Seed`, `Export Account`]"
        type="select"
      />
    </TmFormGroup>
  </ul>
</template>

<script>
import TmFormGroup from "src/components/common/TmFormGroup"
import TmField from "src/components/common/TmField"
import Address from "common/Address"
import TmBtn from "common/TmBtn"
export default {
  name: `account-list`,
  components: {
    TmFormGroup,
    TmField,
    Address,
    TmBtn,
  },
  props: {
    accounts: {
      type: Array,
      required: true,
    },
    buttonAction: {
      type: Function,
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    accountDropDownToggle: false,
  }),
  methods: {
    openAccountDropDown() {
      this.accountDropDownToggle = !this.accountDropDownToggle
    }
  }
}
</script>
<style scoped>
.account-list {
  padding: 2rem 0;
}

.account {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--app-fg);
  border-radius: 0.25rem;
  border: 2px solid var(--bc-dim);
}

.account h3 {
  color: var(--bright);
  font-weight: 500;
  font-size: 14px;
}

.account-info {
  display: flex;
  flex-direction: column;
}

.account-button {
  padding: 0.25rem 0.5rem;
}

.account-dropdown-toggle {
  cursor: pointer;
}
</style>
