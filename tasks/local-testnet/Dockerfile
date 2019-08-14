FROM tendermint/gaia:v1.0.0-rc3

COPY ./nodes /etc/nodes
RUN chmod 777 /etc/nodes/first.sh
CMD /etc/nodes/first.sh ${MAX_NODES:-4}