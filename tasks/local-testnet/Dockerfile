FROM tendermint/gaia:v0.34.3

COPY ./nodes /etc/nodes
CMD /etc/nodes/first.sh ${MAX_NODES:-4}