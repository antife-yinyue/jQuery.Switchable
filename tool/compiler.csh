#!/bin/tcsh

# jquery.switchable-2.0.min.js
java -jar compiler.jar --charset=utf-8 --js=../src/core.js --js=../src/anim.js --js=../src/easing.js --js=../src/autoplay.js --js=../src/carousel.js --js=../src/effect.fade.js --js=../src/effect.scroll.js --js=../src/effect.accordion.js --js_output_file=../build/jquery.switchable-2.0.min.js
if (-r ../build/jquery.switchable-2.0.min.js) then
  echo "done";
  exit 0
else
  echo "compress faild";
  exit 1
endif