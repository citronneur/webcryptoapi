(function() {
    function str2ab16(str) {
        var ab = new ArrayBuffer(str.length * 2);
        var abView = new Uint16Array(ab);
        str.split("").forEach(function(value, index) {
            abView[index] = value.charCodeAt(0);
        });
        return ab;
    }

    function str2ab8(str) {
        var ab = new ArrayBuffer(str.length);
        var abView = new Uint8Array(ab);
        str.split("").forEach(function(value, index) {
            abView[index] = value.charCodeAt(0);
        });
        return ab;
    }

    function ab82str(ab) {
        str = "";
        new Uint8Array(ab).forEach(function(value) {
            str += String.fromCharCode(value);
        });
        return str;
    }

    function ab162str(ab) {
        str = "";
        new Uint16Array(ab).forEach(function(value) {
            str += String.fromCharCode(value);
        });
        return str;
    }

    Cypher = function() {
        this.key = null;
    }

    Cypher.prototype = {
        importKey : function (success, err) {
            var self = this;
            if (this.key == null) {
                var rawKey = prompt('Veuillez saisir une cle');
                var ab8key = str2ab8(rawKey);
                window.crypto.subtle.digest("SHA-256", ab8key)
                    .then(function(hash) {
                        window.crypto.subtle.importKey(
                            "raw",
                            new Uint8Array(hash),
                            {name: "AES-CBC", length: 256},
                            false,
                            ["encrypt", "decrypt"])
                            .then(function(encrypt) { self.key = encrypt; success();})
                            .catch(function(error) {err(error)});
                    }).catch(function(error) {err(error)});
            } else {
                success();
            }
        },

        encrypt : function (text, success, err) {
            var self = this;
            this.importKey(
                function() {
                    var iv = window.crypto.getRandomValues(new Uint8Array(16));
                    window.crypto.subtle.encrypt(
                        {name: "AES-CBC", iv: iv},
                        self.key,
                        str2ab16(text))
                        .then(function(result) {success(window.btoa(ab82str(iv) + ab82str(result)));})
                        .catch(function(error) {err(error);});
                },
                function(error) {err(error);});
        },

        decrypt : function (data, success, err) {
            var self = this;
            this.importKey(
                function() {
                    var ab = str2ab8(window.atob(data));
                    var iv =  new Uint8Array(ab.slice(0, 16));
                    var dataAb = new Uint8Array(ab.slice(16));
                    window.crypto.subtle.decrypt(
                        {name: "AES-CBC", iv: iv},
                        self.key,
                        dataAb)
                        .then(function(result) {success(ab162str(result));})
                        .catch(function(error) {err(error);});
                },
                function(error) {err(error);});
        }
    }
})();

this.Cypher = new Cypher();