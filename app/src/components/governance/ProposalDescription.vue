<template>
  <div class="proposal-description">
    <section>
      <h4>Description</h4>
      <p class="description">
        {{ description }}
      </p>
    </section>
    <aside class="supporting-links">
      <h4>Supporting Links</h4>
      <ul>
        <li v-for="link in supportingLinks" :key="link.url">
          <a href="link.url">{{ link.title }}</a>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script>
export default {
	name: `proposal-description`,
	data: () => ({
		description: `Stargate is our name for the process of ensuring that the widely integrated public network known as the Cosmos Hub is able to execute the cosmoshub-3 -> cosmoshub-4 upgrade with the minimum disruption to its existing ecosystem. This upgrade will also realize the Internet of Blockchains vision from the Cosmos whitepaper.
Integrations from ecosystem partners are at risk of breaking changes due to the Stargate changes. These changes drive the need for substantial resource and time requirements to ensure successful migration. Stargate represents a unique set of circumstances and is not intended to set precedent for future upgrades which are expected to be less dramatic.
There is a widespread consensus from many Cosmos stakeholders that these changes to core software components will enhance the performance and composability of the software and the value of the Cosmos Hub in a world of many blockchains.
A Yes result on this proposal provides a clear signal that the Cosmos Hub accepts and understands the Stargate process and is prepared to approve an upgrade with proposed changes if the plan below is executed successfully.
A No result would force a reconsideration of the tradeoffs in the Alternatives section and the forming a new plan to deliver IBC.
See the full proposal here: https://ipfs.io/ipfs/Qmbo3fF54tX3JdoHZNVLcSBrdkXLie56Vh2u29wLfs4PnW`,
	supportingLinks: [
		{ 
			title: `IPFS`,
			url: `https://ipfs.io/ipfs/Qmbo3fF54tX3JdoHZNVLcSBrdkXLie56Vh2u29wLfs4PnW` 
		},
		{ 
			title: `Cosmos Forum`,
			url: `https://forum.cosmos.network/c/governance/16` 
		}
	],
  }),
}
</script>

<style scoped>
.proposal-description {
  padding: 2rem;
  display: flex;
}

.description {
  max-width: 640px;
  margin: 0 4rem 0 0;
  padding: 0 0 4rem 0;
  white-space: pre-wrap;
}

.supporting-links {
  width: 100%;
  padding: 0 0 4rem 0;
}

@media screen and (max-width: 1024px) {
  .proposal-description {
    display: block;
    word-break: break-word;
    text-align: justify;
  }

  .description {
    margin: 0;
  }
}
</style>