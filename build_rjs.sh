#!/bin/bash
echo "build_rjs.sh start"

for dir in ./static/js/app/boot/*
do
    if test -d $dir
    then

        cd $dir

        #生成version.js
        touch version.js
        echo "var version = `date +%s`;" > version.js
        #path src

        echo "in `pwd`"
        echo "build $dir"
        #打包Boot.js
        cp ../rjsbuild.txt ../../../rjsbuild.txt
        chmod 777 ../../../rjsbuild.txt
        cp ./boot.js ../../../boot.js
        chmod 777 ../../../boot.js
        cd ../../..
        r.js -o rjsbuild.txt out=boot_aio.js optimize=none
        mv ./boot_aio.js ../../$dir/boot_aio.js
        rm -f boot.js
        rm -f rjsbuild.txt
        cd ../../$dir


        cd ../../../../../

        echo "build $dir done";

    fi
done

echo "build_rjs.sh done"

exit