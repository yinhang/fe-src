#!/bin/bash

sh build_rjs.sh

echo "build.sh start"

#删除老旧文件
sh delete_oldfiles.sh

echo "fis build start"

fis3 release -w

echo "fis build done"

exit