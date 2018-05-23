FROM golang:1.10.1

# Dep

RUN mkdir release

RUN cd release \
  && wget https://github.com/golang/dep/releases/download/v0.4.1/dep-linux-amd64

RUN curl --location \
  https://github.com/golang/dep/releases/download/v0.4.1/dep-linux-amd64.sha256 \
  | sha256sum --check

RUN chmod +x release/dep-linux-amd64
RUN mv release/dep-linux-amd64 $GOPATH/bin/dep


# Cosmos SDK

RUN cd / \
  && git clone --bare https://github.com/cosmos/cosmos-sdk

ARG SDK_COMMIT

## Linux

ENV GOOS=linux
ENV GOPATH=/go/$GOOS
RUN mkdir --parents $GOPATH/src/github.com/cosmos

RUN git --git-dir=/cosmos-sdk.git worktree add \
  $GOPATH/src/github.com/cosmos/cosmos-sdk $SDK_COMMIT

WORKDIR $GOPATH/src/github.com/cosmos/cosmos-sdk
RUN make get_vendor_deps
RUN make install

## macOS

ENV GOOS=darwin
ENV GOPATH=/go/$GOOS
RUN mkdir --parents $GOPATH/src/github.com/cosmos

RUN git --git-dir=/cosmos-sdk.git worktree add \
  $GOPATH/src/github.com/cosmos/cosmos-sdk $SDK_COMMIT

WORKDIR $GOPATH/src/github.com/cosmos/cosmos-sdk
RUN make get_vendor_deps
RUN make install

## Windows

ENV GOOS=windows
ENV GOPATH=/go/$GOOS
RUN mkdir --parents $GOPATH/src/github.com/cosmos

RUN git --git-dir=/cosmos-sdk.git worktree add \
  $GOPATH/src/github.com/cosmos/cosmos-sdk $SDK_COMMIT

WORKDIR $GOPATH/src/github.com/cosmos/cosmos-sdk
RUN make get_vendor_deps
RUN make install


# Voyager

FROM node:9.11.1

# Install Wine so that we can build for the 'win32' platform.
# https://wiki.debian.org/Wine#Installation_on_Debian_Jessie_and_newer
RUN dpkg --add-architecture i386 \
  && apt-get update \
  && apt-get install --yes \
  wine \
  wine32 \
  libwine

COPY --from=0 /go/linux/bin /go/linux/bin
COPY --from=0 /go/darwin/bin/darwin_amd64 /go/darwin/bin
COPY --from=0 /go/windows/bin/windows_amd64 /go/win32/bin

RUN mkdir --parents /usr/src/app
WORKDIR /usr/src/app
COPY entrypoint.sh /
ENTRYPOINT [ "/entrypoint.sh" ]
