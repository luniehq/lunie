function r(type, pageName) {
  return require(`./components/${type}/Page${pageName}`).default
}

let common = r.bind(null, "common")
let govern = r.bind(null, "govern")
let staking = r.bind(null, "staking")
let wallet = r.bind(null, "wallet")

export default function(store) {
  return [
    {
      path: "/proposals",
      name: "proposals",
      component: govern("Proposals")
    },
    { path: "/proposals/new", component: govern("ProposalsNew") },
    { path: "/proposals/new/adjust", component: govern("ProposalsNewAdjust") },
    { path: "/proposals/new/amend", component: govern("ProposalsNewAmend") },
    { path: "/proposals/new/create", component: govern("ProposalsNewCreate") },
    { path: "/proposals/new/text", component: govern("ProposalsNewText") },
    {
      path: "/proposals/new/upgrade",
      component: govern("ProposalsNewUpgrade")
    },
    {
      path: "/proposals/:proposal",
      name: "proposal",
      component: govern("Proposal")
    },

    // STAKE
    {
      path: "/staking",
      name: "staking",
      component: staking("Staking")
    },
    {
      path: "/staking/bond",
      name: "bond",
      component: staking("Bond")
    },
    {
      path: "/staking/delegates/:delegate",
      name: "delegate",
      component: staking("Delegate")
    },

    {
      path: "/preferences",
      name: "preferences",
      component: common("Preferences")
    },

    {
      path: "/about",
      redirect: () => {
        store.commit("setAbout", true)

        return "/preferences"
      },
      name: "about"
    },

    {
      path: "/",
      name: "wallet",
      component: wallet("Wallet")
    },
    {
      path: "/wallet/send/:denom?",
      name: "send",
      props: true,
      component: wallet("Send")
    },
    {
      path: "/wallet/transactions",
      name: "transactions",
      component: wallet("Transactions")
    },

    { path: "/404", component: common("404") },
    { path: "*", component: common("404") }
  ]
}
