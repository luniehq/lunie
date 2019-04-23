FROM tendermint/gaia:v0.34.1

ADD ./others.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/others.sh
ENTRYPOINT [ "sh", "/usr/local/bin/others.sh" ]