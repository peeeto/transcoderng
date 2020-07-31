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

function objectFlattener(object) {
    return Reflect.apply(Array.prototype.concat, [], Object.keys(object).map(key => {
        if (object[key] instanceof Object) {
            return objectFlattener(object[key]);
        }
        return `${key}: ${object[key]}`;
    }));
}

function flatten(key, input, output) {
    if (isArray(input)) {
        for (var index = 0, length = input.length; index < length; index++) {
            flatten(key + "." + index, input[index], output);
        }
    } else if (isObject(input)) {
        for (var item in input) {
            if (input.hasOwnProperty(item)) {
                if (key === '') {
                    flatten(item, input[item], output);
                } else {
                    flatten(key + "." + item, input[item], output);
                }
            }
        }
    } else {
        // input = input.replaceAll('\"', '"');
        return output.push(key + "=" + input);
    }
}

function isArray(obj) {
    return obj != null && (Array.isArray(obj) || obj.toString() === '[object Array]');
}

function isObject(obj) {
    return obj === Object(obj);
}

function yamlToProperties(str) {
    try {
        let yaml = jsyaml.safeLoad(str);
        console.log(yaml);
        // let flat = objectFlattener(yaml);
        output = [];
        flatten('', yaml, output);
        console.log(output);
        return output.join("\n");
        // return JSON.stringify(yaml)
        //     .replace(/,/g,'\n')
        //     .replace(/\\/g,'')
        //     .replace(/"/g,'')
        //     .replace(/:/g,'.')
        //     .replace(/}/g,'')
        //     .replace(/{/g,'')
    } catch (error) {
        var msg = 'Not yaml: ' + error;
        alert(msg);
        console.log(msg);
    }
}

//TODO
function propertiesToYaml(str) {
    try {
        let split = str.split("\n");
        split = split.sort();
        let result = {};
        let objects = {};
        for (const line of split) {
            const value = line.replace('.*?=', '');
            const wholeKey = line.replace('=.*?', '');
            const objectKey = wholeKey.replace(/(\.\s)+[^.]$/, 'and $1');
            const key = wholeKey.replace(/.*,(.*)$/, "$1");
            let o = objects[objectKey];
            if (objects[objectKey] == null) {
                o = objects[objectKey] = {}
            }
            Object.assign(o, {[`${key}`]: value});
            // const keyItems = key.split(".");
            // for (let index = 0, length = keyItems.length; index < length; index++) {
            //     if (index > length) {
            //         Object.assign(result, {[`${keyItems[index]}`]: value});
            //     } else {
            //         Object.assign(result, {[`${keyItems[index]}`]: keyItems[index + 1]});
            //     }
            // }

        }
        return objects;
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

function bc(passwordToCheck, toHash, rounds, callbackEncSucc, callbackCheckSucc, callbackErr, salt) {
    var bcrypt = new bCrypt();

    if (passwordToCheck.length <= 0) {
        if (!!rounds) {
            salt = bcrypt.gensalt(parseInt(rounds));
        }
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
