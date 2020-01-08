#!/usr/bin/env bash

# All .js compiled into a single one.
LIBS="./assets/js/libs"
compiled=${LIBS}/../main.js

cd ${LIBS}; wget -N "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"; cd ../../..
cd ${LIBS}; wget -N "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/md5.js"; cd ../../..
cd ${LIBS}; wget -N "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha1.js"; cd ../../..
cd ${LIBS}; wget -N "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha3.js"; cd ../../..
cd ${LIBS}; wget -N "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha256.js"; cd ../../..
cd ${LIBS}; wget -N "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha512.js"; cd ../../..
cd ${LIBS}; wget -N "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/ripemd160.js"; cd ../../..
cd ${LIBS}; wget -N "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/enc-base64-min.js"; cd ../../..
cd ${LIBS}; wget -N "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/hmac-md5.js"; cd ../../..
cd ${LIBS}; wget -N "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/hmac-sha1.js"; cd ../../..
cd ${LIBS}; wget -N "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/hmac-sha256.js"; cd ../../..
cd ${LIBS}; wget -N "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/hmac-sha512.js"; cd ../../..
cd ${LIBS}; wget -N "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/pbkdf2.js"; cd ../../..
cd ${LIBS}; wget -N "http://momentjs.com/downloads/moment-with-locales.min.js"; cd ../../..
find ${LIBS} -type f -name "*.js" | xargs cat > ${compiled}

