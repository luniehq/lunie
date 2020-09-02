<template>
  <header class="header">
    <div class="header-top">
      <div>
        <BackButton />
      </div>

      <div>
        <Status :status="status" />
      </div>

      <div class="buttons">
        <button class="share-button">
          <i class="material-icons">link</i>
        </button>
        <TmBtn
          v-if="status.badge === 'Deposit Period'"
          id="deposit-btn"
          value="Deposit"
          color="primary"
          @click.native="$emit(`open-deposit-modal`)"
        />
        <TmBtn
          v-if="status.badge === 'Voting Period'"
          id="vote-btn"
          value="Vote"
          color="primary"
          @click.native="$emit(`open-vote-modal`)"
        />
      </div>
    </div>

    <div class="content-container">
      <h2>{{ title }}</h2>

      <div class="proposer-and-summary-container">
        <div class="proposer">
          Proposed By:
          {{ proposer | formatAddress }}
        </div>
        <p class="summary">{{ summary }}</p>
      </div>
    </div>

    <nav>
      <ul class="page-links">
        <li><a href="">Votes</a></li>
        <li><a href="">Timeline</a></li>
        <li><a href="">Description</a></li>
      </ul>
    </nav>
  </header>
</template>

<script>
import BackButton from "common/BackButton"
import { formatAddress } from "src/filters"
import Status from "common/Status"
import TmBtn from "common/TmBtn"

export default {
  name: `proposal-header`,
  components: {
    BackButton,
    Status,
    TmBtn,
  },
  filters: {
    formatAddress,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    proposer: {
      type: String,
      default: `n/a`,
    },
    status: {
      type: Object,
      required: true,
    },
  },
  computed: {
    summary() {
      switch (this.type) {
        case `TEXT`:
          return `This is a text proposal. Text proposals can be proposed by anyone and are used as a signalling mechanism for this community. If this proposal is accepted, nothing will change without community coordination.`
        case `PARAMETER_CHANGE`:
          return `This is a parameter change proposal. Parameter change proposals can be proposed by anyone and include changes to the code of this network. If this proposal is approved the underlying code will change.`
        case `COUNCIL`:
          return `This is a council proposal. Council proposals are proposed by council members who hold a special status in this network.`
        case `TREASURY`:
          return `This is a treasury proposal. Treasury proposals can be proposed by anyone and are a request for funds from the treasury / community pool.`
        default:
          return `Unknown proposal type`
      }
    },
  },
}
</script>

<style scoped>
.header {
  padding: 2rem 0 0;
  border-bottom: 2px solid var(--bc-dim);
  max-width: 1024px;
  margin: 0 auto;
  width: 100%;
}

.header-top {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 4rem;
}

.header-top > div:first-child,
.header-top > div:last-child {
  width: 33%;
  display: flex;
}

.header-top > div:last-child {
  justify-content: flex-end;
}

h2 {
  font-size: 32px;
  margin-bottom: 2rem;
  max-width: 500px;
  color: var(--bright);
}

.page-links {
  display: flex;
}

.page-links li {
  display: inline-block;
  padding: 2rem 2rem 2rem 0;
}

.buttons {
  display: flex;
  align-items: center;
}

.content-container {
  display: flex;
  justify-content: space-between;
}

.proposer-and-summary-container {
  max-width: 320px;
}

.proposer {
  font-size: 12px;
  padding: 1rem;
  border: 2px solid var(--bc);
  border-radius: 0.25rem;
}

.summary {
  font-size: 12px;
  padding: 2rem 0 0 2px;
  font-style: italic;
}

.share-button {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  outline: none;
  height: 2.25rem;
  width: auto;
  font-size: 14px;
  background: transparent;
  color: #7a88b8;
  border: 2px solid rgb(122, 136, 184, 0.1);
  cursor: pointer;
  margin-right: 0.5rem;
}

@media screen and (max-width: 1023px) {
  .content-container {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }

  .page-links {
    justify-content: center;
  }

  .page-links li {
    padding: 2rem 2rem;
  }
}
</style>
