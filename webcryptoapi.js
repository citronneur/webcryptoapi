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
			
		},

		encrypt : function (text, success, err) {
			
		},
		
		decrypt : function (data, success, err) {
			
		}		
	}
})();

this.Cypher = new Cypher();
