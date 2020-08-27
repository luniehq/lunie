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
          v-if="status === 'DepositPeriod'"
          id="deposit-btn"
          value="Deposit"
          color="primary"
          @click.native="onDeposit"
        />
        <TmBtn
          v-if="status === 'VotingPeriod'"
          id="vote-btn"
          value="Vote"
          color="primary"
          @click.native="() => onVote()"
        />
      </div>
    </div>
    <h2>{{ title }}</h2>
    <div>
      <div>
        Proposer:
        {{ proposer }}
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
import BackButton from "common/BackButton"
import Status from "common/Status"
import TmBtn from "common/TmBtn"

export default {
  name: `proposal-header`,
  components: {
    BackButton,
    Status,
    TmBtn,
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
      type: String,
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

.header-top div {
  /* width: 33%; */
}

h2 {
  font-size: 32px;
  margin-bottom: 2rem;
}

.supporting-links li {
  display: inline-block;
  padding: 2rem 2rem 2rem 0;
}

.buttons {
  display: flex;
  align-items: center;
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
