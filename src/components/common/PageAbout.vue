<template>
  <TmPage data-title="About" hide-header>
    <div class="container">
      <div class="card">
        <h1>About</h1>
        <p>
          Lunie is your one-stop-shop for sending and receiving Cosmos tokens,
          viewing your transaction history, delegating your ATOMs, and
          participating in governance on the Cosmos Hub.
        </p>
        <p>
          This software is developed by the team at Lunie Internation Software
          Systems. It's
          <a
            href="https://github.com/luniehq/lunie"
            target="_blank"
            rel="noopener norefferer"
          >
            open source
          </a>
          and built for the
          <a
            href="https://cosmos.network"
            target="_blank"
            rel="noopener norefferer"
          >
            Cosmos
          </a>
          community.
        </p>
        <p>
          For your safety and security, Lunie will not ask for or store your
          private keys or seed phrases. For now, to send transactions with
          Lunie, you'll have to sign them with your Ledger Nano&nbsp;S.
        </p>
        <p>
          You can try Lunie on our testnet by visiting
          <a
            href="https://testnet.lunie.io"
            target="_blank"
            rel="noopener norefferer"
          >
            testnet.lunie.io </a
          >.
        </p>
      </div>
      <div class="card">
        <h1>Team</h1>
        <div class="flex-row">
          <div class="profile">
            <img src="~assets/images/team/fabo.jpg" />
            <div class="profile-info">
              <span>Fabian Weber</span>
              <span class="flag">🇩🇪</span>
            </div>
          </div>
          <div class="profile">
            <img src="~assets/images/team/jordan.jpg" />
            <div class="profile-info">
              <span>Jordan Bibla</span>
              <span class="flag">🇨🇦</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <h1>Contact</h1>
        <p>
          Please let us know what you think! You can find us on
          <a
            href="https://github.com/cosmos/lunie"
            target="_blank"
            rel="noopener norefferer"
          >
            GitHub</a
          >
          and
          <a
            href="https://twitter.com/luniehq"
            target="_blank"
            rel="noopener norefferer"
            >Twitter</a
          >, email us at
          <a
            href="mailto:contact@lunie.io"
            target="_blank"
            rel="noopener norefferer"
          >
            contact[at]lunie.io </a
          >, or click the <i>feedback</i> button on the left.
        </p>
      </div>
    </div>
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"
export default {
  name: `page-about`,
  components: {
    TmPage
  }
}
</script>

<style scoped>
h1 {
  font-size: var(--xxl);
  color: var(--bright);
  margin-bottom: 1rem;
  font-weight: 500;
}

.container {
  display: flex;
  flex-direction: column;
}

.card {
  background: var(--app-fg);
  max-width: 600px;
  padding: 2rem;
  margin: 1rem;
  border-radius: 0.25rem;
}

p {
  margin-bottom: 1rem;
  font-size: var(--m);
  line-height: 1.5;
  font-weight: 400;
}

i {
  font-style: italic;
}

.profile {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid var(--bc);
  background: var(--app-bg);
  border-radius: 0.25rem;
}

.profile-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  width: 100%;
}

.flag {
  font-size: var(--xl);
}

.profile img {
  height: 3rem;
  width: 3rem;
  border-radius: 50%;
  margin-right: 1rem;
  object-fit: cover;
}
</style>
