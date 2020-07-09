HOME=$1

echo "Making ${HOME} speedy"

sed -i -e 's/^timeout_propose = .*$/timeout_propose = \"30ms\"/' \
 -e 's/^timeout_propose_delta = .*$/timeout_propose_delta = \"5ms\"/' \
 -e 's/^timeout_prevote = .*$/timeout_prevote = \"10ms\"/' \
 -e 's/^timeout_prevote_delta = .*$/timeout_prevote_delta = \"5ms\"/' \
 -e 's/^timeout_precommit = .*$/timeout_precommit = \"10ms\"/' \
 -e 's/^timeout_precommit_delta = .*$/timeout_precommit_delta = \"5ms\"/' \
 -e 's/^timeout_commit = .*$/timeout_commit = \"50ms\"/' ${HOME}/config/config.toml