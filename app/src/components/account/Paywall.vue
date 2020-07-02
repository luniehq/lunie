<template>
  <div class="paywall-container">
    <h3>
      Lunie Notifications<br />
      are here!
    </h3>
    <TmBtn
      id="getStartedBtn"
      value="Get Started"
      @click.native="router.push({ name: `sign-in-modal` })"
    />
    <div class="table">
      <div class="table-column">
        <h4>Staking Rewards</h4>
        <ul>
          <li class="table-cell check">Unclaimed Rewards</li>
          <li class="table-cell check">Balance Updates</li>
          <li class="table-cell check">
            Undelegation Reminders
          </li>
          <li class="table-cell check">
            Transaction Confirmations
          </li>
        </ul>
      </div>

      <div class="table-column">
        <h4>Governance</h4>
        <ul>
          <li class="table-cell check">New Proposals</li>
          <li class="table-cell check">
            Proposal State Changes
          </li>
          <li class="table-cell check">
            Deposit and Voting Reminders
          </li>
          <li class="table-cell check">
            Know How Your Validators Vote
          </li>
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
        <h4>Network Updates</h4>
        <ul>
          <li class="table-cell check">News</li>
          <li class="table-cell check">Protocol Upgrades</li>
          <li class="table-cell check">Github Alerts</li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import TmBtn from "src/components/common/TmBtn"
export default {
  name: `paywall`,
  components: {
    TmBtn,
  },
}
</script>
<style scoped>
h3 {
  margin-top: 4rem;
  font-size: 32px;
  line-height: 44px;
  text-align: center;
  color: #fff;
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

.paywall-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.table {
  display: flex;
  padding: 4rem 2rem;
  justify-content: space-between;
  flex-direction: row;
  flex-wrap: wrap;
  color: #324175;
}

.table-column {
  padding: 0 1.5rem;
  margin: 1rem;
  box-shadow: 0 0 3px hsla(232, 14.1%, 69.4%, 0.4);
  border-radius: 0.25rem;
  flex: 1 0 250px;
  background-color: #fff;
}

.table-column.networks {
  background-color: #daf7e6;
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

.table-column.dark {
  background: #272b49;
}

.table-column.dark h4 {
  color: white;
}

.table-column.dark .table-cell {
  color: white;
}

.table-cell {
  width: 100%;
  font-size: 14px;
  color: #324075;
  padding: 1rem 0;
  display: flex;
  align-items: center;
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
</style>
