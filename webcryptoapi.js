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
		importKey : function (success, error) {
            if (Cypher.key != null) {
                return success();
            }
            
            var userKey = prompt("Mot de passe ?");
            var self = this;

            window.crypto.subtle.digest(
                {
                    name: "SHA-256"
                },
                str2ab8(userKey)
            )
            .then(function(pass) {
                window.crypto.subtle.importKey(
                    "raw",
                    pass,
                    {
                        name: "AES-CBC",
                        length: 256
                    },
                    false,
                    ["encrypt", "decrypt"]
                )
                .then(function(key){
                    Cypher.key = key;
                    console.log(key);
                    success();
                })
                .catch(function(err){
                    console.error(err);
                    error(err);
                });
            })
            .catch(function(err) {
                console.error(err);
                error(err);
            });	
		},

		encrypt : function (text, success, error) {
            var self = this;
            
            this.importKey(
                function() {
                    var iv = window.crypto.getRandomValues(new Uint8Array(16));
                    window.crypto.subtle.encrypt(
                        {
                            name: "AES-CBC",
                            iv: iv
                        },
                        Cypher.key,
                        str2ab8(text)
                    )
                    .then(function(encrypted) {
                        success(window.btoa(ab82str(iv) + ab82str(encrypted)));
                    })
                    .catch(function(err) {
                        console.error(err);
                        error(err);
                    });
                },
                function(err) {
                    console.error(err);
                    error(err);
                }
            );
		},
		
		decrypt : function (data, success, error) {
            var self = this;
            
			this.importKey(
                function() {
                    data = window.atob(data);
                    var iv = str2ab8(data.slice(0, 16));
                    var text = str2ab8(data.slice(16));
                    
                    window.crypto.subtle.decrypt(
                        {
                            name: "AES-CBC",
                            iv: iv
                        },
                        Cypher.key,
                        text
                    )
                    .then(function(encrypted) {
                        success(ab82str(encrypted));
                    })
                    .catch(function(err) {
                        console.error(err);
                        error(err);
                    });
                },
                function(err) {
                    console.error(err);
                    error(err);
                }
            );
		}		
	}
})();

this.Cypher = new Cypher();
