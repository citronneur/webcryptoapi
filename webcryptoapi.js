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

	}

	Cypher.prototype = {
		importKey : function (self, success, error) {
			var password = window.prompt("Choose password ?");
			window.crypto.subtle.digest(
			{
				name: "SHA-256",
			},
			str2ab16(password) 						// La donnée type source
			)
			.then(function(hash) {
				window.crypto.subtle.importKey(
					"raw", 							// format de la clef
					hash,
					{name : "AES-CBC", iv : self.iv}, // Algo
					false,
					["encrypt", "decrypt"]
				).then(function(key){
				 	success(key);
				})
				.catch(function(err){
					console.error(err);
				});
			}).catch(function(err) {
				console.error(err);
			})
		},

		encrypt : function (text, success, err) {
			var self = this;
			self.iv = window.crypto.getRandomValues(new Uint8Array(16));
			this.importKey(self, function(key) {
				window.crypto.subtle.encrypt(
					{name : "AES-CBC", iv : self.iv},	// Paramètres d'identification de l'algorithme cible
					key, 								// clef au format interne générée par generateKey ou importKey
					str2ab16(text)				 		// Donnée claire au format ArrayBuffer
				)
				.then(function(encrypted){
					// encrypted sont les données chiffrées sous forme d'ArrayBuffer
					var b64 = window.btoa(self.iv+"|"+ab82str(encrypted));
					success(b64);
				})
				.catch(function(err){
					console.error(err);
				});
			}),
			function(err){
				console.log(err);
			}
		},
		
		decrypt : function (text, success, err) {
			var self = this;
			b64Decode = window.atob(text);
			var ivOld = b64Decode.split("|")[0];
			console.log(ivOld);
			text = b64Decode.split("|")[1];
			self.iv = new Uint8Array(ivOld.split(","));
			this.importKey(self, function(key) {
				window.crypto.subtle.decrypt(
					{name : "AES-CBC", iv : self.iv}, 
					key, 
					str2ab8(text)
				)
				.then(function(decrypted){
					/*Données à déchiffrer*/
					var ret = ab162str(decrypted);
					success(ret);
				})
				.catch(function(err){
					alert("WRONG PASSWORD");
					console.error(err);
				});
			}),
			function(err){
				console.log(err);
			}
		},	
	}
})();

this.Cypher = new Cypher();