#!/bin/bash
echo "clean.sh start"

for dir in ./static/js/app/boot/*
do
if test -d $dir
then

cd $dir

rm -f ./version.js
rm -f ./boot_aio.js

cd ../../../../../

echo "clean $dir done";

fi
done

echo "clean.sh done"

exit