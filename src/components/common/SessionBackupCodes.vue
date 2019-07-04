<template>
  <div class="backup-code">
    <div class="backup-code-top">
      <h2>Use a backup code</h2>
    </div>
    <div>
      <p>
        We’ve recovered this address associated with your backup code. Click
        <i>next</i>
        to create an account for this address.
      </p>
    </div>
    <TmFormGroup field-id="to" field-label="Your address">
      <TmField id="to" :placeholder="address" type="text" readonly />
      <div class="backup-code-footer">
        <TmBtn value="Next" color="primary" />
      </div>
    </TmFormGroup>
  </div>
</template>

<script>
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmField from "common/TmField"

export default {
  name: `ext-backup-code`,
  components: {
    TmBtn,
    TmFormGroup,
    TmField
  },
  props: {
    address: {
      type: String,
      //Remove Default
      default: "cosmos1ek9cd8ewgxg9w5x3benji0uf4aaxaruvcw4v9e",
      required: true
    }
  }
}
</script>

<style scoped>
.backup-code {
  padding: 2rem;
  background: var(--fg);
  border-left: 1px solid var(--bc-dim);
}

.backup-code h2 {
  color: var(--bright);
  font-size: var(--h1);
  font-weight: 500;
  line-height: 3rem;
}

.card {
  background: var(--app-nav);
  border-radius: 2px;
  padding: 1rem;
  font-size: var(--m);
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc);
}

.card h3 {
  font-size: 14px;
  font-weight: 400;
}

.content-left {
  display: flex;
  flex-direction: column;
}

.backup-code-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem 0 1rem;

  /* keeps button in bottom right no matter the size of the action modal */
  flex-grow: 1;
  align-self: flex-end;
}
</style>
