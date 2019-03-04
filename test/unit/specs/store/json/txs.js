const bankTxs = [
  {
    hash: `not a real hash`,
    time: 2042,
    height: `3436`,
    tx: {
      type: `8EFE47F0625DE8`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/Send`,
            value: {
              from_address: `A`,
              amount: [{ denom: `jbcoins`, amount: `12340000000` }],
              to_address: `B`
            }
          }
        ],
        fee: {
          amount: [
            {
              denom: ``,
              amount: `0`
            }
          ],
          gas: `500000`
        },
        gas: `500000`
      },
      result: {
        gasUsed: `3324`,
        tags: [
          {
            key: `c2VuZGVy`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          },
          {
            key: `cmVjaXBpZW50`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          }
        ],
        fee: {}
      }
    }
  },
  {
    hash: `not a real hash2`,
    time: 2052, // set by Voyager
    height: `3438`,
    tx: {
      type: `8EFE47F0625DE8`,

      value: {
        msg: [
          {
            type: `cosmos-sdk/Send`,
            value: {
              from_address: `B`,
              amount: [{ denom: `jbcoins`, amount: `12340000000` }],
              to_address: `A`
            }
          }
        ],
        fee: {
          amount: [
            {
              denom: ``,
              amount: `0`
            }
          ],
          gas: `500000`
        },
        gas: `500000`
      },
      result: {
        gasUsed: `3324`,
        tags: [
          {
            key: `c2VuZGVy`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          },
          {
            key: `cmVjaXBpZW50`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          }
        ],
        fee: {}
      }
    }
  },
  {
    hash: `not a real hash3`,
    time: 1142, // set by Voyager
    height: `466`,
    tx: {
      type: `8EFE47F0625DE8`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/Send`,
            value: {
              amount: [
                { denom: `jbcoins`, amount: `12340000000` },
                { denom: `fabocoins`, amount: `10000000` },
                { denom: `karolycoins`, amount: `420000000` }
              ],
              from_address: `A`,
              to_address: `A`
            }
          }
        ],
        fee: {
          amount: [
            {
              denom: ``,
              amount: `0`
            }
          ],
          gas: `500000`
        },
        gas: `500000`
      },
      result: {
        gasUsed: `3324`,
        tags: [
          {
            key: `c2VuZGVy`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          },
          {
            key: `cmVjaXBpZW50`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          }
        ],
        fee: {}
      }
    }
  },
]
const stakingTxs = [
  {
    height: `193281`,
    txhash: `DB8F2DAFD4791337E57921DB2D7D7838E14492323FECB391BB39D51239BA3FBF`,
    gas_wanted: `101587`,
    gas_used: `101577`,
    tags: [
      {
        key: `action`,
        value: `create_validator`
      },
      {
        key: `destination-validator`,
        value: `cosmosvaloper1qecshyc40kshszkwrtscgmsdd8tz3n4hrj9yf2`
      },
    ],
    tx: {
      type: `auth/StdTx`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/MsgCreateValidator`,
            value: {
              description: {
                moniker: `propelmind`,
                identity: ``,
                website: ``,
                details: ``
              },
              commission: {
                rate: `0.100000000000000000`,
                max_rate: `0.200000000000000000`,
                max_change_rate: `0.010000000000000000`
              },
              min_self_delegation: `1`,
              delegator_address: `cosmos1qecshyc40kshszkwrtscgmsdd8tz3n4hxx339e`,
              validator_address: `cosmosvaloper1qecshyc40kshszkwrtscgmsdd8tz3n4hrj9yf2`,
              pubkey: `cosmosvalconspub1zcjduepqjja8zg8ccvdd5rx50ad79faaaucq5vr98pr7eawnslqrscelwhaszhaq83`,
              value: {
                denom: `muon`,
                amount: `1000000`
              }
            }
          }
        ],
        fee: {
          amount: null,
          gas: `101587`
        },
        memo: ``
      }
    }
  },
  {
    hash: `not a real hash4`,

    time: 42000, // set by Voyager
    height: `568`,
    tx: {
      type: `8EFE47F0625DE8`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/MsgDelegate`,
            value: {
              validator_addr: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
              delegation: {
                amount: `42000000000`,
                denom: `steak`
              }
            }
          }
        ],
        fee: {
          amount: [
            {
              denom: ``,
              amount: `0`
            }
          ],
          gas: `500000`
        },
        gas: 500000,
      },
      result: {
        gasUsed: `3324`,
        tags: [
          {
            key: `c2VuZGVy`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          },
          {
            key: `cmVjaXBpZW50`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          }
        ],
        fee: {}
      }
    }
  },
  {
    hash: `not a real hash5`,

    time: 42000, // set by Voyager
    height: `569`,
    tx: {
      type: `8EFE47F0625DE8`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/Undelegate`,
            value: {
              validator_addr: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
              shares_amount: `10000000000`
            }
          }
        ],
        fee: {
          amount: [
            {
              denom: ``,
              amount: `0`
            }
          ],
          gas: `500000`
        },
        gas: `500000`
      },
      result: {
        gasUsed: `3324`,
        tags: [
          {
            key: `c2VuZGVy`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          },
          {
            key: `cmVjaXBpZW50`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          }
        ],
        fee: {}
      }
    }
  },
  {
    hash: `not a real hash6`,
    time: 42000, // set by Voyager
    height: `567`,
    tx: {
      type: `8EFE47F0625DE8`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/BeginRedelegate`,
            value: {
              validator_src_addr: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
              validator_dst_addr: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
              shares_amount: `30000000`
            }
          }
        ],
        fee: {
          amount: [
            {
              denom: ``,
              amount: `0`
            }
          ],
          gas: `500000`
        },
        gas: `500000`
      },
      result: {
        gasUsed: `3324`,
        tags: [
          {
            key: `c2VuZGVy`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          },
          {
            key: `cmVjaXBpZW50`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          }
        ],
        fee: {}
      }
    }
  }
]
const governanceTxs = [
  {
    hash: `not a real hash7`,
    time: 42000, // set by Voyager
    height: `56673`,
    tx: {
      type: `8EFE47F0625DE8`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/MsgSubmitProposal`,
            value: {
              proposer: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
              proposal_type: `Text`,
              title: `Test Proposal`,
              description: `This is a test proposal`,
              initial_deposit: [
                {
                  denom: `stake`,
                  amount: `1000000000`
                }
              ]
            }
          }
        ],
        fee: {
          amount: [
            {
              denom: ``,
              amount: `0`
            }
          ],
          gas: `500000`
        },
        gas: `500000`
      },
      result: {
        gasUsed: `3324`,
        tags: [
          {
            key: `c2VuZGVy`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          },
          {
            key: `cmVjaXBpZW50`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          }
        ],
        fee: {}
      }
    }
  },
  {
    hash: `not a real hash8`,
    time: 42000, // set by Voyager
    height: `56675`,
    tx: {
      type: `8EFE47F0625DE8`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/MsgDeposit`,
            value: {
              depositer: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
              proposal_id: `1`,
              amount: [
                {
                  denom: `stake`,
                  amount: `1000000000`
                }
              ]
            }
          }
        ],
        fee: {
          amount: [
            {
              denom: ``,
              amount: `0`
            }
          ],
          gas: `500000`
        },
        gas: `500000`
      },
      result: {
        gasUsed: `3324`,
        tags: [
          {
            key: `c2VuZGVy`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          },
          {
            key: `cmVjaXBpZW50`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          }
        ],
        fee: {}
      }
    }
  }
]
const distributionTxs = []
const allTxs = bankTxs.concat(stakingTxs, governanceTxs, distributionTxs)

export default {
  bankTxs,
  stakingTxs,
  governanceTxs,
  distributionTxs,
  allTxs
}
