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
      &nbsp;<i class="material-icons">access_time</i>&nbsp;{{ date }}
    </p>
    <p v-if="transaction.undelegationEndTime">
      Liquid date:
      {{ getUndelegationEndTime() }}
    </p>
    <p v-if="transaction.memo">
      <i class="material-icons">message</i> Memo: {{ transaction.memo }}
    </p>
    <p>
      Fee:
      <b>{{ transaction.fee.amount }}</b>
      <span> {{ transaction.fee.denom }}</span>
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
    getUndelegationEndTime() {
      return moment(new Date(this.transaction.undelegationEndTime))
    },
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
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.networkId
        }
      },
      update(data) {
        /* istanbul ignore next */
        return data.network || {}
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
