FROM tendermint/gaia:v1.0.0-rc3

COPY ./nodes /etc/nodes
CMD /etc/nodes/first.sh ${MAX_NODES:-4}