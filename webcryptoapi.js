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
				if(this.key===null){

					var password= prompt("Saisissez une clé", "<Entrez ici votre clé>");
					var self = this;
					///// On cherche l'empreinte de la clé
					window.crypto.subtle.digest(
							{
								name: "SHA-256",
							},
							str2ab16(password) // La donnée type source
					)
					.then(function(hash){
						window.crypto.subtle.importKey(

								"raw", // format de la clef
								hash, // clef au bon format
								{
									name: "AES-CBC", // Algorithme cible
									length: 256
								},
								false,
								["encrypt", "decrypt"]
						)
						.then(function(key){
							success(key);
						})
						.catch(function(err){
							console.error(err)
						})
					})
					.catch(function(err){
						console.error(err);
					});									
				}


			},

			encrypt : function (text, success, err) {

				var self = this;
				window.Cypher.importKey(function(key){

					window.crypto.subtle.encrypt(
							{
								name:"AES-CBC", 
								iv: self.iv // Paramètres d'identification de l'algorithme cible
							},
							key, // clef au format interne générée par generateKey ou importKey
							str2ab16(text)// Donnée claire au format ArrayBuffer
					)
					.then(function(encrypted){
						// encrypted sont les données chiffrées sous forme d'ArrayBuffer
						success(btoa(ab82str(self.iv) + ab82str(encrypted)));
					})
					.catch(function(err){
						console.error(err)
					});

				});											
			},

			decrypt : function (data, success, err) {
				var self=this;
				window.Cypher.importKey(function(key){
					window.crypto.subtle.decrypt(
							{
								name:"AES-CBC", 
								iv: str2ab8(atob(data)).slice(0,16) // Paramètres d'identification de l'algorithme cible, // Paramètres d'identification de l'algorithme cible
							},

							key, // clef au format interne générée par generateKey ou importKey
							str2ab8(atob(data)).slice(16) // Données chiffrées au format ArrayBuffer
					)
					.then(function(decrypted){
						// decrypted sont les données claires sous forme d'ArrayBuffer
						success(ab162str(decrypted));
					})
					.catch(function(err){
						console.log(err);
					});
				});
			}		
	}
})();

this.Cypher = new Cypher();
