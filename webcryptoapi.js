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
		//this.iv = window.crypto.getRandomValues(new Uint8Array(16));
	}

	Cypher.prototype = {
		importKey : function (success, err) {

			if(this.key == null){
				this.key = prompt("Enter key code");
			}

			window.crypto.subtle.digest(
				{
					name: "SHA-256"
				},
				str2ab16(this.key)
			)
			.then(function(hashedKey){
				window.crypto.subtle.importKey(
					"raw",
					hashedKey,
					{
						name: "AES-CBC",
						length: 256
					},
					false,
					["encrypt", "decrypt"]
				)
				.then(function(key){
					success(key);
				});
			})
		},

		encrypt : function (text, success, err) {
			var iv = window.crypto.getRandomValues(new Uint8Array(16));
			Cypher.importKey(
				function(key){
					window.crypto.subtle.encrypt(
						{
							name: "AES-CBC",
							iv: iv
						},
						key,
						str2ab16(text)
					).then(function(result){
						success(window.btoa(iv + ";" + ab82str(result)))
					}).catch(function(error){
						console.log(error);
					});
				}
			);
		},
		
		decrypt : function (data, success, err) {
			data = window.atob(data);
			var iv = data.split(";")[0];
			data = str2ab8(data.replace(iv + ";", ""));
			iv = new Uint8Array(iv.split(","));

			Cypher.importKey(
				function(key){
					window.crypto.subtle.decrypt(
						{
							name: "AES-CBC",
							iv: iv
						},
						key,
						data
					).then(function(result){
						success(ab162str(result))
					}).catch(function(error){
						console.error(error);
					})
				}
			);
		}		
	}
})();

this.Cypher = new Cypher();
