<template>
  <header class="header">
    <div class="header-top">
      <div>
        <button><i class="material-icons">arrow_back</i>Proposals</button>
      </div>
      <div>
        <span v-if="votingPeriod">Voting Period</span>
        <span v-if="depositPeriod">Deposit Period</span>
      </div>
      <div>
        <button><i class="material-icons">link</i>Link</button>
        <button><i class="material-icons">share</i>Twitter</button>
        <button>Vote</button>
      </div>
    </div>
    <h2>{{ title }}</h2>
    <div>
      <div>
        Proposer:
        {{ proposer.img }}
        {{ proposer.name }}
        {{ proposer.address }}
      </div>
      <p>{{ summary }}</p>
    </div>
    <nav>
      <ul class="supporting-links">
        <li><a href="">Validators</a></li>
        <li><a href="">Timeline</a></li>
        <li><a href="">Description</a></li>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {
  name: `proposal-header`,
  data: () => ({
    title: `Stargate Upgrade Proposal 1`,
    summary: `Signalling proposal for the cosmoshub-3 -> cosmoshub-4 upgrade`,
    proposer: {
      img: ``,
      name: `iqlusion`,
      address: `cosmos1grgelyng2v6v3t8z87wu3sxgt9m5s03xvslewd`,
    },
    depositPeriod: false,
    votingPeriod: true,
  }),
}
</script>

<style scoped>
.header {
  padding: 2rem;
}

.header-top {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 2rem;
}

h2 {
  font-size: 32px;
  margin-bottom: 2rem;
}

.supporting-links li {
  display: inline-block;
  padding: 2rem 2rem 2rem 0;
}
</style>
