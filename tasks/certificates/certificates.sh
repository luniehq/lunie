#!/bin/bash

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /work/dev.key -out /work/dev.crt \
  -subj "/C=US/ST=CA/L=Irvine/O=Acme Inc./CN=localhost" \
  -reqexts v3_req -reqexts SAN -extensions SAN \
  -config /etc/openssl.cnf