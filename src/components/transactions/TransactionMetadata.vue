<template>
  <div class="tx__metadata">
    <p>
      Block
      <router-link
        v-if="checkFeatureAvailable()"
        :to="{ name: `block`, params: { height: transaction.height } }"
      >
        #{{ transaction.height | prettyInt }}</router-link
      >
      <span v-else>#{{ transaction.height | prettyInt }}</span>
      &nbsp;<i class="material-icons notranslate">access_time</i>&nbsp;{{
        date
      }}
    </p>
    <p v-if="transaction.memo">
      <i class="material-icons notranslate">message</i> Memo:&nbsp;
      {{ transaction.memo }}
    </p>
    <p>
      Fees:&nbsp;
      <span v-if="transaction.fees.length > 0">
        <b>{{ transaction.fees[0].amount }}</b>
        <span> {{ transaction.fees[0].denom }}</span>
      </span>
      <span v-else>
        0
      </span>
    </p>
    <p>
      Hash: <span class="hash">{{ transaction.hash }}</span>
    </p>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import gql from "graphql-tag"
import moment from "moment"
import { atoms, viewDenom } from "scripts/num.js"
import { prettyInt } from "scripts/num"

export default {
  name: `transaction-metadata`,
  filters: {
    atoms,
    viewDenom,
    prettyInt
  },
  props: {
    transaction: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    network: {}
  }),
  computed: {
    ...mapGetters({ networkId: `network` }),
    date() {
      const momentTime = moment(this.transaction.timestamp)
      return momentTime.format(`HH:mm:ss`)
    }
  },
  methods: {
    checkFeatureAvailable() {
      const feature = `feature_explorer`
      return this.network[feature] === true
    }
  },
  apollo: {
    network: {
      query: gql`
        query NetworkActionModal($networkId: String!) {
          network(id: $networkId) {
            id
            feature_explorer
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.networkId
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.network
      }
    }
  }
}
</script>
<style scoped>
.material-icons {
  font-size: 1rem;
  vertical-align: middle;
  margin-bottom: 2px;
}

.hash {
  color: var(--dim);
  word-break: break-all;
}
</style>
