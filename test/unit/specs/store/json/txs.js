export default [
  {
    hash: `not a real hash`,
    time: 2042, // set by Voyager
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
        gas: `500000`,
        signatures: [
          {
            pub_key: {
              type: `AC26791624DE60`,
              value: `70df5mUA3bFTJheAI6umXvABNuUU+q/3nOPS6lmT3tU=`
            },
            signature: {
              type: `6BF5903DA1DB28`,
              value: `oODzZz2t1u678Jhy2zFnFbBu7S2IP1zjOIoyVDOvGkQ6WkiiRF3zxEJbNAjHGdDjXf7/NQpMOtpt8FC1x6e6DA==`
            },
            account_number: `28`,
            sequence: `0`
          }
        ]
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
        gas: `500000`,
        signatures: [
          {
            pub_key: {
              type: `AC26791624DE60`,
              value: `70df5mUA3bFTJheAI6umXvABNuUU+q/3nOPS6lmT3tU=`
            },
            signature: {
              type: `6BF5903DA1DB28`,
              value: `oODzZz2t1u678Jhy2zFnFbBu7S2IP1zjOIoyVDOvGkQ6WkiiRF3zxEJbNAjHGdDjXf7/NQpMOtpt8FC1x6e6DA==`
            },
            account_number: `28`,
            sequence: `0`
          }
        ]
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
                { denom: `mattcoins`, amount: `420000000` }
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
        gas: `500000`,
        signatures: [
          {
            pub_key: {
              type: `AC26791624DE60`,
              value: `70df5mUA3bFTJheAI6umXvABNuUU+q/3nOPS6lmT3tU=`
            },
            signature: {
              type: `6BF5903DA1DB28`,
              value: `oODzZz2t1u678Jhy2zFnFbBu7S2IP1zjOIoyVDOvGkQ6WkiiRF3zxEJbNAjHGdDjXf7/NQpMOtpt8FC1x6e6DA==`
            },
            account_number: `28`,
            sequence: `0`
          }
        ]
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
        signatures: [
          {
            pub_key: {
              type: `AC26791624DE60`,
              value: `70df5mUA3bFTJheAI6umXvABNuUU+q/3nOPS6lmT3tU=`
            },
            signature: {
              type: `6BF5903DA1DB28`,
              value: `oODzZz2t1u678Jhy2zFnFbBu7S2IP1zjOIoyVDOvGkQ6WkiiRF3zxEJbNAjHGdDjXf7/NQpMOtpt8FC1x6e6DA==`
            },
            account_number: `28`,
            sequence: `0`
          }
        ]
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
        gas: `500000`,
        signatures: [
          {
            pub_key: {
              type: `AC26791624DE60`,
              value: `70df5mUA3bFTJheAI6umXvABNuUU+q/3nOPS6lmT3tU=`
            },
            signature: {
              type: `6BF5903DA1DB28`,
              value: `oODzZz2t1u678Jhy2zFnFbBu7S2IP1zjOIoyVDOvGkQ6WkiiRF3zxEJbNAjHGdDjXf7/NQpMOtpt8FC1x6e6DA==`
            },
            account_number: `28`,
            sequence: `0`
          }
        ]
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
        gas: `500000`,
        signatures: [
          {
            pub_key: {
              type: `AC26791624DE60`,
              value: `70df5mUA3bFTJheAI6umXvABNuUU+q/3nOPS6lmT3tU=`
            },
            signature: {
              type: `6BF5903DA1DB28`,
              value: `oODzZz2t1u678Jhy2zFnFbBu7S2IP1zjOIoyVDOvGkQ6WkiiRF3zxEJbNAjHGdDjXf7/NQpMOtpt8FC1x6e6DA==`
            },
            account_number: `28`,
            sequence: `0`
          }
        ]
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
        gas: `500000`,
        signatures: [
          {
            pub_key: {
              type: `AC26791624DE60`,
              value: `70df5mUA3bFTJheAI6umXvABNuUU+q/3nOPS6lmT3tU=`
            },
            signature: {
              type: `6BF5903DA1DB28`,
              value: `oODzZz2t1u678Jhy2zFnFbBu7S2IP1zjOIoyVDOvGkQ6WkiiRF3zxEJbNAjHGdDjXf7/NQpMOtpt8FC1x6e6DA==`
            },
            account_number: `28`,
            sequence: `0`
          }
        ]
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
        gas: `500000`,
        signatures: [
          {
            pub_key: {
              type: `AC26791624DE60`,
              value: `70df5mUA3bFTJheAI6umXvABNuUU+q/3nOPS6lmT3tU=`
            },
            signature: {
              type: `6BF5903DA1DB28`,
              value: `oODzZz2t1u678Jhy2zFnFbBu7S2IP1zjOIoyVDOvGkQ6WkiiRF3zxEJbNAjHGdDjXf7/NQpMOtpt8FC1x6e6DA==`
            },
            account_number: `28`,
            sequence: `0`
          }
        ]
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
