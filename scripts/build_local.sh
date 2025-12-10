#!/bin/bash

SERVICE=$1

echo "Building $SERVICE docker image"
docker build -t qoutland/podlands-$SERVICE:latest $SERVICE/.

echo "Saving snake docker image to tar file"
docker save qoutland/podlands-$SERVICE:latest -o $SERVICE.tar.gz

echo "Loading snake docker image to k3s"
sudo k3s ctr images import $SERVICE.tar.gz

echo "Removing tar file"
rm -rf $SERVICE.tar.gz
echo "Done"