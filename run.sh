#!/bin/bash

trap ctrl_c INT

function ctrl_c() {
  echo "** Trapped CTRL-C"
  killall node
  killall wrapper.sh
  exit
}

while true;do
  echo "run dummy...."
  ./wrapper.sh &
  pid=$!
  echo "get $pid and wait for 3600 secs..."
  sleep 3600
  echo "kill $pid"
  #kill $pid
  killall node
  killall wrapper.sh
  sleep 1
done


