// var editor = ace.edit("panel");
// editor.setTheme("ace/theme/twilight");
// editor.session.setMode("ace/mode/javascript");


// GUI functions
function initBCryptRounds(max, panel) {
    for (jj = 4; jj < max; jj++) {
        var option = new Option(jj, jj);
        if (jj === 12) {
            option.selected = true;
        }
        panel.append(option);
    }
}

$(function () {
    initBCryptRounds(32, $("#bcryptRounds"))
});

//$(function () {
//    var selectAll = function () {
//        this.select();
//    };
//    $(document).one('click', 'input[type=text]', selectAll);
//    $(document).one('click', 'textarea', selectAll);
//});


function getPanel() {
    return $('#panel');
}

// computation functions

Math.log2 = Math.log2 || function (x) {
    return Math.log(x) * Math.LOG2E;
};
// var scrypt = scrypt_module_factory(function (scrypt) {
//     scrypt.to_hex(scrypt.random_bytes(16));
// });

var bcrypt = new bCrypt();

function xmlFormat(str) {
    try {
        return vkbeautify.xml(str);
    } catch (error) {
        var msg = 'Not XML: ' + error;
        alert(msg);
        console.log(msg);
    }
}

function jsonFormat(str) {
    try {
        var ap = false;
        if (str.indexOf("'") > 0) {
            str = str.replace(/'/g, "\"");
            //str = str.replace(/([a-z][^:]*)(?=\s*:)/g, '"$1"');
            ap = true
        }
        var result = JSON.stringify(JSON.parse(str), null, 4);
        if (ap === true) {
            result = result.replace(/"/g, "'");
        }
        return result;
    } catch (error) {
        var msg = 'Not JSON: ' + error;
        alert(msg);
        console.log(msg);
    }
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}

function getValue(element) {
    if (typeof editor !== "undefined") {
        if (editor.getSelectedText() === "") {
            return editor.getSession().getValue();
        } else {
            return editor.getSelectedText();
        }
    } else {
        return element.html();
    }
}

function setValue(element, result) {
    if (typeof editor !== "undefined") {
        if (editor.getSelectedText() === "") {
            return editor.getSession().setValue(result);
        } else {
            var range = editor.getSession().getSelection().getRange();
            editor.getSession().replace(range, result);
            editor.findPrevious(result, {
                wrap: true,
                caseSensitive: true,
                wholeWord: false,
                regExp: false,
                preventScroll: false
            });
            return result;
        }
    } else {
        return element.html(result);
    }
}

function beautifyJson() {
    if (typeof editor !== "undefined") {
        var beautify = ace.require('ace/ext/beautify');
        beautify.beautify(editor.getSession());
    }
}

function encode(element, hashFunc, toStringFunc) {
    var selected = getValue(element);
    var hash = hashFunc(selected);
    var result = hash.toString(toStringFunc);
    setValue(element, result);
    return result;
}

function prepareUtf16String(str) {
    return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    });
}

function stringToMillis(date) {
    if (!!date) {
        var m = moment(date, 'YYYY-MM-DD HH:mm:ss.SSS Z');
        if (m.isValid()) {
            return m.valueOf();
        }
    }
    return new Date().getTime();
}

function millisToString(date) {
    if (!isInt(date)) {
        date = new Date().getTime();
    }
    return moment.utc(parseInt(date)).format('YYYY-MM-DD HH:mm:ss.SSS Z');
}

function bc(passwordToCheck, toHash, rounds, callbackEncSucc, callbackCheckSucc, callbackErr) {
    if (passwordToCheck.length <= 0) {
        var salt = bcrypt.gensalt(parseInt(rounds));
        bcrypt.hashpw(toHash, salt, function (hash) {
            callbackEncSucc(hash);
        });
    } else {
        try {
            bcrypt.checkpw(passwordToCheck, toHash, function (res) {
                callbackCheckSucc(res);
            });
        } catch (err) {
            callbackErr(err);
        }
    }
}

// function f() {
//
//     scrypt_module_factory(function (scrypt) {
//         console.log(
//             scrypt.crypto_scrypt(
//                 scrypt.encode_utf8("pleaseletmein"),
//                 scrypt.encode_utf8("SodiumChloride"),
//                 16384, 8, 1, 64));
//     })
// }


function sc(passwordToCheck, toHash, salt, n, r, p, callback) {
    scrypt_module_factory(function (scrypt) {
        if (passwordToCheck.trim().length <= 0) {
            var hash = scrypt.crypto_scrypt(
                scrypt.encode_utf8(toHash),
                scrypt.encode_utf8(salt),
                parseInt(n), parseInt(r), parseInt(p), 64);
            var params = (((Math.log2(n) << 16) | (r << 8) | p)).toString(16);
            var slt = btoa(salt);
            var derived = btoa(String.fromCharCode.apply(null, hash));
            callback("$s0$" + params + "$" + slt + "$" + derived);
        } else {
            try {
                var parts = toHash.split("\$");
                if (parts.length != 5 || parts[1] !== 's0') {
                    alert("Invalid format of validated string")
                } else {
                    params = parseInt(parts[2], 16);
                    salt = atob(parts[3]);
                    var passKey = parts[4];
                    n = Math.pow(2, params >> 16 & 0xffff);
                    r = params >> 8 & 0xff;
                    p = params & 0xff;
                    hash = scrypt.crypto_scrypt(
                        scrypt.encode_utf8(passwordToCheck),
                        scrypt.encode_utf8(salt),
                        n, r, p, 64);
                    derived = btoa(String.fromCharCode.apply(null, hash));
                    var res = (passKey === derived);
                    alert("Password and Hash are: " + (!!res ? "OK" : "NOT ok"));
                }
            } catch (error) {
                alert("Hash does not contain Salt to check");
            }
            return toHash;
        }
    });
}

function cleanupBase64(str) {
    return str.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function jwtPrapare(header, payload, secret) {
    var headerEncoded = cleanupBase64(base64Encode(header));
    var payloadEncoded = cleanupBase64(base64Encode(payload));
    var signature = CryptoJS.HmacSHA256(headerEncoded + "." + payloadEncoded, secret).toString(CryptoJS.enc.Base64);
    return cleanupBase64((headerEncoded + "." + payloadEncoded + "." + signature));
}

function base64Encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function base64Decode(str) {
    return decodeURIComponent(escape(atob(str)));
}

function toUpperCase(str) {
    return str.toUpperCase();
}

function toLowerCase(str) {
    return str.toLowerCase();
}
