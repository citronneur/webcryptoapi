(function () {
	function str2ab16(str) {
		var ab = new ArrayBuffer(str.length * 2);
		var abView = new Uint16Array(ab);
		str.split("").forEach(function (value, index) {
			abView[index] = value.charCodeAt(0);
		});
		return ab;
	}

	function str2ab8(str) {
		var ab = new ArrayBuffer(str.length);
		var abView = new Uint8Array(ab);
		str.split("").forEach(function (value, index) {
			abView[index] = value.charCodeAt(0);
		});
		return ab;
	}

	function ab82str(ab) {
		str = "";
		new Uint8Array(ab).forEach(function (value) {
			str += String.fromCharCode(value);
		});
		return str;
	}

	function ab162str(ab) {
		str = "";
		new Uint16Array(ab).forEach(function (value) {
			str += String.fromCharCode(value);
		});
		return str;
	}

	Cypher = function () {
		this.key = null;
	}

	Cypher.prototype = {
		importKey: function (self, success, err) {

			if (self.key == null || self.key == undefined) {
				self.key = str2ab8(prompt("Enter key code"));
			}

			console.log(self.iv);
			self.alg = { name: 'AES-CBC', iv: self.iv };

			window.crypto.subtle.digest("SHA-256", self.key).then(function (hashKey) {

				crypto.subtle.importKey('raw', hashKey, self.alg, false, ['encrypt', 'decrypt']).then(function (key) {
					success(key);
				});
			})

		},

		encrypt: function (text, success, err) {
			var self = this;
			text = str2ab16(text);
			self.iv = window.crypto.getRandomValues(new Uint8Array(16));

			Cypher.importKey(self, function (key) {
				crypto.subtle.encrypt(self.alg, key, text).then(function (ab) {
					success(window.btoa(self.iv + ";" + ab82str(ab)));
				}).catch(function (error) {
					console.error(error);
				});
			});
		},

		decrypt: function (text, success, err) {
			var self = this;
			var tmp = window.atob(text);
			self.iv = tmp.split(";")[0];
			text = str2ab8(tmp.replace(self.iv + ";", ""));

			self.iv = new Uint8Array(self.iv.split(","));

			Cypher.importKey(self, function (key) {
				crypto.subtle.decrypt(self.alg, key, text).then(function (ab) {
					success(ab162str(ab));
				}).catch(function (error) {
					console.error(error);
				});
			}, function () {

			});
		}
	}
})();

this.Cypher = new Cypher();
