mkdir .\build
mkdir .\build\css
mkdir .\build\images
mkdir .\build\js
mkdir .\build\lib
copy .\manifest.json .\build
copy .\popup.html .\build
copy .\options.html .\build
copy .\css\* .\build\css
copy .\images\train-icon-128.png .\build\images
copy .\images\train-icon-48.png .\build\images
copy .\images\train-icon-16.png .\build\images
copy .\images\train-icon-small.png .\build\images
copy .\js\* .\build\js
copy .\lib\jquery-1.8.3.js .\build\lib
copy .\lib\jquery-ui-1.9.2.custom.js .\build\lib
copy .\lib\oauth.js .\build\lib
copy .\lib\sha1.js .\build\lib