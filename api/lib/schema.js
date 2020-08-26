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

  enum proposalTypeEnum {
    TEXT
    COUNCIL
    TREASURY
    PARAMETER_CHANGE
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
    id: String
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
    id: String
    denom: String!
    amount: String!
    fiatValue: FiatValue
    gasPrice: String
  }

  type BalanceV2 {
    id: String
    type: TokenType!
    denom: String!
    total: String!
    fiatValue: FiatValue
    available: String
    availableFiatValue: FiatValue
  }

  type Deposit {
    amount: [Coin]
    depositer: String
  }

  type Vote {
    id: Int
    voter: String
    option: String
  }

  type DetailedVotes {
    deposits: [Deposit]
    depositsSum: String
    percentageDepositsNeeded: String
    votes: [Vote]
    votesSum: String
    votingThresholdYes: String
    votingThresholdNo: String
    votingPercentageYes: String
    votingPercentageNo: String
    links: [GovernanceLink]
    timeline: [GovernanceTimeline]
  }

  type Proposal {
    id: String
    networkId: String!
    type: proposalTypeEnum
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
    beneficiary: String
    detailedVotes: DetailedVotes
  }

  type Validator {
    id: String!
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
    id: String # the block hash
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
    icon: String
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
    erasPerDay: Int!
    source_class_name: String!
    HDPaths: String!
    curves: String!
    defaultHDPath: String!
    defaultCurve: String!
  }

  type Delegation {
    id: String!
    delegatorAddress: String!
    amount: String!
    validator: Validator
    active: ValidatorStatusEnum
  }

  type Undelegation {
    id: String!
    delegatorAddress: String!
    validator: Validator
    amount: String!
    startHeight: String!
    endTime: String!
  }

  type Transaction {
    id: String!
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
    id: String!
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

  type GovernanceTimeline {
    title: String
    time: String
  }

  type GovernanceLink {
    title: String
    link: String
    type: String
  }

  type TopVoter {
    name: String!
    address: String!
    votingPower: String!
    validator: Validator
  }

  type GovernanceParameters {
    depositDenom: String
    votingThreshold: Float
    vetoThreshold: Float
    depositThreshold: String # BigNumber
  }

  type GovernanceOverview @cacheControl(maxAge: 21600) {
    totalStakedAssets: Float
    totalVoters: Int
    treasurySize: Float
    topVoters: [TopVoter]
    links: [GovernanceLink]
  }

  type Powered {
    name: String
    providerAddress: String
    picture: String
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

  type Session {
    sessionToken: String!
    validUntil: String!
  }

  type Subscription {
    blockAdded(networkId: String!): BlockV2
    notificationAdded(addressObjects: [NotificationInput]!): Notification
    userTransactionAdded(networkId: String!, address: String!): Transaction
    userTransactionAddedV2(networkId: String!, address: String!): TransactionV2
    event(networkId: String!, eventType: String!, resourceId: String): Event
  }

  type Mutation {
    registerUser(idToken: String!): Session
    notifications(
      addressObjects: [NotificationInput]!
      notificationType: String
      pushToken: String
    ): Boolean
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
    gasEstimate: Int
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
    id: String! # id from DB
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

  input NotificationSetting {
    topic: String!
    type: String!
    remove: Boolean
  }

  type BondedStake {
    total: String
    active: String
    unlocking: String
    stale: String
  }

  type Query {
    blockV2(networkId: String!, height: Int): BlockV2
    proposal(networkId: String!, id: String!): Proposal
    proposals(networkId: String!): [Proposal]
    validators(
      networkId: String!
      searchTerm: String
      activeOnly: Boolean
      popularSort: Boolean
    ): [Validator]
    allDelegators(networkId: String!): [String]
    vote(networkId: String!, proposalId: String!, address: String!): Vote
    governanceParameters(networkId: String!): GovernanceParameters
    governanceOverview(networkId: String!): GovernanceOverview
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
    bondedStake(networkId: String!, address: String!): BondedStake
  }
`

module.exports = typeDefs
