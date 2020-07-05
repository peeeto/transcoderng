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

function getPanel() {
    return $('#panel');
}

// computation functions

Math.log2 = Math.log2 || function (x) {
    return Math.log(x) * Math.LOG2E;
};

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

function yamlToProperties(str) {
    try {
        return jsyaml.safeLoad(str);
    } catch (error) {
        var msg = 'Not yaml: ' + error;
        alert(msg);
        console.log(msg);
    }
}

function propertiesToYaml(str) {
    try {
        //TODO
        return str;
    } catch (error) {
        var msg = 'Not properties: ' + error;
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
        var m = moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
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
    return moment.utc(parseInt(date)).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
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

function sc(passwordToCheck, toHash, salt, nCpuCost, rMemoryCost, pParallelisation, callback, buflen) {
    scrypt_module_factory(function (scrypt) {
        if (passwordToCheck.trim().length <= 0) {
            var hash = scrypt.crypto_scrypt(
                scrypt.encode_utf8(toHash),
                scrypt.encode_utf8(salt),
                parseInt(nCpuCost), parseInt(rMemoryCost), parseInt(pParallelisation), buflen);
            var params = (((Math.log2(nCpuCost) << 16) | (rMemoryCost << 8) | pParallelisation)).toString(16);
            var slt = btoa(salt);
            var derived = btoa(String.fromCharCode.apply(null, hash));
            callback("$" + params + "$" + slt + "$" + derived);
        } else {
            try {
                var parts = toHash.split("\$");
                if (parts.length != 4) {
                    alert("Invalid format of validated string")
                } else {
                    params = parseInt(parts[1], 16);
                    salt = atob(parts[2]);
                    var passKey = parts[3];
                    nCpuCost = Math.pow(2, params >> 16 & 0xffff);
                    rMemoryCost = params >> 8 & 0xff;
                    pParallelisation = params & 0xff;
                    hash = scrypt.crypto_scrypt(
                        scrypt.encode_utf8(passwordToCheck),
                        scrypt.encode_utf8(salt),
                        nCpuCost, rMemoryCost, pParallelisation, buflen);
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


function cronExpressionDecode(cronExcpression) {
    return cronstrue.toString(cronExcpression, {locale: "en"});
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
