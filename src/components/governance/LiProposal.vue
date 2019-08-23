<template>
  <tr
    class="li-proposal"
    @click="
      $router.push({
        name: 'Proposal',
        params: { proposalId: proposal.proposal_id }
      })
    "
  >
    <td>
      <span
        :class="proposal.proposal_status | lowerCase"
        class="proposal-status"
      >
        {{ proposal.proposal_status }}
      </span>
      <h3 class="li-proposal-title">
        {{ proposal.title }}
      </h3>
      <p class="li-proposal-description">
        {{ proposal.description | trim(200) }}
      </p>
      <router-link
        :to="`/proposals/` + proposal.proposal_id"
        class="read-more-link"
      >
        Read the full proposal…
      </router-link>
    </td>
  </tr>
</template>

<script>
export default {
  name: `li-proposal`,
  filters: {
    trim: function(text, length) {
      return text.length > length ? text.substring(0, length) + `…` : text
    },
    lowerCase: s => s.toLowerCase()
  },
  props: {
    proposal: {
      type: Object,
      required: true
    }
  }
}
</script>
<style scoped>
.li-proposal {
  margin: 1rem 0;
  padding: 1rem 0;
  display: block;
  cursor: pointer;
  max-width: 680px;
  background: var(--app-fg);
  border-radius: 0.25rem;
  border: 1px solid var(--bc-dim);
}

.li-proposal:hover {
  cursor: pointer;
  background: var(--hover-bg);
}

.li-proposal-title {
  font-size: var(--xl);
  line-height: 32px;
  color: var(--bright);
  font-weight: 500;
  display: block;
  padding: 1rem 0 0.5rem 0;
}

.li-proposal-description {
  word-break: break-word;
  color: var(--txt);
  font-size: 14px;
}

.read-more-link {
  padding-top: 1rem;
  font-size: 14px;
  display: inline-block;
}

@media screen and (min-width: 667px) {
  .li-proposal {
    margin: 1rem auto;
  }
}
</style>
<style>
.proposal-status {
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 600;
  border: 2px solid;
  padding: 2px 4px;
  border-radius: 0.25rem;
  color: var(--grey);
  border-color: var(--grey);
}

.proposal-status.rejected {
  color: var(--danger);
  border-color: var(--danger);
}

.proposal-status.depositperiod {
  color: var(--warning);
  border-color: var(--warning);
}

.proposal-status.passed {
  color: var(--success);
  border-color: var(--success);
}

.proposal-status.votingperiod {
  color: var(--tertiary);
  border-color: var(--tertiary);
}
</style>
