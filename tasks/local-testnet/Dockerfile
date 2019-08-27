FROM tendermint/gaia:v2.0.0

COPY ./nodes /etc/nodes
RUN chmod 777 /etc/nodes/first.sh
CMD /etc/nodes/first.sh ${MAX_NODES:-4}