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
          Proposer:
          {{ proposer | formatAddress }}
        </div>
        <p class="summary">{{ summary | trim(200) }}</p>
      </div>
    </div>

    <nav>
      <ul class="supporting-links">
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
    trim: function (text, length) {
      return text.length > length ? text.substring(0, length) + `…` : text
    },
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    proposer: {
      type: String,
      required: true,
    },
    status: {
      type: Object,
      required: true,
    },
  },
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
  max-width: 500px;
}

.supporting-links li {
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
  border: 1px solid var(--bc-dim);
  border-radius: 0.25rem;
}

.summary {
  padding-top: 2rem;
  font-size: 12px;
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
</style>
