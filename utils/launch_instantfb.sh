#!/bin/bash

REALDIR=`readlink -f $0`
ROOTDIR=`dirname ${REALDIR}`

! hash node && . ~/.nvm/nvm.sh
# nvm use node
node $ROOTDIR/../index.js $@

