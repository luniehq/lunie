<template>
  <header class="header">
    <div class="header-top-column">
      <div class="header-top-row">
        <div>
          <BackButton />
        </div>

        <div class="inner-status">
          <Status :status="status" />
        </div>

        <div class="buttons">
          <button
            v-clipboard:copy="currentRoute"
            v-clipboard:success="() => onCopy()"
            class="share-button"
          >
            <span v-if="copySuccess" class="copy-message">Copied!</span>
            <i v-if="copySuccess" class="material-icons check-icon">check</i>
            <i v-else class="material-icons">link</i>
          </button>
          <TmBtn
            v-if="status.value === governanceStatusEnum.DEPOSITING"
            id="deposit-btn"
            class="action-button"
            value="Deposit"
            color="primary"
            @click.native="$emit(`open-deposit-modal`)"
          />
          <TmBtn
            v-if="showVoteButton"
            id="vote-btn"
            class="action-button"
            value="Vote"
            color="primary"
            @click.native="$emit(`open-vote-modal`)"
          />
        </div>
      </div>

      <div class="outer-status">
        <Status :status="status" />
      </div>
    </div>

    <div class="content-container">
      <h2>{{ proposal.title }}</h2>

      <div class="proposer-and-summary-container">
        <div v-if="proposal.proposer" class="proposer">
          Proposed By:
          {{ proposal.proposer.address | formatAddress }}
        </div>
        <p class="summary">{{ proposal.summary }}</p>
      </div>
    </div>

    <nav>
      <ul class="page-links">
        <li><a v-scroll-to="'#proposal-votes'" href="#">Votes</a></li>
        <li><a v-scroll-to="'#proposal-timeline'" href="#">Timeline</a></li>
        <li>
          <a v-scroll-to="'#proposal-description'" href="#">Description</a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
import { mapGetters } from "vuex"
import { governanceStatusEnum } from "scripts/proposal-status"
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
    proposal: {
      type: Object,
      required: true,
    },
    status: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    copySuccess: false,
    governanceStatusEnum,
  }),
  computed: {
    ...mapGetters([`currentNetwork`]),
    currentRoute() {
      return location.href
    },
    showVoteButton() {
      // when the proposal is a Treasury proposal we won't show the Vote button
      // for all Polkadot proposals we display the Vote button except for treasuries
      // in Cosmos only for the ones in Voting Period (we consider Polkadot democracies proposals as Deposit Period)
      return (
        this.proposal.type !== `TREASURY` &&
        this.status.value === this.governanceStatusEnum.VOTING
      )
    },
  },
  methods: {
    onCopy() {
      this.copySuccess = true
      setTimeout(() => {
        this.copySuccess = false
      }, 2500)
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

.header-top-row {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 4rem;
}

.header-top-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-top-row > div:first-child,
.header-top-row > div:last-child {
  width: 33%;
  display: flex;
}

.header-top-row > div:last-child {
  justify-content: flex-end;
}

h2 {
  font-size: 32px;
  margin-bottom: 2rem;
  max-width: 500px;
  color: var(--bright);
  padding-right: 2rem;
}

.page-links {
  display: flex;
}

.page-links li {
  display: inline-block;
  padding: 2rem 2rem 2rem 0;
}

.action-button {
  margin-left: 0.5rem;
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
  font-size: 14px;
  background: transparent;
  color: #7a88b8;
  border: 2px solid rgb(122, 136, 184, 0.1);
  cursor: pointer;
  width: 3rem;
  position: relative;
}

.share-button:hover {
  background-color: var(--bc);
}

.icon-container {
  margin: 0 0.5rem 0 0;
}

.icon-container .success {
  opacity: 0;
  transition: opacity 250ms ease;
}

.icon-container.active .success {
  opacity: 1;
}

.outer-status {
  display: none;
}

.check-icon {
  font-size: 18px;
  color: var(--success);
}

.copy-message {
  position: absolute;
  font-size: 10px;
  top: -1.25rem;
  color: var(--success);
}

@media screen and (max-width: 667px) {
  .inner-status {
    display: none;
  }

  .outer-status {
    display: initial;
  }

  .header-top-row {
    padding: 0 0 2rem;
  }

  .header-top-column {
    padding: 0 0 4rem;
  }
}

@media screen and (max-width: 1023px) {
  h2 {
    padding-right: 0;
  }

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
