# Postmortem summary

Here we will gather all the critical issues regarding our nodes and communication with them in the following format

## Date OR FromDate-ToDate

### Problems

#### Problem 1
- unexpected
- behaviour

### Solutions
#### Problem 1
- sequence
- of 
- actions
- to
- fix

## 2019-03-13
### Problems
#### RPC cannot connect
- New nodes were deployed on 2019-03-11 evening
- On 2019-03-12 all was OK
- We experienced a problem regarding RPC on every browser
- REST was working fine
### Solutions
#### RPC cannot connect
- ssh into the main node (address shared privately)
- `screen -r gaia`
- gaia console on the main node all red with errors regarding RPC truncation
- increase the Connection Idle timeout in the LoadBalancer to 60s
- detach from screen with `Control-A+Control-D`
- we must stop both Gaia and Stargate
- `screen -r rest`
- `Crtl-C` to stop
- `screen -r gaia`
- `Crtl-C` to stop
- restore the processes
```bash
PORT=26657
API_PORT=8080
NETWORK=testnet
screen -dmS gaia ./gaiad start --home .
screen -dmS rest ./gaiacli rest-server --laddr tcp://0.0.0.0:${API_PORT} --home . --node http://localhost:${PORT} --chain-id ${NETWORK} --trust-node true
```

NOTE: This Solution will not be applicable once we switch to proper ECS nodes instead of the EC2 running instances
