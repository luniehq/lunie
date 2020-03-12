const { gql } = require('apollo-server')
const typeDefs = gql`
  enum ValidatorStatusEnum {
    ACTIVE
    INACTIVE
  }

  type Tally {
    yes: String # BigNumber
    no: String # BigNumber
    abstain: String # BigNumber
    veto: String # BigNumber
    total: String # BigNumber
    totalVotedPercentage: Float
  }

  type Coin {
    amount: String
    denom: String
  }

  type Reward {
    validator: Validator
    denom: String
    amount: String
    fiatValue: FiatValue
  }

  type FiatValue {
    amount: String
    denom: String
    symbol: String
  }

  type Balance {
    denom: String!
    amount: String!
    fiatValue: FiatValue
    gasPrice: String
  }

  type Proposal {
    networkId: String!
    id: Int
    type: String
    title: String
    description: String
    status: String
    creationTime: String
    statusBeginTime: String
    statusEndTime: String
    tally: Tally
    deposit: String # BigNumber
    proposer: String
    validator: Validator
  }

  type Validator {
    networkId: String!
    operatorAddress: String
    consensusPubkey: String
    jailed: Boolean
    details: String
    website: String
    identity: String
    votingPower: String # TODO tokens / total tokens
    startHeight: Int # TODO
    uptimePercentage: String
    tokens: String
    commissionUpdateTime: String
    commission: String
    maxCommission: String
    maxChangeCommission: String
    commissionLastUpdate: String
    height: Int # TODO
    status: ValidatorStatusEnum
    statusDetailed: String
    delegatorDelegation: String
    selfStake: String
    expectedReturns: String
    name: String
    picture: String
  }

  type Block @cacheControl(maxAge: 10) {
    networkId: String!
    height: Int
    hash: String
    chainId: String
    time: String
    transactions: [Transaction]
    proposer_address: String
  }

  type BlockV2 @cacheControl(maxAge: 10) {
    networkId: String!
    height: Int
    hash: String
    chainId: String
    time: String
    transactions: [TransactionV2]
    proposer_address: String
  }

  type Maintenance {
    id: Int!
    message: String
    show: Boolean
    type: String
  }

  type coinLookup {
    chainDenom: String!
    viewDenom: String!
    chainToViewConversionFactor: Int!
  }

  type Network {
    id: String
    title: String
    chain_id: String
    rpc_url: String
    api_url: String
    bech32_prefix: String
    address_prefix: String
    address_creator: String
    network_type: String
    ledger_app: String
    testnet: Boolean
    feature_session: Boolean
    feature_explore: Boolean
    feature_portfolio: Boolean
    feature_validators: Boolean
    feature_proposals: Boolean
    feature_activity: Boolean
    feature_explorer: Boolean
    action_send: Boolean
    action_claim_rewards: Boolean
    action_delegate: Boolean
    action_redelegate: Boolean
    action_undelegate: Boolean
    action_deposit: Boolean
    action_vote: Boolean
    action_proposal: Boolean
    default: Boolean
    stakingDenom: String
    coinLookup: [coinLookup]
    enabled: Boolean
    icon: String
    slug: String
    powered: Powered
  }

  type Delegation {
    delegatorAddress: String!
    amount: String!
    validator: Validator
  }

  type Undelegation {
    delegatorAddress: String!
    validator: Validator
    amount: String!
    startHeight: String!
    endTime: String!
  }

  type Transaction {
    type: String!
    hash: String!
    height: Int!
    group: String!
    timestamp: String!
    gasUsed: Int
    gasWanted: Int
    success: Boolean
    log: String
    memo: String
    fee: Coin
    signature: String!
    value: String!
    withdrawValidators: String
    undelegationEndTime: String
  }

  union TransactionDetails =
      SendTx
    | StakeTx
    | UnstakeTx
    | RestakeTx
    | ClaimRewardsTx
    | SubmitProposalTx
    | VoteTx
    | DepositTx
    | UnknownTx

  type TransactionV2 {
    type: String!
    hash: String!
    height: Int!
    details: TransactionDetails!
    timestamp: String!
    memo: String
    fees: [Coin]!
    success: Boolean!
  }

  type SendTx {
    amount: Coin!
    from: [String]!
    to: [String]!
  }

  type StakeTx {
    amount: Coin!
    to: [String]!
  }

  type RestakeTx {
    amount: Coin!
    from: [String]!
    to: [String]!
  }

  type UnstakeTx {
    amount: Coin!
    from: [String]!
    liquidDate: String
  }

  type ClaimRewardsTx {
    amount: Coin!
    from: [String]!
  }

  type SubmitProposalTx {
    proposalType: String!
    proposalTitle: String!
    proposalDescription: String!
    initialDeposit: Coin!
  }

  type VoteTx {
    proposalId: Int!
    voteOption: String!
  }

  type DepositTx {
    proposalId: Int!
    amount: Coin!
  }

  type UnknownTx {
    blockExplorerLink: String
  }

  type GovernanceParameters {
    depositDenom: String
    votingThreshold: Float
    vetoThreshold: Float
    depositThreshold: String # BigNumber
  }

  type Vote {
    option: String
  }

  type AccountInformation {
    accountNumber: String
    sequence: String
  }

  type Powered {
    name: String
    providerAddress: String
    picture: String
  }

  type Overview {
    networkId: String!
    address: String!
    totalStake: String!
    totalStakeFiatValue: FiatValue
    liquidStake: String!
    totalRewards: String!
    rewards: [Reward]
    accountInformation: AccountInformation
  }

  enum EventType {
    block
    transaction
    validator
    proposal
  }

  type Event {
    networkId: String!
    eventType: EventType!
    ressourceId: String # the ressource ID like the address of the user or the validator or the ID of the proposal
    properties: String # JSON encoded as it is general purpose and GraphQL doesn't allow for "Object"
  }

  type Subscription {
    blockAdded(networkId: String!): Block
    userTransactionAdded(networkId: String!, address: String!): Transaction
    userTransactionAddedV2(networkId: String!, address: String!): TransactionV2
    event(networkId: String!, eventType: String!, ressourceId: String): Event
  }

  type Query {
    block(networkId: String!, height: Int): Block
    blockV2(networkId: String!, height: Int): BlockV2
    proposal(networkId: String!, id: Int!): Proposal
    proposals(networkId: String!): [Proposal]
    validators(
      networkId: String!
      searchTerm: String
      activeOnly: Boolean
    ): [Validator]
    vote(networkId: String!, proposalId: Int!, address: String!): Vote
    governanceParameters(networkId: String!): GovernanceParameters
    validator(networkId: String!, operatorAddress: String!): Validator
    networks(experimental: Boolean): [Network]
    network(id: String): Network
    maintenance: [Maintenance]
    balances(
      networkId: String!
      address: String!
      fiatCurrency: String
    ): [Balance]
    balance(
      networkId: String!
      address: String!
      denom: String!
      fiatCurrency: String
    ): Balance
    overview(
      networkId: String!
      address: String!
      fiatCurrency: String
    ): Overview
    delegation(
      networkId: String!
      delegatorAddress: String!
      operatorAddress: String!
    ): Delegation
    delegations(networkId: String!, delegatorAddress: String!): [Delegation]
    undelegations(networkId: String!, delegatorAddress: String!): [Undelegation]
    bondedTokens(networkId: String!): String
    annualProvision(networkId: String!): String
    rewards(
      networkId: String!
      delegatorAddress: String!
      operatorAddress: String
      fiatCurrency: String
    ): [Reward]
    transactions(
      networkId: String!
      address: String!
      pageNumber: Int
    ): [Transaction]
    transactionsV2(
      networkId: String!
      address: String!
      pageNumber: Int
    ): [TransactionV2]
  }
`

module.exports = typeDefs
