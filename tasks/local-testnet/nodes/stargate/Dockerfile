FROM tendermint/gaia:v0.34.1

ADD ./stargate.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/stargate.sh
ENTRYPOINT [ "sh", "/usr/local/bin/stargate.sh" ]