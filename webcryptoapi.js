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

		/*------- Automatic iv ---------*/
		var password = "";
		do{
			password = window.prompt("Choose a password less than 8 characters");
			console.log(password.length);
			if(password.length < 8){
				do{
					password = "0"+password;
				}while(password.length < 8)
			}
		}while(password.length > 8)
		password = str2ab16(password);
		this.iv = password;

		/*------- Manual iv ---------*/
		/*this.iv = window.crypto.getRandomValues(new Uint8Array(16));*/

		this.algo = {name : "AES-CBC", iv : this.iv};
	}

	Cypher.prototype = {
		importKey : function (success, error) {
			// var password = window.prompt("Choose password ?");
			var self = this;
			window.crypto.subtle.digest(
			{
				name: "SHA-256",
			},
			this.iv // La donnée type source
			)
			.then(function(hash) {
				window.crypto.subtle.importKey(
					"raw", // format de la clef
					hash,
					self.algo,
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
			this.importKey(function(key) {
				window.crypto.subtle.encrypt(
					self.algo, // Paramètres d'identification de l'algorithme cible
					key, // clef au format interne générée par generateKey ou importKey
					str2ab16(self.iv+"|"+text) // Donnée claire au format ArrayBuffer
				)
				.then(function(encrypted){
				// encrypted sont les données chiffrées sous forme d'ArrayBuffer

					
					var b64 = window.btoa(ab82str(encrypted));
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
			this.importKey(function(key) {
				window.crypto.subtle.decrypt(
					self.algo, 
					key, 
					str2ab8(window.atob(text))
				)
				.then(function(decrypted){
					/*Données à déchiffrer*/
					console.log(decrypted);
					var b64Decode = ab162str(decrypted);
					/*Deux parties iv|chaine*/
					console.log(str2ab16(b64Decode.split("|")[0]) );/*
					if(!= str2ab16(self.vi)){
						alert("WRONG...");
					}*/
					success(b64Decode.split("|")[1]);

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