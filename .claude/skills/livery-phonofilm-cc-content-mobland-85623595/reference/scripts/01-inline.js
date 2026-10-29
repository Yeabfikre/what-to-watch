(function () {
				function at(n) {
					n = Math.trunc(n) || 0;
					if (n < 0) n += this.length;
					return n < 0 || n >= this.length ? undefined : this[n];
				}
				if (!Array.prototype.at)
					Object.defineProperty(Array.prototype, 'at', {
						value: at,
						writable: true,
						configurable: true
					});
				if (!String.prototype.at)
					Object.defineProperty(String.prototype, 'at', {
						value: at,
						writable: true,
						configurable: true
					});
				if (!Array.prototype.findLast)
					Object.defineProperty(Array.prototype, 'findLast', {
						value: function (fn, self) {
							for (var i = this.length - 1; i >= 0; i--) {
								if (fn.call(self, this[i], i, this)) return this[i];
							}
						},
						writable: true,
						configurable: true
					});
				if (!Array.prototype.findLastIndex)
					Object.defineProperty(Array.prototype, 'findLastIndex', {
						value: function (fn, self) {
							for (var i = this.length - 1; i >= 0; i--) {
								if (fn.call(self, this[i], i, this)) return i;
							}
							return -1;
						},
						writable: true,
						configurable: true
					});
				if (!Object.hasOwn)
					Object.defineProperty(Object, 'hasOwn', {
						value: function (o, k) {
							return Object.prototype.hasOwnProperty.call(o, k);
						},
						writable: true,
						configurable: true
					});
			})();