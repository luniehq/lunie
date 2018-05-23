import config from "../store/modules/config.js"
export default [
  { path: "/posts", redirect: "/blog" },
  { path: "/posts/:entry", redirect: "/blog" },
  { path: "/blog/:entry", redirect: "/blog" },
  { path: "/code", redirect: "/docs" },
  { path: "/download", redirect: "/downloads" },
  { path: "/guide", redirect: "/docs" },
  { path: "/jobs", redirect: "/careers" },
  { path: "/jobs/:entry", redirect: "/careers/:entry" },
  { path: "/media", redirect: "/presentations" },
  { path: "/media/:entry", redirect: "/presentations/:entry" },
  { path: "/guides/contributing", redirect: "/docs/guides/contributing" },
  {
    path: "/apply",
    beforeEnter: () => {
      window.location.assign(config.state.CAREER_APPLICATION_URL)
    }
  },
  {
    path: "/blog",
    beforeEnter: () => {
      window.location.assign("https://blog.cosmos.network/tendermint/home")
    }
  },
  {
    path: "/docs*",
    beforeEnter: () => {
      window.location.assign("https://tendermint.readthedocs.io/en/master/")
    }
  },
  {
    path: "/github",
    beforeEnter: () => {
      window.location.assign("https://github.com/tendermint")
    }
  },
  {
    path: "/join",
    beforeEnter: () => {
      window.location.assign(config.state.CAREER_APPLICATION_URL)
    }
  }
]
