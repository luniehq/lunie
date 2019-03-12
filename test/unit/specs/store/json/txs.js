export const bankTxs = [
  {
    hash: `not a real hash`,
    time: new Date(2042).toISOString(),
    height: `3436`,
    tx: {
      type: `8EFE47F0625DE8`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/MsgSend`,
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
            key: `action`,
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
    time: new Date(2042).toISOString(), // set by Voyager
    height: `3438`,
    tx: {
      type: `8EFE47F0625DE8`,

      value: {
        msg: [
          {
            type: `cosmos-sdk/MsgSend`,
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
            key: `action`,
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
    time: new Date(1142).toISOString(), // set by Voyager
    height: `466`,
    tx: {
      type: `8EFE47F0625DE8`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/MsgSend`,
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
            key: `action`,
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
export const stakingTxs = [
  {
    height: `193281`,
    txhash: `DB8F2DAFD4791337E57921DB2D7D7838E14492323FECB391BB39D51239BA3FBF`,
    gas_wanted: `101587`,
    gas_used: `101577`,
    time: new Date(2042).toISOString(),
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
    height: `193281`,
    txhash: `DB8F2DAFD4791337E57921DB2D7D7838E14492323FECB391BB39D51239BA3FBF`,
    gas_wanted: `101587`,
    gas_used: `101577`,
    time: new Date(2041).toISOString(),
    tags: [
      {
        key: `action`,
        value: `edit_validator`
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
            type: `cosmos-sdk/MsgEditValidator`,
            value: {
              validator_address: `cosmosvaloper1qecshyc40kshszkwrtscgmsdd8tz3n4hrj9yf2`,
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

    time: new Date(42000).toISOString(), // set by Voyager
    height: `568`,
    tx: {
      type: `8EFE47F0625DE8`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/MsgDelegate`,
            value: {
              validator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
              value: {
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
            key: `action`,
            value: `delegate`
          },
          {
            key: `delegator`,
            value: `N0ZFQzVEREE0NDA3RDVBRUQ5OTlFMTM3QjYxQTQ2QTEzQTc2MkJCNg==`
          }
        ],
        fee: {}
      }
    }
  },
  {
    hash: `not a real hash5`,

    time: new Date(4200).toISOString(), // set by Voyager
    height: `569`,
    tx: {
      type: `8EFE47F0625DE8`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/MsgUndelegate`,
            value: {
              validator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
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
            key: `action`,
            value: ``
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
    time: new Date(45000).toISOString(), // set by Voyager
    height: `567`,
    tx: {
      type: `8EFE47F0625DE8`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/MsgBeginRedelegate`,
            value: {
              validator_src_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
              validator_dst_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
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
            key: `action`,
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
    height: `193281`,
    txhash: `DB8F2DAFD4791337E57921DB2D7D7838E14492323FECB391BB39D51239BA3FBF`,
    gas_wanted: `101587`,
    gas_used: `101577`,
    time: new Date(20420).toISOString(),
    tags: [
      {
        key: `action`,
        value: `unjail`
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
            type: `cosmos-sdk/MsgUnjail`,
            value: {
              address: `cosmosvaloper1qecshyc40kshszkwrtscgmsdd8tz3n4hrj9yf2`,
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
]
export const governanceTxs = [
  {
    hash: `not a real hash7`,
    time: new Date(42540).toISOString(), // set by Voyager
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
            key: `action`,
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
    hash: `not a real hash9`,
    time: new Date(42567).toISOString(),
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
            key: `action`,
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
    hash: `not a real hash10`,
    time: new Date(43300).toISOString(), // set by Voyager
    height: `56673`,
    tx: {
      type: `8EFE47F0625DE8`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/MsgVote`,
            value: {
              voter: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
              proposal_id: `1`,
              option: `Yes`
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
            key: `action`,
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
export const distributionTxs = [
  {
    height: `1114`,
    txhash: `8D817CF08F5E13E98A42057C179B84A28B714A34DEE8D42D49A3468E0A8FF8D7`,
    log: `[{"msg_index":"0","success":true,"log":""}]`,
    gas_wanted: `500000`,
    gas_used: `58806`,
    tags: [
      {
        key: `action`,
        value: `withdraw_delegator_reward`
      },
      {
        key: `delegator`,
        value: `cosmos18ymm350peujvq2xy9ymyqj4v34ekvnk3wydrs3`
      },
      {
        key: `source-validator`,
        value: `cosmosvaloper18ymm350peujvq2xy9ymyqj4v34ekvnk3tsekuz`
      }
    ],
    tx: {
      type: `auth/StdTx`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/MsgWithdrawDelegationReward`,
            value: {
              delegator_addr: `cosmos18ymm350peujvq2xy9ymyqj4v34ekvnk3wydrs3`,
              validator_addr: `cosmosvaloper18ymm350peujvq2xy9ymyqj4v34ekvnk3tsekuz`
            }
          }
        ],
        fee: {
          amount: null,
          gas: `500000`
        },
        signatures: [
          {
            pub_key: {
              type: `tendermint/PubKeySecp256k1`,
              value: `A0ANSrO/dQgW/kgtMZam5DBC4De7V3PvQt6RyuK2dfhI`
            },
            signature: `RDq6lowz7Oo/dK8h686qzobzs0rI2nFrd3bHEf1P34wPYx56XXG4KysPt52B0f34I4C5bluXU5+scKtyRNTyGQ==`
          }
        ],
        memo: `Sent via Cosmos UI 🚀`
      }
    }
  },
  {
    height: `1114`,
    txhash: `8D817CF08F5E13E98A42057C179B84A28B714A34DEE8D42D49A3468E0A8FF8D7`,
    log: `[{"msg_index":"0","success":true,"log":""}]`,
    gas_wanted: `500000`,
    gas_used: `58806`,
    tags: [
      {
        key: `action`,
        value: `withdraw_delegator_reward`
      },
      {
        key: `delegator`,
        value: `cosmos18ymm350peujvq2xy9ymyqj4v34ekvnk3wydrs3`
      },
      {
        key: `source-validator`,
        value: `cosmosvaloper18ymm350peujvq2xy9ymyqj4v34ekvnk3tsekuz`
      }
    ],
    tx: {
      type: `auth/StdTx`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/MsgSetWithdrawAddress`,
            value: {
              withdraw_address: `cosmos18ymm350peujvq2xy9ymyqj4v34ekvnk3wydrs3`
            }
          }
        ],
        fee: {
          amount: null,
          gas: `500000`
        },
        signatures: [
          {
            pub_key: {
              type: `tendermint/PubKeySecp256k1`,
              value: `A0ANSrO/dQgW/kgtMZam5DBC4De7V3PvQt6RyuK2dfhI`
            },
            signature: `RDq6lowz7Oo/dK8h686qzobzs0rI2nFrd3bHEf1P34wPYx56XXG4KysPt52B0f34I4C5bluXU5+scKtyRNTyGQ==`
          }
        ],
        memo: `Sent via Cosmos UI 🚀`
      }
    }
  },
  {
    height: `1114`,
    txhash: `8D817CF08F5E13E98A42057C179B84A28B714A34DEE8D42D49A3468E0A8FF8D7`,
    log: `[{"msg_index":"0","success":true,"log":""}]`,
    gas_wanted: `500000`,
    gas_used: `58806`,
    tags: [
      {
        key: `action`,
        value: `withdraw_delegator_reward`
      },
      {
        key: `delegator`,
        value: `cosmos18ymm350peujvq2xy9ymyqj4v34ekvnk3wydrs3`
      },
      {
        key: `source-validator`,
        value: `cosmosvaloper18ymm350peujvq2xy9ymyqj4v34ekvnk3tsekuz`
      }
    ],
    tx: {
      type: `auth/StdTx`,
      value: {
        msg: [
          {
            type: `cosmos-sdk/MsgWithdrawValidatorCommission`,
            value: {
              validator_address: `cosmos18ymm350peujvq2xy9ymyqj4v34ekvnk3wydrs3`
            }
          }
        ],
        fee: {
          amount: null,
          gas: `500000`
        },
        memo: `Sent via Cosmos UI 🚀`
      }
    }
  }
]
export const allTxs = bankTxs.concat(stakingTxs, governanceTxs, distributionTxs)

