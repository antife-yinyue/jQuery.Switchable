#!/bin/tcsh
# Jar file path
set COMPILER_JAR = 'compiler.jar'

# Error single
set ERROR_NO_JAVA  = 5
set FILE_NOT_MATCH = 10
set JAR_NOT_EXIST  = 15
set COMPRESS_FAILD = 20

# Check Java wether installed
if (`printenv JAVA_HOME` == "") then 
    echo "JAVA_HOME is missing, maybe Java SDK not installed?"
    exit $ERROR_NO_JAVA
endif

# reset jar file with the same path by script 
set -r COMPILER_JAR = "`dirname $0`/$COMPILER_JAR"

# check $COMPILER_JAR whether exit
if (-r $COMPILER_JAR != 1) then
    echo "$COMPILER_JAR not exist"; exit $JAR_NOT_EXIST
endif


# jquery.switchable-2.0.min.js
java -jar compiler.jar --charset=utf-8 --js=../src/core.js --js=../src/anim.js --js=../src/easing.js --js=../src/autoplay.js --js=../src/carousel.js --js=../src/effect.fade.js --js=../src/effect.scroll.js --js=../src/effect.accordion.js --js_output_file=../build/jquery.switchable-2.0.min.js
# Is success?
if (-r ../build/jquery.switchable-2.0.min.js) then
    echo "done"
else
    echo "compress faild"; exit COMPRESS_FAILD 
endif

exit 0