<template>
  <div>
    <div v-for="(message, index) in maintenance" :key="index">
      <Bar :type="message.type" :show="message.show">{{ message.message }}</Bar>
    </div>
  </div>
</template>

<script>
//import gql from "graphql-tag"
import Bar from "common/Bar"
export default {
  name: `maintenance-bar`,
  components: {
    Bar
  },
  data: () => ({
    /* Just for testing */
    maintenance: [
      {
        message: "success message",
        show: true,
        type: "success"
      },
      {
        message: "danger message",
        show: true,
        type: "danger"
      },
      {
        message: "warning message",
        show: true,
        type: "warning"
      }
    ]
  }),
  /*
  apollo: {
    maintenance: {
      query: gql`
        query Maintenance {
          maintenance {
            message
            type
            show
          }
        }
      `,
      update: result => result.maintenance
    }
  }
  */
}
</script>
