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
		this.iv = window.crypto.getRandomValues(new Uint8Array(16));
	}

	Cypher.prototype = {
		importKey : function (success, err) {
            var self = this;

            var password = window.prompt("Password : ");

            window.crypto.subtle.digest(
            {
            name: "SHA-256",
            },
            str2ab8(password),
            )
            .then(function(pass){
                window.crypto.subtle.importKey(
                "raw", // format de la clef
                pass,// clef au bon format
                {
                name: "AES-CBC", // Algorithme cible
                length: 256
                },
                false,
                ["encrypt", "decrypt"]
                )
                .then(function(key){
                // retourne l'objet clef sous forme de KeyObject
                    console.log(key);
                    self.key = key;
                    success();
                })
                .catch(function(err){
                    console.error(err);
                });
            })
            .catch(function(err){
                console.error(err);
            });
		},

		encrypt : function (text, success, err) {
            var self = this;

            this.importKey(function(){

                window.crypto.subtle.encrypt(
                {
                name: "AES-CBC", // Paramètres d'identification de l'algorithme cible
                iv : self.iv,
                },
                self.key, // clef au format interne générée par generateKey ou importKey
                str2ab8(text), // Donnée claire au format ArrayBuffer
                )
                .then(function(encrypted){
                // encrypted sont les données chiffrées sous forme d'ArrayBuffer
                    success(window.btoa(ab82str(encrypted)));
                })
                .catch(function(err){
                    console.error(err);
                });
            }, function(){

            });
		},

		decrypt : function (data, success, err) {
            var self = this;

            this.importKey(function(){
                window.crypto.subtle.decrypt(
                {
                name: "AES-CBC", // Paramètres d'identification de l'algorithme cible
                iv : self.iv,
                },
                self.key, // clef au format interne générée par generateKey ou importKey
                str2ab8(window.atob(data)), // Donnée claire au format ArrayBuffer
                )
                .then(function(decrypted){
                // decrypted sont les données claires sous forme d'ArrayBuffer
                    success(ab82str(decrypted));
                })
                .catch(function(err){
                    console.error(err);
                });
            },
            function(){

            });
		}
	}
})();

this.Cypher = new Cypher();
