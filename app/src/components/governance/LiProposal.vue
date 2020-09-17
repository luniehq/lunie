<template>
  <div
    class="li-proposal"
    @click="
      $router.push({
        name: 'proposal',
        params: { proposalId: String(proposal.id) },
      })
    "
  >
    <div class="proposal-content">
      <div>
        <div class="status-and-id">
          <Status :status="status" />
        </div>
        <h3 class="title">
          {{ proposal.title }}
        </h3>
      </div>
      <span v-if="proposal.creationTime" class="time">{{
        proposal.creationTime | moment
      }}</span>
      <span v-else class="time">n/a</span>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex"
import moment from "moment"
import { getProposalStatus } from "scripts/proposal-status"
import Status from "common/Status"

export default {
  name: `li-proposal`,
  components: {
    Status,
  },
  filters: {
    moment: function (date) {
      return moment(date).fromNow()
    },
  },
  props: {
    proposal: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState([`proposals`]),
    status() {
      return getProposalStatus(this.proposal)
    },
  },
}
</script>

<style scoped>
.title {
  font-size: 22px;
  color: var(--bright);
  font-weight: 500;
  max-width: 600px;
}

.li-proposal {
  padding: 2rem 0;
  margin: 0 auto;
  display: block;
  cursor: pointer;
  max-width: 1024px;
  width: 100%;
  border-bottom: 2px solid var(--bc-dim);
}

.li-proposal:first-child {
  border-top: 2px solid var(--bc-dim);
}

.li-proposal:hover {
  cursor: pointer;
}

.li-proposal:hover .title {
  color: var(--link);
}

.proposal-content {
  display: flex;
  justify-content: space-between;
}

.status-and-id {
  display: flex;
  padding-bottom: 1rem;
}

.time {
  align-self: flex-end;
  color: var(--dim);
  font-size: 14px;
}

@media screen and (max-width: 1023px) {
  .proposal-content {
    flex-direction: column;
  }

  .time {
    align-self: auto;
    padding-top: 1rem;
  }
}
</style>
