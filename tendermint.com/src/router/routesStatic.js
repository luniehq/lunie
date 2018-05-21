import PageIndex from "comp/PageIndex"
import PageAbout from "comp/PageAbout"
import PageCareersIndex from "comp/PageCareersIndex"
import PageCareersEntry from "comp/PageCareersEntry"
import PageContribute from "comp/PageContribute"
import PageDownloads from "comp/PageDownloads"
import PageSoftwareEcosystem from "comp/PageSoftwareEcosystem"
import PagePresentationsIndex from "comp/PagePresentationsIndex"
import PagePresentationsEntry from "comp/PagePresentationsEntry"
import PagePress from "comp/PagePress"
import PagePrivacy from "comp/PagePrivacy"
import PageSecurity from "comp/PageSecurity"
import Page404 from "comp/Page404"

export default [
  { path: "/", component: PageIndex },
  { path: "/about", component: PageAbout },
  { path: "/careers", name: "careers", component: PageCareersIndex },
  { path: "/careers/:entry", component: PageCareersEntry },
  { path: "/contribute", component: PageContribute },
  { path: "/downloads", name: "downloads", component: PageDownloads },
  { path: "/ecosystem", component: PageSoftwareEcosystem },
  { path: "/presentations", component: PagePresentationsIndex },
  { path: "/presentations/:entry", component: PagePresentationsEntry },
  { path: "/press", component: PagePress },
  { path: "/privacy", component: PagePrivacy },
  { path: "/security", component: PageSecurity },
  { path: "/404", component: Page404 },
  { path: "*", component: Page404 }
]
