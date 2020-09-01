<template>
  <div>
    <ProposalHeader />
    <ProposalStatusBar />
    <!-- Refactor required to use toggle and validator table -->
    <!-- <ValidatorTable /> -->
    <Timeline />
    <ProposalDescription />
  </div>
</template>

<script>
import ProposalDescription from "governance/ProposalDescription"
import ProposalHeader from "governance/ProposalHeader"
import ProposalStatusBar from "governance/ProposalStatusBar"
import Timeline from "governance/Timeline"

export default {
  name: `page-proposal-2`,
  components: {
    ProposalDescription,
    ProposalHeader,
    ProposalStatusBar,
    Timeline,
  },
}
</script>
