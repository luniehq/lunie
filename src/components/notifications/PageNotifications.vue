<template>
  <TmPage hide-header>
    <div
      v-for="notification in notifications"
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

export default {
  name: "PageNotifications",
  components: {
    TmPage
  },
  data: () => ({
    notifications: [
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
  })
}
</script>

<style scoped>
.tm-page {
  padding: 2rem;
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
