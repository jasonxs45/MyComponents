#!/bin/sh
timestamp=$(date "+%Y%m%d%H%M%s")
time=$(date "+%Y-%m-%d")

if [ -e docker_build_log.txt ]; then
    n=$(tail -n 1 docker_build_log.txt)
    n=$(echo $n | tr -cd "[0-9]")
else
    n=0
fi

tag="xscomponents:v"$time"_"$n

echo "Docker build start"

docker build -t $tag .

echo "Docker build finish"

if [ $? -eq 0 ]; then
    echo 'success'
    let n++
    echo "==================================" >>docker_build_log.txt
    echo "build time "$time >>docker_build_log.txt
    echo $tag >>docker_build_log.txt
    echo "build times: "$n >>docker_build_log.txt
    cat docker_build_log.txt

#   保存镜像到本地
    docker save -o $tag.tar $tag

else
    echo 'failed'
    let n++
    echo "==================================" >>docker_build_log.txt
    echo "build time "$time >>docker_build_log.txt
    echo $tag >>docker_build_log.txt
    echo "build times: "$n >>docker_build_log.txt
    cat docker_build_log.txt
fi
