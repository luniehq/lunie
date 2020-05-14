<template>
  <TmPage hide-header>
    <div class="header">
      <i>🔔</i>
    </div>
    <div
      v-for="notification in notificationsMock"
      :key="notification.id"
      class="notification"
    >
      <div class="content">
        <img :src="notification.icon" />
        <!-- <p class="title">{{ notification.title }}</p> -->
        <p class="body">{{ notification.body }}</p>
      </div>
      <i class="material-icons notranslate">chevron_right</i>
    </div>
  </TmPage>
</template>

<script>
import TmPage from "../common/TmPage"
import { Notifications } from "src/gql"

export default {
  name: "PageNotifications",
  components: {
    TmPage
  },
  data: () => ({
    notifications: [],
    notificationsMock: [
      {
        id: 1,
        title: "1",
        date: new Date(),
        body:
          "hello world hello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello world",
        link: "www.google.de",
        icon: "https://lunie.fra1.digitaloceanspaces.com/android-icon-72x72.png"
      }
    ]
  }),
  apollo: {
    notifications: {
      query: Notifications
    }
  }
}
</script>

<style scoped>
.tm-page {
  padding: 0 2rem;
}
.header {
  display: flex;
  justify-content: flex-end;
  font-size: 1.5rem;
  margin: 0 1rem 1rem;
}
.notification {
  background-color: white;
  border-radius: 0.25rem;
  display: flex;
  color: darkgray;
  align-items: center;
  padding: 1rem;
  justify-content: space-between;
}
img {
  width: 2rem;
  height: 2rem;
  margin-right: 1rem;
}
.content {
  flex-direction: row;
  display: flex;
  align-items: center;
}
</style>
