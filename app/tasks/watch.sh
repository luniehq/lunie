#!/bin/sh
jest $1 --watch --collectCoverageFrom='["**/*$1*"]' --coverage
