export TARGET=/mnt

docker run \
  --name gaia_node \
  --rm \
  -t \
  --mount type=bind,source="$(pwd)/node",target="/mnt" \
  -v ${pwd} \
  tendermint/gaia:v0.34.1 ./first.sh
#  --rm \
#  tendermint/gaia:v0.34.1 \
#  sh