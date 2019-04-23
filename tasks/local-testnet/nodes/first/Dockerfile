FROM tendermint/gaia:v0.34.1

ADD ./first.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/first.sh
ENTRYPOINT [ "sh", "/usr/local/bin/first.sh" ]