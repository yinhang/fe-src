#!/bin/bash

sh build_rjs.sh

echo "build.sh start"

#删除老旧文件
rm -rf ../../static
rm -rf ../vm
rm -rf ../nodejs
rm -rf ../module

echo "fis build start"

fis3 release -w

echo "fis build done"

exit