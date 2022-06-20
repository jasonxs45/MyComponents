#!/bin/sh
SECONDS=0
timestamp=$(date "+%Y%m%d%H%M%s")
time=$(date "+%Y-%m-%d")

if [ -e docker_build_log.txt ]; then
    n=$(tail -n 1 docker_build_log.txt)
    n=$(echo $n | tr -cd "[0-9]")
else
    n=0
fi
basename="xscomponents"
tag="v"$time"_"$n
filename=$basename.$tag

echo "Docker build start"

docker build -t $basename:$tag .


if [ $? -eq 0 ]; then
    echo "Docker build finish"

    #   保存镜像到本地
    docker save -o $filename.tar $basename:$tag
    echo 'success'
    echo "==================================" >>docker_build_log.txt
    echo "result: SUCCESS" >>docker_build_log.txt

else
    echo 'failed'
    echo "==================================" >>docker_build_log.txt
    echo "result: FAILED" >>docker_build_log.txt
fi
duration=$SECONDS
echo "$(($duration / 60)) 分 and $(($duration % 60)) 秒"
let n++
echo "build time "$time >>docker_build_log.txt
echo "耗时$(($duration / 60)) 分 $(($duration % 60)) 秒" >>docker_build_log.txt
echo $tag >>docker_build_log.txt
echo "build times: "$n >>docker_build_log.txt
# cat docker_build_log.txt
