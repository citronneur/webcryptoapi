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
		this.iv = null;
	}

	Cypher.prototype = {
		importKey : function (success, err) {
			if (this.key == null)
			{
				this.key = prompt('Clé de chiffrement ?');
			}

			window.crypto.subtle.digest(
				{
					name: 'SHA-256',
				},
				str2ab16(this.key)
			)
			.then(function(hash){
				window.crypto.subtle.importKey(
					"raw",
					hash,
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
			.catch(function(error) {
				err(error);
			});
		},

		encrypt : function (text, success, err) {
			var iv = window.crypto.getRandomValues(new Uint8Array(16))
			this.importKey(
				function(key) {
					window.crypto.subtle.encrypt(
						{
							name: 'AES-CBC',
							iv: iv
						},
						key,
						str2ab16(text)
					)
					.then(function(result) {
						success(window.btoa(iv + ';' + ab82str(result)));
					});
				},
				function(error) {
					err(error);
				}
			);
		},
		
		decrypt : function (data, success, err) {
			data = window.atob(data);
			var iv = data.split(";")[0];
			var text = str2ab8(data.replace(iv + ";", ""));
			iv = new Uint8Array(iv.split(","));

			this.importKey(
				function (key) {
					crypto.subtle.decrypt(
						{
							name: 'AES-CBC',
							iv: iv
						},
						key,
						text
					)
					.then(function (ab) {
						success(ab162str(ab));
					})
					.catch(function (error) {
						console.error(error);
					});
				},
				function(error) {
					err(error);
				}
			);
		}
	}
})();

this.Cypher = new Cypher();
