const { gql } = require('apollo-server')
const typeDefs = gql`
  enum ValidatorStatusEnum {
    ACTIVE
    INACTIVE
  }

  enum TokenType {
    STAKE
    CURRENCY
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

  type BalanceV2 {
    type: TokenType!
    denom: String!
    total: String!
    fiatValue: FiatValue
    available: String
    availableFiatValue: FiatValue
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
    popularity: Int
  }

  type BlockV2 @cacheControl(maxAge: 10) {
    networkId: String!
    height: Int
    hash: String
    chainId: String
    time: String
    transactions: [TransactionV2]
    proposer_address: String
    data: String
  }

  type Maintenance {
    id: Int!
    link: String
    linkCaption: String
    message: String
    show: Boolean
    type: String
  }

  type coinLookup {
    chainDenom: String!
    viewDenom: String!
    chainToViewConversionFactor: Float!
  }

  enum CapabilityEnum {
    ENABLED
    DISABLED
    MISSING
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
    feature_session: CapabilityEnum!
    feature_explore: CapabilityEnum!
    feature_portfolio: CapabilityEnum!
    feature_validators: CapabilityEnum!
    feature_proposals: CapabilityEnum!
    feature_activity: CapabilityEnum!
    feature_explorer: CapabilityEnum!
    action_send: CapabilityEnum!
    action_claim_rewards: CapabilityEnum!
    action_delegate: CapabilityEnum!
    action_redelegate: CapabilityEnum!
    action_undelegate: CapabilityEnum!
    action_deposit: CapabilityEnum!
    action_vote: CapabilityEnum!
    action_proposal: CapabilityEnum!
    default: Boolean
    stakingDenom: String
    coinLookup: [coinLookup]
    enabled: Boolean
    experimental: Boolean
    icon: String
    slug: String
    powered: Powered
    lockUpPeriod: String
  }

  type Delegation {
    delegatorAddress: String!
    amount: String!
    validator: Validator
    active: ValidatorStatusEnum
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
    success: Boolean!
    log: String
    memo: String
    fee: Coin
    signature: String!
    value: String!
    withdrawValidators: String
    undelegationEndTime: String
  }

  input InputCoin {
    amount: String
    denom: String
  }

  input TransactionDetailsInput {
    amount: InputCoin
    amounts: [InputCoin]
    from: [String]
    to: [String]
    liquidDate: String
    proposalType: String
    proposalId: String
    proposalTitle: String
    proposalDescription: String
    proposer: String
    initialDeposit: InputCoin
    voteOption: String
    addressRole: String
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
    key: String!
    height: Int!
    details: TransactionDetails!
    timestamp: String!
    memo: String
    fees: [Coin]!
    success: Boolean!
    log: String
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
    amounts: [Coin]!
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
    resourceId: String # the ressource ID like the address of the user or the validator or the ID of the proposal
    properties: String # JSON encoded as it is general purpose and GraphQL doesn't allow for "Object"
  }

  type Subscription {
    blockAdded(networkId: String!): BlockV2
    notificationAdded(addressObjects: [NotificationInput]!): Notification
    userTransactionAdded(networkId: String!, address: String!): Transaction
    userTransactionAddedV2(networkId: String!, address: String!): TransactionV2
    event(networkId: String!, eventType: String!, resourceId: String): Event
  }

  type Mutation {
    registerUser(idToken: String!): Boolean
  }

  type ChainAppliedFees {
    rate: String!
    cap: String!
  }

  type NetworkFees {
    gasEstimate: Int!
    transactionFee: Coin!
    fee: Coin # DEPRECATE
    chainAppliedFees: ChainAppliedFees # DEPRECATE
  }

  type GasPrice {
    denom: String
    price: String
  }

  type TransactionMetadata {
    gasEstimate: Int!
    gasPrices: [GasPrice]
    chainAppliedFees: ChainAppliedFees
    accountSequence: Int
    accountNumber: Int
  }

  type EstimateResult {
    gasEstimate: Int
    error: String
    success: Boolean!
  }

  type Notification {
    networkId: String
    timestamp: String!
    title: String!
    link: String!
    icon: String!
  }

  input NotificationInput {
    address: String!
    networkId: String!
  }

  type Query {
    blockV2(networkId: String!, height: Int): BlockV2
    proposal(networkId: String!, id: Int!): Proposal
    proposals(networkId: String!): [Proposal]
    validators(
      networkId: String!
      searchTerm: String
      activeOnly: Boolean
      popularSort: Boolean
    ): [Validator]
    allDelegators(networkId: String!): [String]
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
    balancesV2(
      networkId: String!
      address: String!
      fiatCurrency: String
    ): [BalanceV2]
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
    transactionsV2(
      networkId: String!
      address: String!
      pageNumber: Int
    ): [TransactionV2]
    networkFees(
      networkId: String!
      messageType: String # Make required
      transactionType: String # DEPRECATE
      message: TransactionDetailsInput # Make required
      senderAddress: String # Make required
      memo: String
    ): NetworkFees
    transactionMetadata(
      networkId: String!
      transactionType: String
      address: String
    ): TransactionMetadata
    estimate: EstimateResult!
    notifications(
      timestamp: String
      addressObjects: [NotificationInput]!
    ): [Notification]!
    accountRole(networkId: String!, address: String!): String
  }
`

module.exports = typeDefs
