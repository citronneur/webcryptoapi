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
				var pass = prompt("Password?")
				window.crypto.subtle.digest( {
				name: "SHA-256",
				},
				str2ab16(pass) // La donnée type source
				) .then(function(hash){
				// hash contient le résultat sous forme de ArrayBuffer
					window.crypto.subtle.importKey(
						"raw",								// format de la clef
						hash,
						{
							name: "AES-CBC",				// Algorithme cible
							length: 256 
						},

						false,
						["encrypt", "decrypt"]
					)

					.then(function(key){
					// retourne l'objet clef sous forme de KeyObject
						success(key);
					}) 
					.catch(function(err){
					});
				 })
				.catch(function(err){ console.error(err);
				});
		},

		encrypt : function (text, success, err) {
			this.importKey(function(key){
				var iv = window.crypto.getRandomValues(new Uint8Array(16));

				window.crypto.subtle.encrypt(
					{ name: "AES-CBC", iv: iv },	// Paramètres d'identification de l'algorithme cible
					key,									// clef au format interne générée par generateKey ou importKey
					str2ab16(text)									// Donnée claire au format ArrayBuffer
					)
					.then(function(encrypted){
					    // encrypted sont les données chiffrées sous forme d'ArrayBuffer
					    success(btoa(ab82str(iv) + ab82str(encrypted)));
					})
					.catch(function(err){
						console.log(err);
					});
			})
		},
		
		decrypt : function (data, success, err) {
 			this.importKey(function(key){

				var ivAndData = str2ab8(atob(data));
				var ivrecup =  new Uint8Array(ivAndData.slice(0, 16)); 
				var data2 = new Uint8Array(ivAndData.slice(16));
				
				window.crypto.subtle.decrypt(
		        { name: "AES-CBC", iv: ivrecup },
		        key,
		        data2
		        )
		      	.then(function(decrypted){
		        	success(ab162str(decrypted));					
					})
					.catch(function(err){
						console.log(err);
					});
			})
		}		
	}
})();


this.Cypher = new Cypher();
