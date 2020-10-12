<template>
  <div class="paywall-container">
    <h3>
      Lunie Notifications<br />
      are here!
    </h3>
    <TmBtn
      id="getStartedBtn"
      value="Get Started"
      @click.native="$router.push({ name: `sign-in-modal` })"
    />
    <div id="line"></div>
    <div class="table">
      <div class="table-column">
        <h4>Staking Rewards</h4>
        <ul>
          <li class="table-cell check">Unclaimed Rewards</li>
          <li class="table-cell check">Balance Updates</li>
          <li class="table-cell check">Undelegation Reminders</li>
          <li class="table-cell check">Transaction Confirmations</li>
        </ul>
      </div>

      <div class="table-column">
        <h4>Governance</h4>
        <ul>
          <li class="table-cell check">New Proposals</li>
          <li class="table-cell check">Proposal State Changes</li>
          <li class="table-cell check">Deposit and Voting Reminders</li>
          <li class="table-cell check">Know How Your Validators Vote</li>
        </ul>
      </div>

      <div class="table-column">
        <h4>Validators</h4>
        <ul>
          <li class="table-cell check">Commission Changes</li>
          <li class="table-cell check">Slashing Events</li>
          <li class="table-cell check">Downtime Alerts</li>
          <li class="table-cell check">Profile Updates</li>
        </ul>
      </div>

      <div class="table-column networks">
        <div>
          <h4>Network Updates</h4>
          <ul>
            <li class="table-cell check">News</li>
            <li class="table-cell check">Protocol Upgrades</li>
            <li class="table-cell check">Github Alerts</li>
          </ul>
        </div>
        <div class="table-span">
          <a class="intercom-button" @click="handleIntercom()">
            Have any ideas? Share them with us!
          </a>
        </div>
      </div>
    </div>
    <div class="notifications">
      <div class="notification-scroller">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification long"
        >
          <div class="content">
            <div class="main">
              <img src="/img/icons/lunie.svg" width="32" />
              <p class="title">{{ notification.title }}</p>
            </div>
            <div class="notification-arrow">
              <i class="material-icons notranslate">chevron_right</i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex"
import TmBtn from "src/components/common/TmBtn"
export default {
  name: `paywall`,
  components: {
    TmBtn,
  },
  data: () => ({
    notifications: [
      {
        id: 1,
        title: `You have 50 ATOMs in unclaimed rewards. 🤑`,
      },
      {
        id: 2,
        title: `Your validator’s commission changed from 0%-2%. 😮`,
      },
      {
        id: 3,
        title: `New Proposal alert on Cosmos Hub! 🚨`,
      },
      {
        id: 4,
        title: `Proposal #42 is out of the deposit period and ready for voting! 🗳`,
      },
      {
        id: 5,
        title: `Your validator went offline for 300 blocks! 🔔`,
      },
      {
        id: 6,
        title: `🚨 New Proposal alert on Cosmos.`,
      },
      {
        id: 7,
        title: `💸 You have 25 DOTs waiting to be withdrawn.`,
      },
      {
        id: 8,
        title: `📉 Your validator is no longer in the active set.`,
      },
      {
        id: 9,
        title: `👍 Kava network upgraded from Kava-2 to Kava-3.`,
      },
      {
        id: 10,
        title: `🧊 The unstaking lock up period is coming to an end in 2 hours.`,
      },
      {
        id: 11,
        title: `❓ Your validator just voted — are you happy with how they voted?`,
      },
      {
        id: 12,
        title: `Your validator went offline for 2000 blocks! 🔔`,
      },
    ],
  }),
  computed: {
    ...mapState([`account`]),
    userSignedIn() {
      return this.account.userSignedIn
    },
  },
  watch: {
    userSignedIn: {
      immediate: true,
      handler(userSignedIn) {
        if (userSignedIn) {
          this.$router.push({
            name: `notifications`,
          })
        }
      },
    },
  },
  methods: {
    handleIntercom() {
      this.$store.dispatch(`displayMessenger`)
    },
  },
}
</script>
<style scoped>
h3 {
  margin-top: 4rem;
  font-size: 32px;
  line-height: 44px;
  text-align: center;
  color: var(--txt);
}

#getStartedBtn {
  margin-top: 2rem;
  min-width: 12rem;
  min-height: 3rem;
  background-color: #9b82ff;
  border: none;
  color: #fff;
  border-radius: 27px;
}

#line {
  margin-top: 3.5rem;
  border-bottom: solid 1px #7a88b8;
  width: 90%;
  opacity: 20%;
}

.paywall-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.table {
  display: flex;
  padding: 1rem 2rem;
  justify-content: space-between;
  flex-direction: row;
  flex-wrap: wrap;
  color: var(--bc);
}

.table-column {
  padding: 0 1.5rem;
  margin: 1rem;
  box-shadow: 0 0 3px hsla(232, 14.1%, 69.4%, 0.4);
  border-radius: 0.25rem;
  flex: 1 0 250px;
  background-color: var(--bright);
  max-width: 22rem;
  min-width: 17rem;
}

.table-cell {
  width: 100%;
  font-size: 14px;
  color: var(--bc);
  padding: 1rem 0;
  display: flex;
  align-items: center;
}

.table-span {
  position: absolute;
  left: 0;
  color: #7a88b8;
  margin: 2rem 0;
  cursor: pointer;
  font-size: 0.9rem;
}

.table-column.networks {
  position: relative;
  background-color: #daf7e6;
  max-height: 20rem;
  color: #324075;
}

.table ul {
  padding: 2rem 0;
  margin: 0;
}

.table-column h4 {
  text-align: center;
  padding: 2rem 0;
  border-bottom: 1px solid #e8e8e8;
  font-weight: 500;
}

.table-column.networks h4 {
  border-bottom: 1px solid #324075;
}

.table-column.networks .table-cell {
  color: #324075;
}

.check::before {
  content: "✔";
  box-shadow: 0 2px 4px hsla(143, 100%, 38.8%, 0.3);
  background: hsl(143, 100%, 38.8%);
  border-radius: 50%;
  height: 20px;
  min-width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  margin-right: 1rem;
}

.notifications {
  padding: 5rem 0;
  overflow: hidden;
}

.notification-scroller {
  display: flex;
  flex-direction: row;
  width: 100%;
  z-index: 2;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-name: ticker;
  animation-duration: 40s;
}

.notification-scroller:first-child {
  animation-duration: 120s;
  margin-bottom: 2rem;
}

.notification {
  display: flex;
  align-items: center;
  background: var(--bright);
  margin: 0.5rem;
  border-radius: 0.25rem;
  width: 100%;
  max-width: 700px;
  color: var(--bc);
  box-shadow: 0 0 3px hsla(232, 14.1%, 69.4%, 0.4);
  font-weight: 500;
  padding: 0 0.5rem;
}

.notification-arrow {
  margin-top: 0.5rem;
}

.notification .content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.notification .content .main {
  display: flex;
}

.notification .title {
  margin: 0.5rem;
  text-align: left;
}

.notification-types img {
  padding-right: 1rem;
}

.notification.long {
  min-width: 32rem;
}

.table-span span {
  display: flex;
  align-items: center;
}

.table-span .material-icons {
  margin-left: 0.5rem;
  font-size: 0.9rem;
}

@keyframes ticker {
  0% {
    -webkit-transform: translate3d(40%, 0, 0);
    transform: translate3d(40%, 0, 0);
    visibility: visible;
  }

  100% {
    -webkit-transform: translate3d(-70%, 0, 0);
    transform: translate3d(-70%, 0, 0);
  }
}
</style>
