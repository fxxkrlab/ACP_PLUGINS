import { useState as e } from "react";
import { useMutation as t, useQuery as n, useQueryClient as r } from "@tanstack/react-query";
import { BarChart3 as i, Check as a, CheckCircle as o, Clock as s, Database as c, ExternalLink as l, Film as u, FlaskConical as d, Key as f, Loader2 as p, Plus as m, Save as h, Trash2 as g, X as _, XCircle as v } from "lucide-react";
//#region \0rolldown/runtime.js
var y = Object.defineProperty, b = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), x = (e, t) => {
	let n = {};
	for (var r in e) y(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || y(n, Symbol.toStringTag, { value: "Module" }), n;
}, S = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, { get: (e, t) => (typeof require < "u" ? require : e)[t] }) : e)(function(e) {
	if (typeof require < "u") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + e + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
});
//#endregion
//#region node_modules/axios/lib/helpers/bind.js
function C(e, t) {
	return function() {
		return e.apply(t, arguments);
	};
}
//#endregion
//#region node_modules/axios/lib/utils.js
var { toString: w } = Object.prototype, { getPrototypeOf: T } = Object, { iterator: E, toStringTag: D } = Symbol, O = ((e) => (t) => {
	let n = w.call(t);
	return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(Object.create(null)), k = (e) => (e = e.toLowerCase(), (t) => O(t) === e), A = (e) => (t) => typeof t === e, { isArray: j } = Array, M = A("undefined");
function N(e) {
	return e !== null && !M(e) && e.constructor !== null && !M(e.constructor) && F(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
var P = k("ArrayBuffer");
function ee(e) {
	let t;
	return t = typeof ArrayBuffer < "u" && ArrayBuffer.isView ? ArrayBuffer.isView(e) : e && e.buffer && P(e.buffer), t;
}
var te = A("string"), F = A("function"), I = A("number"), L = (e) => typeof e == "object" && !!e, ne = (e) => e === !0 || e === !1, re = (e) => {
	if (O(e) !== "object") return !1;
	let t = T(e);
	return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(D in e) && !(E in e);
}, ie = (e) => {
	if (!L(e) || N(e)) return !1;
	try {
		return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
	} catch {
		return !1;
	}
}, ae = k("Date"), oe = k("File"), se = (e) => !!(e && e.uri !== void 0), ce = (e) => e && e.getParts !== void 0, le = k("Blob"), ue = k("FileList"), de = (e) => L(e) && F(e.pipe);
function fe() {
	return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
var pe = fe(), me = pe.FormData === void 0 ? void 0 : pe.FormData, he = (e) => {
	let t;
	return e && (me && e instanceof me || F(e.append) && ((t = O(e)) === "formdata" || t === "object" && F(e.toString) && e.toString() === "[object FormData]"));
}, ge = k("URLSearchParams"), [_e, ve, ye, be] = [
	"ReadableStream",
	"Request",
	"Response",
	"Headers"
].map(k), xe = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function R(e, t, { allOwnKeys: n = !1 } = {}) {
	if (e == null) return;
	let r, i;
	if (typeof e != "object" && (e = [e]), j(e)) for (r = 0, i = e.length; r < i; r++) t.call(null, e[r], r, e);
	else {
		if (N(e)) return;
		let i = n ? Object.getOwnPropertyNames(e) : Object.keys(e), a = i.length, o;
		for (r = 0; r < a; r++) o = i[r], t.call(null, e[o], o, e);
	}
}
function Se(e, t) {
	if (N(e)) return null;
	t = t.toLowerCase();
	let n = Object.keys(e), r = n.length, i;
	for (; r-- > 0;) if (i = n[r], t === i.toLowerCase()) return i;
	return null;
}
var z = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Ce = (e) => !M(e) && e !== z;
function we() {
	let { caseless: e, skipUndefined: t } = Ce(this) && this || {}, n = {}, r = (r, i) => {
		if (i === "__proto__" || i === "constructor" || i === "prototype") return;
		let a = e && Se(n, i) || i;
		re(n[a]) && re(r) ? n[a] = we(n[a], r) : re(r) ? n[a] = we({}, r) : j(r) ? n[a] = r.slice() : (!t || !M(r)) && (n[a] = r);
	};
	for (let e = 0, t = arguments.length; e < t; e++) arguments[e] && R(arguments[e], r);
	return n;
}
var Te = (e, t, n, { allOwnKeys: r } = {}) => (R(t, (t, r) => {
	n && F(t) ? Object.defineProperty(e, r, {
		value: C(t, n),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : Object.defineProperty(e, r, {
		value: t,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}, { allOwnKeys: r }), e), Ee = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), De = (e, t, n, r) => {
	e.prototype = Object.create(t.prototype, r), Object.defineProperty(e.prototype, "constructor", {
		value: e,
		writable: !0,
		enumerable: !1,
		configurable: !0
	}), Object.defineProperty(e, "super", { value: t.prototype }), n && Object.assign(e.prototype, n);
}, Oe = (e, t, n, r) => {
	let i, a, o, s = {};
	if (t ||= {}, e == null) return t;
	do {
		for (i = Object.getOwnPropertyNames(e), a = i.length; a-- > 0;) o = i[a], (!r || r(o, e, t)) && !s[o] && (t[o] = e[o], s[o] = !0);
		e = n !== !1 && T(e);
	} while (e && (!n || n(e, t)) && e !== Object.prototype);
	return t;
}, ke = (e, t, n) => {
	e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
	let r = e.indexOf(t, n);
	return r !== -1 && r === n;
}, Ae = (e) => {
	if (!e) return null;
	if (j(e)) return e;
	let t = e.length;
	if (!I(t)) return null;
	let n = Array(t);
	for (; t-- > 0;) n[t] = e[t];
	return n;
}, je = ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && T(Uint8Array)), Me = (e, t) => {
	let n = (e && e[E]).call(e), r;
	for (; (r = n.next()) && !r.done;) {
		let n = r.value;
		t.call(e, n[0], n[1]);
	}
}, Ne = (e, t) => {
	let n, r = [];
	for (; (n = e.exec(t)) !== null;) r.push(n);
	return r;
}, Pe = k("HTMLFormElement"), Fe = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(e, t, n) {
	return t.toUpperCase() + n;
}), Ie = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), Le = k("RegExp"), Re = (e, t) => {
	let n = Object.getOwnPropertyDescriptors(e), r = {};
	R(n, (n, i) => {
		let a;
		(a = t(n, i, e)) !== !1 && (r[i] = a || n);
	}), Object.defineProperties(e, r);
}, ze = (e) => {
	Re(e, (t, n) => {
		if (F(e) && [
			"arguments",
			"caller",
			"callee"
		].indexOf(n) !== -1) return !1;
		let r = e[n];
		if (F(r)) {
			if (t.enumerable = !1, "writable" in t) {
				t.writable = !1;
				return;
			}
			t.set ||= () => {
				throw Error("Can not rewrite read-only method '" + n + "'");
			};
		}
	});
}, Be = (e, t) => {
	let n = {}, r = (e) => {
		e.forEach((e) => {
			n[e] = !0;
		});
	};
	return j(e) ? r(e) : r(String(e).split(t)), n;
}, Ve = () => {}, He = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function Ue(e) {
	return !!(e && F(e.append) && e[D] === "FormData" && e[E]);
}
var We = (e) => {
	let t = Array(10), n = (e, r) => {
		if (L(e)) {
			if (t.indexOf(e) >= 0) return;
			if (N(e)) return e;
			if (!("toJSON" in e)) {
				t[r] = e;
				let i = j(e) ? [] : {};
				return R(e, (e, t) => {
					let a = n(e, r + 1);
					!M(a) && (i[t] = a);
				}), t[r] = void 0, i;
			}
		}
		return e;
	};
	return n(e, 0);
}, Ge = k("AsyncFunction"), Ke = (e) => e && (L(e) || F(e)) && F(e.then) && F(e.catch), qe = ((e, t) => e ? setImmediate : t ? ((e, t) => (z.addEventListener("message", ({ source: n, data: r }) => {
	n === z && r === e && t.length && t.shift()();
}, !1), (n) => {
	t.push(n), z.postMessage(e, "*");
}))(`axios@${Math.random()}`, []) : (e) => setTimeout(e))(typeof setImmediate == "function", F(z.postMessage)), B = {
	isArray: j,
	isArrayBuffer: P,
	isBuffer: N,
	isFormData: he,
	isArrayBufferView: ee,
	isString: te,
	isNumber: I,
	isBoolean: ne,
	isObject: L,
	isPlainObject: re,
	isEmptyObject: ie,
	isReadableStream: _e,
	isRequest: ve,
	isResponse: ye,
	isHeaders: be,
	isUndefined: M,
	isDate: ae,
	isFile: oe,
	isReactNativeBlob: se,
	isReactNative: ce,
	isBlob: le,
	isRegExp: Le,
	isFunction: F,
	isStream: de,
	isURLSearchParams: ge,
	isTypedArray: je,
	isFileList: ue,
	forEach: R,
	merge: we,
	extend: Te,
	trim: xe,
	stripBOM: Ee,
	inherits: De,
	toFlatObject: Oe,
	kindOf: O,
	kindOfTest: k,
	endsWith: ke,
	toArray: Ae,
	forEachEntry: Me,
	matchAll: Ne,
	isHTMLForm: Pe,
	hasOwnProperty: Ie,
	hasOwnProp: Ie,
	reduceDescriptors: Re,
	freezeMethods: ze,
	toObjectSet: Be,
	toCamelCase: Fe,
	noop: Ve,
	toFiniteNumber: He,
	findKey: Se,
	global: z,
	isContextDefined: Ce,
	isSpecCompliantForm: Ue,
	toJSONObject: We,
	isAsyncFn: Ge,
	isThenable: Ke,
	setImmediate: qe,
	asap: typeof queueMicrotask < "u" ? queueMicrotask.bind(z) : typeof process < "u" && process.nextTick || qe,
	isIterable: (e) => e != null && F(e[E])
}, V = class e extends Error {
	static from(t, n, r, i, a, o) {
		let s = new e(t.message, n || t.code, r, i, a);
		return s.cause = t, s.name = t.name, t.status != null && s.status == null && (s.status = t.status), o && Object.assign(s, o), s;
	}
	constructor(e, t, n, r, i) {
		super(e), Object.defineProperty(this, "message", {
			value: e,
			enumerable: !0,
			writable: !0,
			configurable: !0
		}), this.name = "AxiosError", this.isAxiosError = !0, t && (this.code = t), n && (this.config = n), r && (this.request = r), i && (this.response = i, this.status = i.status);
	}
	toJSON() {
		return {
			message: this.message,
			name: this.name,
			description: this.description,
			number: this.number,
			fileName: this.fileName,
			lineNumber: this.lineNumber,
			columnNumber: this.columnNumber,
			stack: this.stack,
			config: B.toJSONObject(this.config),
			code: this.code,
			status: this.status
		};
	}
};
V.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE", V.ERR_BAD_OPTION = "ERR_BAD_OPTION", V.ECONNABORTED = "ECONNABORTED", V.ETIMEDOUT = "ETIMEDOUT", V.ERR_NETWORK = "ERR_NETWORK", V.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS", V.ERR_DEPRECATED = "ERR_DEPRECATED", V.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE", V.ERR_BAD_REQUEST = "ERR_BAD_REQUEST", V.ERR_CANCELED = "ERR_CANCELED", V.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT", V.ERR_INVALID_URL = "ERR_INVALID_URL";
//#endregion
//#region node_modules/axios/lib/helpers/toFormData.js
function Je(e) {
	return B.isPlainObject(e) || B.isArray(e);
}
function Ye(e) {
	return B.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function Xe(e, t, n) {
	return e ? e.concat(t).map(function(e, t) {
		return e = Ye(e), !n && t ? "[" + e + "]" : e;
	}).join(n ? "." : "") : t;
}
function Ze(e) {
	return B.isArray(e) && !e.some(Je);
}
var Qe = B.toFlatObject(B, {}, null, function(e) {
	return /^is[A-Z]/.test(e);
});
function H(e, t, n) {
	if (!B.isObject(e)) throw TypeError("target must be an object");
	t ||= new FormData(), n = B.toFlatObject(n, {
		metaTokens: !0,
		dots: !1,
		indexes: !1
	}, !1, function(e, t) {
		return !B.isUndefined(t[e]);
	});
	let r = n.metaTokens, i = n.visitor || l, a = n.dots, o = n.indexes, s = (n.Blob || typeof Blob < "u" && Blob) && B.isSpecCompliantForm(t);
	if (!B.isFunction(i)) throw TypeError("visitor must be a function");
	function c(e) {
		if (e === null) return "";
		if (B.isDate(e)) return e.toISOString();
		if (B.isBoolean(e)) return e.toString();
		if (!s && B.isBlob(e)) throw new V("Blob is not supported. Use a Buffer instead.");
		return B.isArrayBuffer(e) || B.isTypedArray(e) ? s && typeof Blob == "function" ? new Blob([e]) : Buffer.from(e) : e;
	}
	function l(e, n, i) {
		let s = e;
		if (B.isReactNative(t) && B.isReactNativeBlob(e)) return t.append(Xe(i, n, a), c(e)), !1;
		if (e && !i && typeof e == "object") {
			if (B.endsWith(n, "{}")) n = r ? n : n.slice(0, -2), e = JSON.stringify(e);
			else if (B.isArray(e) && Ze(e) || (B.isFileList(e) || B.endsWith(n, "[]")) && (s = B.toArray(e))) return n = Ye(n), s.forEach(function(e, r) {
				!(B.isUndefined(e) || e === null) && t.append(o === !0 ? Xe([n], r, a) : o === null ? n : n + "[]", c(e));
			}), !1;
		}
		return Je(e) ? !0 : (t.append(Xe(i, n, a), c(e)), !1);
	}
	let u = [], d = Object.assign(Qe, {
		defaultVisitor: l,
		convertValue: c,
		isVisitable: Je
	});
	function f(e, n) {
		if (!B.isUndefined(e)) {
			if (u.indexOf(e) !== -1) throw Error("Circular reference detected in " + n.join("."));
			u.push(e), B.forEach(e, function(e, r) {
				(!(B.isUndefined(e) || e === null) && i.call(t, e, B.isString(r) ? r.trim() : r, n, d)) === !0 && f(e, n ? n.concat(r) : [r]);
			}), u.pop();
		}
	}
	if (!B.isObject(e)) throw TypeError("data must be an object");
	return f(e), t;
}
//#endregion
//#region node_modules/axios/lib/helpers/AxiosURLSearchParams.js
function $e(e) {
	let t = {
		"!": "%21",
		"'": "%27",
		"(": "%28",
		")": "%29",
		"~": "%7E",
		"%20": "+",
		"%00": "\0"
	};
	return encodeURIComponent(e).replace(/[!'()~]|%20|%00/g, function(e) {
		return t[e];
	});
}
function et(e, t) {
	this._pairs = [], e && H(e, this, t);
}
var tt = et.prototype;
tt.append = function(e, t) {
	this._pairs.push([e, t]);
}, tt.toString = function(e) {
	let t = e ? function(t) {
		return e.call(this, t, $e);
	} : $e;
	return this._pairs.map(function(e) {
		return t(e[0]) + "=" + t(e[1]);
	}, "").join("&");
};
//#endregion
//#region node_modules/axios/lib/helpers/buildURL.js
function nt(e) {
	return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function rt(e, t, n) {
	if (!t) return e;
	let r = n && n.encode || nt, i = B.isFunction(n) ? { serialize: n } : n, a = i && i.serialize, o;
	if (o = a ? a(t, i) : B.isURLSearchParams(t) ? t.toString() : new et(t, i).toString(r), o) {
		let t = e.indexOf("#");
		t !== -1 && (e = e.slice(0, t)), e += (e.indexOf("?") === -1 ? "?" : "&") + o;
	}
	return e;
}
//#endregion
//#region node_modules/axios/lib/core/InterceptorManager.js
var it = class {
	constructor() {
		this.handlers = [];
	}
	use(e, t, n) {
		return this.handlers.push({
			fulfilled: e,
			rejected: t,
			synchronous: n ? n.synchronous : !1,
			runWhen: n ? n.runWhen : null
		}), this.handlers.length - 1;
	}
	eject(e) {
		this.handlers[e] && (this.handlers[e] = null);
	}
	clear() {
		this.handlers &&= [];
	}
	forEach(e) {
		B.forEach(this.handlers, function(t) {
			t !== null && e(t);
		});
	}
}, at = {
	silentJSONParsing: !0,
	forcedJSONParsing: !0,
	clarifyTimeoutError: !1,
	legacyInterceptorReqResOrdering: !0
}, ot = {
	isBrowser: !0,
	classes: {
		URLSearchParams: typeof URLSearchParams < "u" ? URLSearchParams : et,
		FormData: typeof FormData < "u" ? FormData : null,
		Blob: typeof Blob < "u" ? Blob : null
	},
	protocols: [
		"http",
		"https",
		"file",
		"blob",
		"url",
		"data"
	]
}, st = /* @__PURE__ */ x({
	hasBrowserEnv: () => ct,
	hasStandardBrowserEnv: () => ut,
	hasStandardBrowserWebWorkerEnv: () => dt,
	navigator: () => lt,
	origin: () => ft
}), ct = typeof window < "u" && typeof document < "u", lt = typeof navigator == "object" && navigator || void 0, ut = ct && (!lt || [
	"ReactNative",
	"NativeScript",
	"NS"
].indexOf(lt.product) < 0), dt = typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope && typeof self.importScripts == "function", ft = ct && window.location.href || "http://localhost", U = {
	...st,
	...ot
};
//#endregion
//#region node_modules/axios/lib/helpers/toURLEncodedForm.js
function pt(e, t) {
	return H(e, new U.classes.URLSearchParams(), {
		visitor: function(e, t, n, r) {
			return U.isNode && B.isBuffer(e) ? (this.append(t, e.toString("base64")), !1) : r.defaultVisitor.apply(this, arguments);
		},
		...t
	});
}
//#endregion
//#region node_modules/axios/lib/helpers/formDataToJSON.js
function mt(e) {
	return B.matchAll(/\w+|\[(\w*)]/g, e).map((e) => e[0] === "[]" ? "" : e[1] || e[0]);
}
function ht(e) {
	let t = {}, n = Object.keys(e), r, i = n.length, a;
	for (r = 0; r < i; r++) a = n[r], t[a] = e[a];
	return t;
}
function gt(e) {
	function t(e, n, r, i) {
		let a = e[i++];
		if (a === "__proto__") return !0;
		let o = Number.isFinite(+a), s = i >= e.length;
		return a = !a && B.isArray(r) ? r.length : a, s ? (B.hasOwnProp(r, a) ? r[a] = [r[a], n] : r[a] = n, !o) : ((!r[a] || !B.isObject(r[a])) && (r[a] = []), t(e, n, r[a], i) && B.isArray(r[a]) && (r[a] = ht(r[a])), !o);
	}
	if (B.isFormData(e) && B.isFunction(e.entries)) {
		let n = {};
		return B.forEachEntry(e, (e, r) => {
			t(mt(e), r, n, 0);
		}), n;
	}
	return null;
}
//#endregion
//#region node_modules/axios/lib/defaults/index.js
function _t(e, t, n) {
	if (B.isString(e)) try {
		return (t || JSON.parse)(e), B.trim(e);
	} catch (e) {
		if (e.name !== "SyntaxError") throw e;
	}
	return (n || JSON.stringify)(e);
}
var W = {
	transitional: at,
	adapter: [
		"xhr",
		"http",
		"fetch"
	],
	transformRequest: [function(e, t) {
		let n = t.getContentType() || "", r = n.indexOf("application/json") > -1, i = B.isObject(e);
		if (i && B.isHTMLForm(e) && (e = new FormData(e)), B.isFormData(e)) return r ? JSON.stringify(gt(e)) : e;
		if (B.isArrayBuffer(e) || B.isBuffer(e) || B.isStream(e) || B.isFile(e) || B.isBlob(e) || B.isReadableStream(e)) return e;
		if (B.isArrayBufferView(e)) return e.buffer;
		if (B.isURLSearchParams(e)) return t.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), e.toString();
		let a;
		if (i) {
			if (n.indexOf("application/x-www-form-urlencoded") > -1) return pt(e, this.formSerializer).toString();
			if ((a = B.isFileList(e)) || n.indexOf("multipart/form-data") > -1) {
				let t = this.env && this.env.FormData;
				return H(a ? { "files[]": e } : e, t && new t(), this.formSerializer);
			}
		}
		return i || r ? (t.setContentType("application/json", !1), _t(e)) : e;
	}],
	transformResponse: [function(e) {
		let t = this.transitional || W.transitional, n = t && t.forcedJSONParsing, r = this.responseType === "json";
		if (B.isResponse(e) || B.isReadableStream(e)) return e;
		if (e && B.isString(e) && (n && !this.responseType || r)) {
			let n = !(t && t.silentJSONParsing) && r;
			try {
				return JSON.parse(e, this.parseReviver);
			} catch (e) {
				if (n) throw e.name === "SyntaxError" ? V.from(e, V.ERR_BAD_RESPONSE, this, null, this.response) : e;
			}
		}
		return e;
	}],
	timeout: 0,
	xsrfCookieName: "XSRF-TOKEN",
	xsrfHeaderName: "X-XSRF-TOKEN",
	maxContentLength: -1,
	maxBodyLength: -1,
	env: {
		FormData: U.classes.FormData,
		Blob: U.classes.Blob
	},
	validateStatus: function(e) {
		return e >= 200 && e < 300;
	},
	headers: { common: {
		Accept: "application/json, text/plain, */*",
		"Content-Type": void 0
	} }
};
B.forEach([
	"delete",
	"get",
	"head",
	"post",
	"put",
	"patch"
], (e) => {
	W.headers[e] = {};
});
//#endregion
//#region node_modules/axios/lib/helpers/parseHeaders.js
var vt = B.toObjectSet([
	"age",
	"authorization",
	"content-length",
	"content-type",
	"etag",
	"expires",
	"from",
	"host",
	"if-modified-since",
	"if-unmodified-since",
	"last-modified",
	"location",
	"max-forwards",
	"proxy-authorization",
	"referer",
	"retry-after",
	"user-agent"
]), yt = (e) => {
	let t = {}, n, r, i;
	return e && e.split("\n").forEach(function(e) {
		i = e.indexOf(":"), n = e.substring(0, i).trim().toLowerCase(), r = e.substring(i + 1).trim(), !(!n || t[n] && vt[n]) && (n === "set-cookie" ? t[n] ? t[n].push(r) : t[n] = [r] : t[n] = t[n] ? t[n] + ", " + r : r);
	}), t;
}, bt = Symbol("internals");
function G(e) {
	return e && String(e).trim().toLowerCase();
}
function xt(e) {
	return e === !1 || e == null ? e : B.isArray(e) ? e.map(xt) : String(e);
}
function St(e) {
	let t = Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g, r;
	for (; r = n.exec(e);) t[r[1]] = r[2];
	return t;
}
var Ct = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function wt(e, t, n, r, i) {
	if (B.isFunction(r)) return r.call(this, t, n);
	if (i && (t = n), B.isString(t)) {
		if (B.isString(r)) return t.indexOf(r) !== -1;
		if (B.isRegExp(r)) return r.test(t);
	}
}
function Tt(e) {
	return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (e, t, n) => t.toUpperCase() + n);
}
function Et(e, t) {
	let n = B.toCamelCase(" " + t);
	[
		"get",
		"set",
		"has"
	].forEach((r) => {
		Object.defineProperty(e, r + n, {
			value: function(e, n, i) {
				return this[r].call(this, t, e, n, i);
			},
			configurable: !0
		});
	});
}
var K = class {
	constructor(e) {
		e && this.set(e);
	}
	set(e, t, n) {
		let r = this;
		function i(e, t, n) {
			let i = G(t);
			if (!i) throw Error("header name must be a non-empty string");
			let a = B.findKey(r, i);
			(!a || r[a] === void 0 || n === !0 || n === void 0 && r[a] !== !1) && (r[a || t] = xt(e));
		}
		let a = (e, t) => B.forEach(e, (e, n) => i(e, n, t));
		if (B.isPlainObject(e) || e instanceof this.constructor) a(e, t);
		else if (B.isString(e) && (e = e.trim()) && !Ct(e)) a(yt(e), t);
		else if (B.isObject(e) && B.isIterable(e)) {
			let n = {}, r, i;
			for (let t of e) {
				if (!B.isArray(t)) throw TypeError("Object iterator must return a key-value pair");
				n[i = t[0]] = (r = n[i]) ? B.isArray(r) ? [...r, t[1]] : [r, t[1]] : t[1];
			}
			a(n, t);
		} else e != null && i(t, e, n);
		return this;
	}
	get(e, t) {
		if (e = G(e), e) {
			let n = B.findKey(this, e);
			if (n) {
				let e = this[n];
				if (!t) return e;
				if (t === !0) return St(e);
				if (B.isFunction(t)) return t.call(this, e, n);
				if (B.isRegExp(t)) return t.exec(e);
				throw TypeError("parser must be boolean|regexp|function");
			}
		}
	}
	has(e, t) {
		if (e = G(e), e) {
			let n = B.findKey(this, e);
			return !!(n && this[n] !== void 0 && (!t || wt(this, this[n], n, t)));
		}
		return !1;
	}
	delete(e, t) {
		let n = this, r = !1;
		function i(e) {
			if (e = G(e), e) {
				let i = B.findKey(n, e);
				i && (!t || wt(n, n[i], i, t)) && (delete n[i], r = !0);
			}
		}
		return B.isArray(e) ? e.forEach(i) : i(e), r;
	}
	clear(e) {
		let t = Object.keys(this), n = t.length, r = !1;
		for (; n--;) {
			let i = t[n];
			(!e || wt(this, this[i], i, e, !0)) && (delete this[i], r = !0);
		}
		return r;
	}
	normalize(e) {
		let t = this, n = {};
		return B.forEach(this, (r, i) => {
			let a = B.findKey(n, i);
			if (a) {
				t[a] = xt(r), delete t[i];
				return;
			}
			let o = e ? Tt(i) : String(i).trim();
			o !== i && delete t[i], t[o] = xt(r), n[o] = !0;
		}), this;
	}
	concat(...e) {
		return this.constructor.concat(this, ...e);
	}
	toJSON(e) {
		let t = Object.create(null);
		return B.forEach(this, (n, r) => {
			n != null && n !== !1 && (t[r] = e && B.isArray(n) ? n.join(", ") : n);
		}), t;
	}
	[Symbol.iterator]() {
		return Object.entries(this.toJSON())[Symbol.iterator]();
	}
	toString() {
		return Object.entries(this.toJSON()).map(([e, t]) => e + ": " + t).join("\n");
	}
	getSetCookie() {
		return this.get("set-cookie") || [];
	}
	get [Symbol.toStringTag]() {
		return "AxiosHeaders";
	}
	static from(e) {
		return e instanceof this ? e : new this(e);
	}
	static concat(e, ...t) {
		let n = new this(e);
		return t.forEach((e) => n.set(e)), n;
	}
	static accessor(e) {
		let t = (this[bt] = this[bt] = { accessors: {} }).accessors, n = this.prototype;
		function r(e) {
			let r = G(e);
			t[r] || (Et(n, e), t[r] = !0);
		}
		return B.isArray(e) ? e.forEach(r) : r(e), this;
	}
};
K.accessor([
	"Content-Type",
	"Content-Length",
	"Accept",
	"Accept-Encoding",
	"User-Agent",
	"Authorization"
]), B.reduceDescriptors(K.prototype, ({ value: e }, t) => {
	let n = t[0].toUpperCase() + t.slice(1);
	return {
		get: () => e,
		set(e) {
			this[n] = e;
		}
	};
}), B.freezeMethods(K);
//#endregion
//#region node_modules/axios/lib/core/transformData.js
function Dt(e, t) {
	let n = this || W, r = t || n, i = K.from(r.headers), a = r.data;
	return B.forEach(e, function(e) {
		a = e.call(n, a, i.normalize(), t ? t.status : void 0);
	}), i.normalize(), a;
}
//#endregion
//#region node_modules/axios/lib/cancel/isCancel.js
function Ot(e) {
	return !!(e && e.__CANCEL__);
}
//#endregion
//#region node_modules/axios/lib/cancel/CanceledError.js
var q = class extends V {
	constructor(e, t, n) {
		super(e ?? "canceled", V.ERR_CANCELED, t, n), this.name = "CanceledError", this.__CANCEL__ = !0;
	}
};
//#endregion
//#region node_modules/axios/lib/core/settle.js
function kt(e, t, n) {
	let r = n.config.validateStatus;
	!n.status || !r || r(n.status) ? e(n) : t(new V("Request failed with status code " + n.status, [V.ERR_BAD_REQUEST, V.ERR_BAD_RESPONSE][Math.floor(n.status / 100) - 4], n.config, n.request, n));
}
//#endregion
//#region node_modules/axios/lib/helpers/parseProtocol.js
function At(e) {
	let t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
	return t && t[1] || "";
}
//#endregion
//#region node_modules/axios/lib/helpers/speedometer.js
function jt(e, t) {
	e ||= 10;
	let n = Array(e), r = Array(e), i = 0, a = 0, o;
	return t = t === void 0 ? 1e3 : t, function(s) {
		let c = Date.now(), l = r[a];
		o ||= c, n[i] = s, r[i] = c;
		let u = a, d = 0;
		for (; u !== i;) d += n[u++], u %= e;
		if (i = (i + 1) % e, i === a && (a = (a + 1) % e), c - o < t) return;
		let f = l && c - l;
		return f ? Math.round(d * 1e3 / f) : void 0;
	};
}
//#endregion
//#region node_modules/axios/lib/helpers/throttle.js
function Mt(e, t) {
	let n = 0, r = 1e3 / t, i, a, o = (t, r = Date.now()) => {
		n = r, i = null, a &&= (clearTimeout(a), null), e(...t);
	};
	return [(...e) => {
		let t = Date.now(), s = t - n;
		s >= r ? o(e, t) : (i = e, a ||= setTimeout(() => {
			a = null, o(i);
		}, r - s));
	}, () => i && o(i)];
}
//#endregion
//#region node_modules/axios/lib/helpers/progressEventReducer.js
var Nt = (e, t, n = 3) => {
	let r = 0, i = jt(50, 250);
	return Mt((n) => {
		let a = n.loaded, o = n.lengthComputable ? n.total : void 0, s = a - r, c = i(s), l = a <= o;
		r = a, e({
			loaded: a,
			total: o,
			progress: o ? a / o : void 0,
			bytes: s,
			rate: c || void 0,
			estimated: c && o && l ? (o - a) / c : void 0,
			event: n,
			lengthComputable: o != null,
			[t ? "download" : "upload"]: !0
		});
	}, n);
}, Pt = (e, t) => {
	let n = e != null;
	return [(r) => t[0]({
		lengthComputable: n,
		total: e,
		loaded: r
	}), t[1]];
}, Ft = (e) => (...t) => B.asap(() => e(...t)), It = U.hasStandardBrowserEnv ? ((e, t) => (n) => (n = new URL(n, U.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(new URL(U.origin), U.navigator && /(msie|trident)/i.test(U.navigator.userAgent)) : () => !0, Lt = U.hasStandardBrowserEnv ? {
	write(e, t, n, r, i, a, o) {
		if (typeof document > "u") return;
		let s = [`${e}=${encodeURIComponent(t)}`];
		B.isNumber(n) && s.push(`expires=${new Date(n).toUTCString()}`), B.isString(r) && s.push(`path=${r}`), B.isString(i) && s.push(`domain=${i}`), a === !0 && s.push("secure"), B.isString(o) && s.push(`SameSite=${o}`), document.cookie = s.join("; ");
	},
	read(e) {
		if (typeof document > "u") return null;
		let t = document.cookie.match(RegExp("(?:^|; )" + e + "=([^;]*)"));
		return t ? decodeURIComponent(t[1]) : null;
	},
	remove(e) {
		this.write(e, "", Date.now() - 864e5, "/");
	}
} : {
	write() {},
	read() {
		return null;
	},
	remove() {}
};
//#endregion
//#region node_modules/axios/lib/helpers/isAbsoluteURL.js
function Rt(e) {
	return typeof e == "string" ? /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e) : !1;
}
//#endregion
//#region node_modules/axios/lib/helpers/combineURLs.js
function zt(e, t) {
	return t ? e.replace(/\/?\/$/, "") + "/" + t.replace(/^\/+/, "") : e;
}
//#endregion
//#region node_modules/axios/lib/core/buildFullPath.js
function Bt(e, t, n) {
	let r = !Rt(t);
	return e && (r || n == 0) ? zt(e, t) : t;
}
//#endregion
//#region node_modules/axios/lib/core/mergeConfig.js
var Vt = (e) => e instanceof K ? { ...e } : e;
function J(e, t) {
	t ||= {};
	let n = {};
	function r(e, t, n, r) {
		return B.isPlainObject(e) && B.isPlainObject(t) ? B.merge.call({ caseless: r }, e, t) : B.isPlainObject(t) ? B.merge({}, t) : B.isArray(t) ? t.slice() : t;
	}
	function i(e, t, n, i) {
		if (!B.isUndefined(t)) return r(e, t, n, i);
		if (!B.isUndefined(e)) return r(void 0, e, n, i);
	}
	function a(e, t) {
		if (!B.isUndefined(t)) return r(void 0, t);
	}
	function o(e, t) {
		if (!B.isUndefined(t)) return r(void 0, t);
		if (!B.isUndefined(e)) return r(void 0, e);
	}
	function s(n, i, a) {
		if (a in t) return r(n, i);
		if (a in e) return r(void 0, n);
	}
	let c = {
		url: a,
		method: a,
		data: a,
		baseURL: o,
		transformRequest: o,
		transformResponse: o,
		paramsSerializer: o,
		timeout: o,
		timeoutMessage: o,
		withCredentials: o,
		withXSRFToken: o,
		adapter: o,
		responseType: o,
		xsrfCookieName: o,
		xsrfHeaderName: o,
		onUploadProgress: o,
		onDownloadProgress: o,
		decompress: o,
		maxContentLength: o,
		maxBodyLength: o,
		beforeRedirect: o,
		transport: o,
		httpAgent: o,
		httpsAgent: o,
		cancelToken: o,
		socketPath: o,
		responseEncoding: o,
		validateStatus: s,
		headers: (e, t, n) => i(Vt(e), Vt(t), n, !0)
	};
	return B.forEach(Object.keys({
		...e,
		...t
	}), function(r) {
		if (r === "__proto__" || r === "constructor" || r === "prototype") return;
		let a = B.hasOwnProp(c, r) ? c[r] : i, o = a(e[r], t[r], r);
		B.isUndefined(o) && a !== s || (n[r] = o);
	}), n;
}
//#endregion
//#region node_modules/axios/lib/helpers/resolveConfig.js
var Ht = (e) => {
	let t = J({}, e), { data: n, withXSRFToken: r, xsrfHeaderName: i, xsrfCookieName: a, headers: o, auth: s } = t;
	if (t.headers = o = K.from(o), t.url = rt(Bt(t.baseURL, t.url, t.allowAbsoluteUrls), e.params, e.paramsSerializer), s && o.set("Authorization", "Basic " + btoa((s.username || "") + ":" + (s.password ? unescape(encodeURIComponent(s.password)) : ""))), B.isFormData(n)) {
		if (U.hasStandardBrowserEnv || U.hasStandardBrowserWebWorkerEnv) o.setContentType(void 0);
		else if (B.isFunction(n.getHeaders)) {
			let e = n.getHeaders(), t = ["content-type", "content-length"];
			Object.entries(e).forEach(([e, n]) => {
				t.includes(e.toLowerCase()) && o.set(e, n);
			});
		}
	}
	if (U.hasStandardBrowserEnv && (r && B.isFunction(r) && (r = r(t)), r || r !== !1 && It(t.url))) {
		let e = i && a && Lt.read(a);
		e && o.set(i, e);
	}
	return t;
}, Ut = typeof XMLHttpRequest < "u" && function(e) {
	return new Promise(function(t, n) {
		let r = Ht(e), i = r.data, a = K.from(r.headers).normalize(), { responseType: o, onUploadProgress: s, onDownloadProgress: c } = r, l, u, d, f, p;
		function m() {
			f && f(), p && p(), r.cancelToken && r.cancelToken.unsubscribe(l), r.signal && r.signal.removeEventListener("abort", l);
		}
		let h = new XMLHttpRequest();
		h.open(r.method.toUpperCase(), r.url, !0), h.timeout = r.timeout;
		function g() {
			if (!h) return;
			let r = K.from("getAllResponseHeaders" in h && h.getAllResponseHeaders());
			kt(function(e) {
				t(e), m();
			}, function(e) {
				n(e), m();
			}, {
				data: !o || o === "text" || o === "json" ? h.responseText : h.response,
				status: h.status,
				statusText: h.statusText,
				headers: r,
				config: e,
				request: h
			}), h = null;
		}
		"onloadend" in h ? h.onloadend = g : h.onreadystatechange = function() {
			!h || h.readyState !== 4 || h.status === 0 && !(h.responseURL && h.responseURL.indexOf("file:") === 0) || setTimeout(g);
		}, h.onabort = function() {
			h &&= (n(new V("Request aborted", V.ECONNABORTED, e, h)), null);
		}, h.onerror = function(t) {
			let r = new V(t && t.message ? t.message : "Network Error", V.ERR_NETWORK, e, h);
			r.event = t || null, n(r), h = null;
		}, h.ontimeout = function() {
			let t = r.timeout ? "timeout of " + r.timeout + "ms exceeded" : "timeout exceeded", i = r.transitional || at;
			r.timeoutErrorMessage && (t = r.timeoutErrorMessage), n(new V(t, i.clarifyTimeoutError ? V.ETIMEDOUT : V.ECONNABORTED, e, h)), h = null;
		}, i === void 0 && a.setContentType(null), "setRequestHeader" in h && B.forEach(a.toJSON(), function(e, t) {
			h.setRequestHeader(t, e);
		}), B.isUndefined(r.withCredentials) || (h.withCredentials = !!r.withCredentials), o && o !== "json" && (h.responseType = r.responseType), c && ([d, p] = Nt(c, !0), h.addEventListener("progress", d)), s && h.upload && ([u, f] = Nt(s), h.upload.addEventListener("progress", u), h.upload.addEventListener("loadend", f)), (r.cancelToken || r.signal) && (l = (t) => {
			h &&= (n(!t || t.type ? new q(null, e, h) : t), h.abort(), null);
		}, r.cancelToken && r.cancelToken.subscribe(l), r.signal && (r.signal.aborted ? l() : r.signal.addEventListener("abort", l)));
		let _ = At(r.url);
		if (_ && U.protocols.indexOf(_) === -1) {
			n(new V("Unsupported protocol " + _ + ":", V.ERR_BAD_REQUEST, e));
			return;
		}
		h.send(i || null);
	});
}, Wt = (e, t) => {
	let { length: n } = e = e ? e.filter(Boolean) : [];
	if (t || n) {
		let n = new AbortController(), r, i = function(e) {
			if (!r) {
				r = !0, o();
				let t = e instanceof Error ? e : this.reason;
				n.abort(t instanceof V ? t : new q(t instanceof Error ? t.message : t));
			}
		}, a = t && setTimeout(() => {
			a = null, i(new V(`timeout of ${t}ms exceeded`, V.ETIMEDOUT));
		}, t), o = () => {
			e &&= (a && clearTimeout(a), a = null, e.forEach((e) => {
				e.unsubscribe ? e.unsubscribe(i) : e.removeEventListener("abort", i);
			}), null);
		};
		e.forEach((e) => e.addEventListener("abort", i));
		let { signal: s } = n;
		return s.unsubscribe = () => B.asap(o), s;
	}
}, Gt = function* (e, t) {
	let n = e.byteLength;
	if (!t || n < t) {
		yield e;
		return;
	}
	let r = 0, i;
	for (; r < n;) i = r + t, yield e.slice(r, i), r = i;
}, Kt = async function* (e, t) {
	for await (let n of qt(e)) yield* Gt(n, t);
}, qt = async function* (e) {
	if (e[Symbol.asyncIterator]) {
		yield* e;
		return;
	}
	let t = e.getReader();
	try {
		for (;;) {
			let { done: e, value: n } = await t.read();
			if (e) break;
			yield n;
		}
	} finally {
		await t.cancel();
	}
}, Jt = (e, t, n, r) => {
	let i = Kt(e, t), a = 0, o, s = (e) => {
		o || (o = !0, r && r(e));
	};
	return new ReadableStream({
		async pull(e) {
			try {
				let { done: t, value: r } = await i.next();
				if (t) {
					s(), e.close();
					return;
				}
				let o = r.byteLength;
				n && n(a += o), e.enqueue(new Uint8Array(r));
			} catch (e) {
				throw s(e), e;
			}
		},
		cancel(e) {
			return s(e), i.return();
		}
	}, { highWaterMark: 2 });
}, Yt = 64 * 1024, { isFunction: Xt } = B, Zt = (({ Request: e, Response: t }) => ({
	Request: e,
	Response: t
}))(B.global), { ReadableStream: Qt, TextEncoder: $t } = B.global, en = (e, ...t) => {
	try {
		return !!e(...t);
	} catch {
		return !1;
	}
}, tn = (e) => {
	e = B.merge.call({ skipUndefined: !0 }, Zt, e);
	let { fetch: t, Request: n, Response: r } = e, i = t ? Xt(t) : typeof fetch == "function", a = Xt(n), o = Xt(r);
	if (!i) return !1;
	let s = i && Xt(Qt), c = i && (typeof $t == "function" ? ((e) => (t) => e.encode(t))(new $t()) : async (e) => new Uint8Array(await new n(e).arrayBuffer())), l = a && s && en(() => {
		let e = !1, t = new n(U.origin, {
			body: new Qt(),
			method: "POST",
			get duplex() {
				return e = !0, "half";
			}
		}).headers.has("Content-Type");
		return e && !t;
	}), u = o && s && en(() => B.isReadableStream(new r("").body)), d = { stream: u && ((e) => e.body) };
	i && [
		"text",
		"arrayBuffer",
		"blob",
		"formData",
		"stream"
	].forEach((e) => {
		!d[e] && (d[e] = (t, n) => {
			let r = t && t[e];
			if (r) return r.call(t);
			throw new V(`Response type '${e}' is not supported`, V.ERR_NOT_SUPPORT, n);
		});
	});
	let f = async (e) => {
		if (e == null) return 0;
		if (B.isBlob(e)) return e.size;
		if (B.isSpecCompliantForm(e)) return (await new n(U.origin, {
			method: "POST",
			body: e
		}).arrayBuffer()).byteLength;
		if (B.isArrayBufferView(e) || B.isArrayBuffer(e)) return e.byteLength;
		if (B.isURLSearchParams(e) && (e += ""), B.isString(e)) return (await c(e)).byteLength;
	}, p = async (e, t) => B.toFiniteNumber(e.getContentLength()) ?? f(t);
	return async (e) => {
		let { url: i, method: o, data: s, signal: c, cancelToken: f, timeout: m, onDownloadProgress: h, onUploadProgress: g, responseType: _, headers: v, withCredentials: y = "same-origin", fetchOptions: b } = Ht(e), x = t || fetch;
		_ = _ ? (_ + "").toLowerCase() : "text";
		let S = Wt([c, f && f.toAbortSignal()], m), C = null, w = S && S.unsubscribe && (() => {
			S.unsubscribe();
		}), T;
		try {
			if (g && l && o !== "get" && o !== "head" && (T = await p(v, s)) !== 0) {
				let e = new n(i, {
					method: "POST",
					body: s,
					duplex: "half"
				}), t;
				if (B.isFormData(s) && (t = e.headers.get("content-type")) && v.setContentType(t), e.body) {
					let [t, n] = Pt(T, Nt(Ft(g)));
					s = Jt(e.body, Yt, t, n);
				}
			}
			B.isString(y) || (y = y ? "include" : "omit");
			let t = a && "credentials" in n.prototype, c = {
				...b,
				signal: S,
				method: o.toUpperCase(),
				headers: v.normalize().toJSON(),
				body: s,
				duplex: "half",
				credentials: t ? y : void 0
			};
			C = a && new n(i, c);
			let f = await (a ? x(C, b) : x(i, c)), m = u && (_ === "stream" || _ === "response");
			if (u && (h || m && w)) {
				let e = {};
				[
					"status",
					"statusText",
					"headers"
				].forEach((t) => {
					e[t] = f[t];
				});
				let t = B.toFiniteNumber(f.headers.get("content-length")), [n, i] = h && Pt(t, Nt(Ft(h), !0)) || [];
				f = new r(Jt(f.body, Yt, n, () => {
					i && i(), w && w();
				}), e);
			}
			_ ||= "text";
			let E = await d[B.findKey(d, _) || "text"](f, e);
			return !m && w && w(), await new Promise((t, n) => {
				kt(t, n, {
					data: E,
					headers: K.from(f.headers),
					status: f.status,
					statusText: f.statusText,
					config: e,
					request: C
				});
			});
		} catch (t) {
			throw w && w(), t && t.name === "TypeError" && /Load failed|fetch/i.test(t.message) ? Object.assign(new V("Network Error", V.ERR_NETWORK, e, C, t && t.response), { cause: t.cause || t }) : V.from(t, t && t.code, e, C, t && t.response);
		}
	};
}, nn = /* @__PURE__ */ new Map(), rn = (e) => {
	let t = e && e.env || {}, { fetch: n, Request: r, Response: i } = t, a = [
		r,
		i,
		n
	], o = a.length, s, c, l = nn;
	for (; o--;) s = a[o], c = l.get(s), c === void 0 && l.set(s, c = o ? /* @__PURE__ */ new Map() : tn(t)), l = c;
	return c;
};
rn();
//#endregion
//#region node_modules/axios/lib/adapters/adapters.js
var an = {
	http: null,
	xhr: Ut,
	fetch: { get: rn }
};
B.forEach(an, (e, t) => {
	if (e) {
		try {
			Object.defineProperty(e, "name", { value: t });
		} catch {}
		Object.defineProperty(e, "adapterName", { value: t });
	}
});
var on = (e) => `- ${e}`, sn = (e) => B.isFunction(e) || e === null || e === !1;
function cn(e, t) {
	e = B.isArray(e) ? e : [e];
	let { length: n } = e, r, i, a = {};
	for (let o = 0; o < n; o++) {
		r = e[o];
		let n;
		if (i = r, !sn(r) && (i = an[(n = String(r)).toLowerCase()], i === void 0)) throw new V(`Unknown adapter '${n}'`);
		if (i && (B.isFunction(i) || (i = i.get(t)))) break;
		a[n || "#" + o] = i;
	}
	if (!i) {
		let e = Object.entries(a).map(([e, t]) => `adapter ${e} ` + (t === !1 ? "is not supported by the environment" : "is not available in the build"));
		throw new V("There is no suitable adapter to dispatch the request " + (n ? e.length > 1 ? "since :\n" + e.map(on).join("\n") : " " + on(e[0]) : "as no adapter specified"), "ERR_NOT_SUPPORT");
	}
	return i;
}
var ln = {
	getAdapter: cn,
	adapters: an
};
//#endregion
//#region node_modules/axios/lib/core/dispatchRequest.js
function un(e) {
	if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted) throw new q(null, e);
}
function dn(e) {
	return un(e), e.headers = K.from(e.headers), e.data = Dt.call(e, e.transformRequest), [
		"post",
		"put",
		"patch"
	].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), ln.getAdapter(e.adapter || W.adapter, e)(e).then(function(t) {
		return un(e), t.data = Dt.call(e, e.transformResponse, t), t.headers = K.from(t.headers), t;
	}, function(t) {
		return Ot(t) || (un(e), t && t.response && (t.response.data = Dt.call(e, e.transformResponse, t.response), t.response.headers = K.from(t.response.headers))), Promise.reject(t);
	});
}
//#endregion
//#region node_modules/axios/lib/env/data.js
var fn = "1.13.6", pn = {};
[
	"object",
	"boolean",
	"number",
	"function",
	"string",
	"symbol"
].forEach((e, t) => {
	pn[e] = function(n) {
		return typeof n === e || "a" + (t < 1 ? "n " : " ") + e;
	};
});
var mn = {};
pn.transitional = function(e, t, n) {
	function r(e, t) {
		return "[Axios v" + fn + "] Transitional option '" + e + "'" + t + (n ? ". " + n : "");
	}
	return (n, i, a) => {
		if (e === !1) throw new V(r(i, " has been removed" + (t ? " in " + t : "")), V.ERR_DEPRECATED);
		return t && !mn[i] && (mn[i] = !0, console.warn(r(i, " has been deprecated since v" + t + " and will be removed in the near future"))), e ? e(n, i, a) : !0;
	};
}, pn.spelling = function(e) {
	return (t, n) => (console.warn(`${n} is likely a misspelling of ${e}`), !0);
};
function hn(e, t, n) {
	if (typeof e != "object") throw new V("options must be an object", V.ERR_BAD_OPTION_VALUE);
	let r = Object.keys(e), i = r.length;
	for (; i-- > 0;) {
		let a = r[i], o = t[a];
		if (o) {
			let t = e[a], n = t === void 0 || o(t, a, e);
			if (n !== !0) throw new V("option " + a + " must be " + n, V.ERR_BAD_OPTION_VALUE);
			continue;
		}
		if (n !== !0) throw new V("Unknown option " + a, V.ERR_BAD_OPTION);
	}
}
var gn = {
	assertOptions: hn,
	validators: pn
}, Y = gn.validators, X = class {
	constructor(e) {
		this.defaults = e || {}, this.interceptors = {
			request: new it(),
			response: new it()
		};
	}
	async request(e, t) {
		try {
			return await this._request(e, t);
		} catch (e) {
			if (e instanceof Error) {
				let t = {};
				Error.captureStackTrace ? Error.captureStackTrace(t) : t = /* @__PURE__ */ Error();
				let n = t.stack ? t.stack.replace(/^.+\n/, "") : "";
				try {
					e.stack ? n && !String(e.stack).endsWith(n.replace(/^.+\n.+\n/, "")) && (e.stack += "\n" + n) : e.stack = n;
				} catch {}
			}
			throw e;
		}
	}
	_request(e, t) {
		typeof e == "string" ? (t ||= {}, t.url = e) : t = e || {}, t = J(this.defaults, t);
		let { transitional: n, paramsSerializer: r, headers: i } = t;
		n !== void 0 && gn.assertOptions(n, {
			silentJSONParsing: Y.transitional(Y.boolean),
			forcedJSONParsing: Y.transitional(Y.boolean),
			clarifyTimeoutError: Y.transitional(Y.boolean),
			legacyInterceptorReqResOrdering: Y.transitional(Y.boolean)
		}, !1), r != null && (B.isFunction(r) ? t.paramsSerializer = { serialize: r } : gn.assertOptions(r, {
			encode: Y.function,
			serialize: Y.function
		}, !0)), t.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls === void 0 ? t.allowAbsoluteUrls = !0 : t.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls), gn.assertOptions(t, {
			baseUrl: Y.spelling("baseURL"),
			withXsrfToken: Y.spelling("withXSRFToken")
		}, !0), t.method = (t.method || this.defaults.method || "get").toLowerCase();
		let a = i && B.merge(i.common, i[t.method]);
		i && B.forEach([
			"delete",
			"get",
			"head",
			"post",
			"put",
			"patch",
			"common"
		], (e) => {
			delete i[e];
		}), t.headers = K.concat(a, i);
		let o = [], s = !0;
		this.interceptors.request.forEach(function(e) {
			if (typeof e.runWhen == "function" && e.runWhen(t) === !1) return;
			s &&= e.synchronous;
			let n = t.transitional || at;
			n && n.legacyInterceptorReqResOrdering ? o.unshift(e.fulfilled, e.rejected) : o.push(e.fulfilled, e.rejected);
		});
		let c = [];
		this.interceptors.response.forEach(function(e) {
			c.push(e.fulfilled, e.rejected);
		});
		let l, u = 0, d;
		if (!s) {
			let e = [dn.bind(this), void 0];
			for (e.unshift(...o), e.push(...c), d = e.length, l = Promise.resolve(t); u < d;) l = l.then(e[u++], e[u++]);
			return l;
		}
		d = o.length;
		let f = t;
		for (; u < d;) {
			let e = o[u++], t = o[u++];
			try {
				f = e(f);
			} catch (e) {
				t.call(this, e);
				break;
			}
		}
		try {
			l = dn.call(this, f);
		} catch (e) {
			return Promise.reject(e);
		}
		for (u = 0, d = c.length; u < d;) l = l.then(c[u++], c[u++]);
		return l;
	}
	getUri(e) {
		return e = J(this.defaults, e), rt(Bt(e.baseURL, e.url, e.allowAbsoluteUrls), e.params, e.paramsSerializer);
	}
};
B.forEach([
	"delete",
	"get",
	"head",
	"options"
], function(e) {
	X.prototype[e] = function(t, n) {
		return this.request(J(n || {}, {
			method: e,
			url: t,
			data: (n || {}).data
		}));
	};
}), B.forEach([
	"post",
	"put",
	"patch"
], function(e) {
	function t(t) {
		return function(n, r, i) {
			return this.request(J(i || {}, {
				method: e,
				headers: t ? { "Content-Type": "multipart/form-data" } : {},
				url: n,
				data: r
			}));
		};
	}
	X.prototype[e] = t(), X.prototype[e + "Form"] = t(!0);
});
//#endregion
//#region node_modules/axios/lib/cancel/CancelToken.js
var _n = class e {
	constructor(e) {
		if (typeof e != "function") throw TypeError("executor must be a function.");
		let t;
		this.promise = new Promise(function(e) {
			t = e;
		});
		let n = this;
		this.promise.then((e) => {
			if (!n._listeners) return;
			let t = n._listeners.length;
			for (; t-- > 0;) n._listeners[t](e);
			n._listeners = null;
		}), this.promise.then = (e) => {
			let t, r = new Promise((e) => {
				n.subscribe(e), t = e;
			}).then(e);
			return r.cancel = function() {
				n.unsubscribe(t);
			}, r;
		}, e(function(e, r, i) {
			n.reason || (n.reason = new q(e, r, i), t(n.reason));
		});
	}
	throwIfRequested() {
		if (this.reason) throw this.reason;
	}
	subscribe(e) {
		if (this.reason) {
			e(this.reason);
			return;
		}
		this._listeners ? this._listeners.push(e) : this._listeners = [e];
	}
	unsubscribe(e) {
		if (!this._listeners) return;
		let t = this._listeners.indexOf(e);
		t !== -1 && this._listeners.splice(t, 1);
	}
	toAbortSignal() {
		let e = new AbortController(), t = (t) => {
			e.abort(t);
		};
		return this.subscribe(t), e.signal.unsubscribe = () => this.unsubscribe(t), e.signal;
	}
	static source() {
		let t;
		return {
			token: new e(function(e) {
				t = e;
			}),
			cancel: t
		};
	}
};
//#endregion
//#region node_modules/axios/lib/helpers/spread.js
function vn(e) {
	return function(t) {
		return e.apply(null, t);
	};
}
//#endregion
//#region node_modules/axios/lib/helpers/isAxiosError.js
function yn(e) {
	return B.isObject(e) && e.isAxiosError === !0;
}
//#endregion
//#region node_modules/axios/lib/helpers/HttpStatusCode.js
var bn = {
	Continue: 100,
	SwitchingProtocols: 101,
	Processing: 102,
	EarlyHints: 103,
	Ok: 200,
	Created: 201,
	Accepted: 202,
	NonAuthoritativeInformation: 203,
	NoContent: 204,
	ResetContent: 205,
	PartialContent: 206,
	MultiStatus: 207,
	AlreadyReported: 208,
	ImUsed: 226,
	MultipleChoices: 300,
	MovedPermanently: 301,
	Found: 302,
	SeeOther: 303,
	NotModified: 304,
	UseProxy: 305,
	Unused: 306,
	TemporaryRedirect: 307,
	PermanentRedirect: 308,
	BadRequest: 400,
	Unauthorized: 401,
	PaymentRequired: 402,
	Forbidden: 403,
	NotFound: 404,
	MethodNotAllowed: 405,
	NotAcceptable: 406,
	ProxyAuthenticationRequired: 407,
	RequestTimeout: 408,
	Conflict: 409,
	Gone: 410,
	LengthRequired: 411,
	PreconditionFailed: 412,
	PayloadTooLarge: 413,
	UriTooLong: 414,
	UnsupportedMediaType: 415,
	RangeNotSatisfiable: 416,
	ExpectationFailed: 417,
	ImATeapot: 418,
	MisdirectedRequest: 421,
	UnprocessableEntity: 422,
	Locked: 423,
	FailedDependency: 424,
	TooEarly: 425,
	UpgradeRequired: 426,
	PreconditionRequired: 428,
	TooManyRequests: 429,
	RequestHeaderFieldsTooLarge: 431,
	UnavailableForLegalReasons: 451,
	InternalServerError: 500,
	NotImplemented: 501,
	BadGateway: 502,
	ServiceUnavailable: 503,
	GatewayTimeout: 504,
	HttpVersionNotSupported: 505,
	VariantAlsoNegotiates: 506,
	InsufficientStorage: 507,
	LoopDetected: 508,
	NotExtended: 510,
	NetworkAuthenticationRequired: 511,
	WebServerIsDown: 521,
	ConnectionTimedOut: 522,
	OriginIsUnreachable: 523,
	TimeoutOccurred: 524,
	SslHandshakeFailed: 525,
	InvalidSslCertificate: 526
};
Object.entries(bn).forEach(([e, t]) => {
	bn[t] = e;
});
//#endregion
//#region node_modules/axios/lib/axios.js
function xn(e) {
	let t = new X(e), n = C(X.prototype.request, t);
	return B.extend(n, X.prototype, t, { allOwnKeys: !0 }), B.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(t) {
		return xn(J(e, t));
	}, n;
}
var Z = xn(W);
Z.Axios = X, Z.CanceledError = q, Z.CancelToken = _n, Z.isCancel = Ot, Z.VERSION = fn, Z.toFormData = H, Z.AxiosError = V, Z.Cancel = Z.CanceledError, Z.all = function(e) {
	return Promise.all(e);
}, Z.spread = vn, Z.isAxiosError = yn, Z.mergeConfig = J, Z.AxiosHeaders = K, Z.formToJSON = (e) => gt(B.isHTMLForm(e) ? new FormData(e) : e), Z.getAdapter = ln.getAdapter, Z.HttpStatusCode = bn, Z.default = Z;
//#endregion
//#region src/api.ts
var Q = Z.create({
	baseURL: "/api/v1/p/movie-request",
	headers: { "Content-Type": "application/json" }
});
function Sn() {
	try {
		let e = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
		if (e) return e;
	} catch {}
	try {
		let e = localStorage.getItem("access_token");
		if (e) return e;
	} catch {}
	return null;
}
Q.interceptors.request.use((e) => {
	let t = Sn();
	return t && (e.headers.Authorization = `Bearer ${t}`), e;
});
//#endregion
//#region node_modules/react/cjs/react-jsx-runtime.production.js
var Cn = /* @__PURE__ */ b(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), wn = /* @__PURE__ */ b(((e) => {
	process.env.NODE_ENV !== "production" && (function() {
		function t(e) {
			if (e == null) return null;
			if (typeof e == "function") return e.$$typeof === k ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case _: return "Fragment";
				case y: return "Profiler";
				case v: return "StrictMode";
				case w: return "Suspense";
				case T: return "SuspenseList";
				case O: return "Activity";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case g: return "Portal";
				case x: return e.displayName || "Context";
				case b: return (e._context.displayName || "Context") + ".Consumer";
				case C:
					var n = e.render;
					return e = e.displayName, e ||= (e = n.displayName || n.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case E: return n = e.displayName || null, n === null ? t(e.type) || "Memo" : n;
				case D:
					n = e._payload, e = e._init;
					try {
						return t(e(n));
					} catch {}
			}
			return null;
		}
		function n(e) {
			return "" + e;
		}
		function r(e) {
			try {
				n(e);
				var t = !1;
			} catch {
				t = !0;
			}
			if (t) {
				t = console;
				var r = t.error, i = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
				return r.call(t, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", i), n(e);
			}
		}
		function i(e) {
			if (e === _) return "<>";
			if (typeof e == "object" && e && e.$$typeof === D) return "<...>";
			try {
				var n = t(e);
				return n ? "<" + n + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function a() {
			var e = A.A;
			return e === null ? null : e.getOwner();
		}
		function o() {
			return Error("react-stack-top-frame");
		}
		function s(e) {
			if (j.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function c(e, t) {
			function n() {
				P || (P = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function l() {
			var e = t(this.type);
			return ee[e] || (ee[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function u(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: h,
				type: e,
				key: t,
				props: n,
				_owner: r
			}, (o === void 0 ? null : o) === null ? Object.defineProperty(e, "ref", {
				enumerable: !1,
				value: null
			}) : Object.defineProperty(e, "ref", {
				enumerable: !1,
				get: l
			}), e._store = {}, Object.defineProperty(e._store, "validated", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: 0
			}), Object.defineProperty(e, "_debugInfo", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: null
			}), Object.defineProperty(e, "_debugStack", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: i
			}), Object.defineProperty(e, "_debugTask", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: a
			}), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
		}
		function d(e, n, i, o, l, d) {
			var p = n.children;
			if (p !== void 0) if (o) if (M(p)) {
				for (o = 0; o < p.length; o++) f(p[o]);
				Object.freeze && Object.freeze(p);
			} else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
			else f(p);
			if (j.call(n, "key")) {
				p = t(e);
				var m = Object.keys(n).filter(function(e) {
					return e !== "key";
				});
				o = 0 < m.length ? "{key: someKey, " + m.join(": ..., ") + ": ...}" : "{key: someKey}", I[p + o] || (m = 0 < m.length ? "{" + m.join(": ..., ") + ": ...}" : "{}", console.error("A props object containing a \"key\" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />", o, p, m, p), I[p + o] = !0);
			}
			if (p = null, i !== void 0 && (r(i), p = "" + i), s(n) && (r(n.key), p = "" + n.key), "key" in n) for (var h in i = {}, n) h !== "key" && (i[h] = n[h]);
			else i = n;
			return p && c(i, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), u(e, p, i, a(), l, d);
		}
		function f(e) {
			p(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === D && (e._payload.status === "fulfilled" ? p(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function p(e) {
			return typeof e == "object" && !!e && e.$$typeof === h;
		}
		var m = S("react"), h = Symbol.for("react.transitional.element"), g = Symbol.for("react.portal"), _ = Symbol.for("react.fragment"), v = Symbol.for("react.strict_mode"), y = Symbol.for("react.profiler"), b = Symbol.for("react.consumer"), x = Symbol.for("react.context"), C = Symbol.for("react.forward_ref"), w = Symbol.for("react.suspense"), T = Symbol.for("react.suspense_list"), E = Symbol.for("react.memo"), D = Symbol.for("react.lazy"), O = Symbol.for("react.activity"), k = Symbol.for("react.client.reference"), A = m.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, j = Object.prototype.hasOwnProperty, M = Array.isArray, N = console.createTask ? console.createTask : function() {
			return null;
		};
		m = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var P, ee = {}, te = m.react_stack_bottom_frame.bind(m, o)(), F = N(i(o)), I = {};
		e.Fragment = _, e.jsx = function(e, t, n) {
			var r = 1e4 > A.recentlyCreatedOwnerStacks++;
			return d(e, t, n, !1, r ? Error("react-stack-top-frame") : te, r ? N(i(e)) : F);
		}, e.jsxs = function(e, t, n) {
			var r = 1e4 > A.recentlyCreatedOwnerStacks++;
			return d(e, t, n, !0, r ? Error("react-stack-top-frame") : te, r ? N(i(e)) : F);
		};
	})();
})), $ = (/* @__PURE__ */ b(((e, t) => {
	process.env.NODE_ENV === "production" ? t.exports = Cn() : t.exports = wn();
})))();
async function Tn() {
	let { data: e } = await Q.get("/stats");
	return e.data;
}
async function En(e) {
	let { data: t } = await Q.get("", { params: e });
	return t.data;
}
async function Dn(e, t) {
	let { data: n } = await Q.patch(`/${e}`, t);
	return n.data;
}
function On({ title: e }) {
	return /* @__PURE__ */ (0, $.jsx)("div", {
		className: "flex items-center h-14 px-8 border-b border-[#1A1A1A]",
		children: /* @__PURE__ */ (0, $.jsx)("h1", {
			className: "text-lg font-semibold text-white font-['Space_Grotesk']",
			children: e
		})
	});
}
var kn = [
	"all",
	"pending",
	"fulfilled",
	"rejected"
];
function An({ label: e, value: t, icon: n, iconBg: r }) {
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "bg-[#0A0A0A] border border-[#2f2f2f] rounded-[10px] p-5",
		children: [/* @__PURE__ */ (0, $.jsxs)("div", {
			className: "flex items-center justify-between mb-3",
			children: [/* @__PURE__ */ (0, $.jsx)("span", {
				className: "text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-[0.5px] font-['JetBrains_Mono']",
				children: e
			}), /* @__PURE__ */ (0, $.jsx)("div", {
				className: `p-1.5 rounded-md ${r}`,
				children: n
			})]
		}), /* @__PURE__ */ (0, $.jsx)("p", {
			className: "text-2xl font-bold text-white font-['Space_Grotesk']",
			children: t
		})]
	});
}
function jn({ status: e }) {
	let t = {
		pending: {
			bg: "bg-[#FF8800]/10",
			text: "text-[#FF8800]",
			label: "PENDING"
		},
		fulfilled: {
			bg: "bg-[#059669]/10",
			text: "text-[#059669]",
			label: "FULFILLED"
		},
		rejected: {
			bg: "bg-[#FF4444]/10",
			text: "text-[#FF4444]",
			label: "REJECTED"
		}
	}, n = t[e] || t.pending;
	return /* @__PURE__ */ (0, $.jsx)("span", {
		className: `text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded ${n.bg} ${n.text}`,
		children: n.label
	});
}
function Mn({ type: e }) {
	return /* @__PURE__ */ (0, $.jsx)("span", {
		className: "text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#8B5CF6]/10 text-[#8B5CF6]",
		children: e.toUpperCase()
	});
}
function Nn() {
	let c = r(), [d, f] = e("all"), [m, h] = e(1), [g, y] = e(null), { data: b } = n({
		queryKey: ["movie-request-stats"],
		queryFn: Tn,
		staleTime: 3e4
	}), { data: x, isLoading: S } = n({
		queryKey: [
			"movie-requests",
			d,
			m
		],
		queryFn: () => En({
			page: m,
			page_size: 20,
			status: d === "all" ? void 0 : d
		}),
		staleTime: 15e3
	}), C = t({
		mutationFn: ({ id: e, status: t }) => (y(e), Dn(e, { status: t })),
		onSuccess: () => {
			c.invalidateQueries({ queryKey: ["movie-requests"] }), c.invalidateQueries({ queryKey: ["movie-request-stats"] });
		},
		onError: (e) => {
			console.error("Failed to update request:", e.message);
		},
		onSettled: () => {
			y(null);
		}
	}), w = x?.items || [], T = x?.total || 0, E = x?.total_pages || 0;
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex flex-col h-full",
		children: [/* @__PURE__ */ (0, $.jsx)(On, { title: "Movie Requests" }), /* @__PURE__ */ (0, $.jsxs)("div", {
			className: "flex-1 px-8 py-6 overflow-auto",
			children: [
				/* @__PURE__ */ (0, $.jsxs)("div", {
					className: "grid grid-cols-4 gap-4 mb-8",
					children: [
						/* @__PURE__ */ (0, $.jsx)(An, {
							label: "Total",
							value: b?.total ?? 0,
							icon: /* @__PURE__ */ (0, $.jsx)(i, {
								size: 16,
								className: "text-[#00D9FF]"
							}),
							iconBg: "bg-[#00D9FF]/10"
						}),
						/* @__PURE__ */ (0, $.jsx)(An, {
							label: "Pending",
							value: b?.pending ?? 0,
							icon: /* @__PURE__ */ (0, $.jsx)(s, {
								size: 16,
								className: "text-[#FF8800]"
							}),
							iconBg: "bg-[#FF8800]/10"
						}),
						/* @__PURE__ */ (0, $.jsx)(An, {
							label: "Fulfilled",
							value: b?.fulfilled ?? 0,
							icon: /* @__PURE__ */ (0, $.jsx)(o, {
								size: 16,
								className: "text-[#059669]"
							}),
							iconBg: "bg-[#059669]/10"
						}),
						/* @__PURE__ */ (0, $.jsx)(An, {
							label: "Rejected",
							value: b?.rejected ?? 0,
							icon: /* @__PURE__ */ (0, $.jsx)(v, {
								size: 16,
								className: "text-[#FF4444]"
							}),
							iconBg: "bg-[#FF4444]/10"
						})
					]
				}),
				/* @__PURE__ */ (0, $.jsx)("div", {
					className: "flex items-center gap-6 mb-6 border-b border-[#1A1A1A]",
					children: kn.map((e) => /* @__PURE__ */ (0, $.jsxs)("button", {
						onClick: () => {
							f(e), h(1);
						},
						className: `pb-3 text-sm font-medium transition-colors relative capitalize ${d === e ? "text-[#00D9FF]" : "text-[#6a6a6a] hover:text-white"}`,
						children: [e, d === e && /* @__PURE__ */ (0, $.jsx)("div", { className: "absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D9FF]" })]
					}, e))
				}),
				/* @__PURE__ */ (0, $.jsx)("div", {
					className: "bg-[#0A0A0A] border border-[#2f2f2f] rounded-[10px] overflow-hidden",
					children: /* @__PURE__ */ (0, $.jsxs)("table", {
						className: "w-full",
						children: [/* @__PURE__ */ (0, $.jsx)("thead", { children: /* @__PURE__ */ (0, $.jsxs)("tr", {
							className: "border-b border-[#2f2f2f]",
							children: [
								/* @__PURE__ */ (0, $.jsx)("th", {
									className: "text-left text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-[0.5px] font-['JetBrains_Mono'] px-5 py-3 w-16",
									children: "Poster"
								}),
								/* @__PURE__ */ (0, $.jsx)("th", {
									className: "text-left text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-[0.5px] font-['JetBrains_Mono'] px-5 py-3",
									children: "Title"
								}),
								/* @__PURE__ */ (0, $.jsx)("th", {
									className: "text-left text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-[0.5px] font-['JetBrains_Mono'] px-5 py-3",
									children: "TMDB"
								}),
								/* @__PURE__ */ (0, $.jsx)("th", {
									className: "text-center text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-[0.5px] font-['JetBrains_Mono'] px-5 py-3",
									children: "Rating"
								}),
								/* @__PURE__ */ (0, $.jsx)("th", {
									className: "text-center text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-[0.5px] font-['JetBrains_Mono'] px-5 py-3",
									children: "Requests"
								}),
								/* @__PURE__ */ (0, $.jsx)("th", {
									className: "text-center text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-[0.5px] font-['JetBrains_Mono'] px-5 py-3",
									children: "Library"
								}),
								/* @__PURE__ */ (0, $.jsx)("th", {
									className: "text-center text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-[0.5px] font-['JetBrains_Mono'] px-5 py-3",
									children: "Status"
								}),
								/* @__PURE__ */ (0, $.jsx)("th", {
									className: "text-right text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-[0.5px] font-['JetBrains_Mono'] px-5 py-3",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, $.jsx)("tbody", { children: S ? /* @__PURE__ */ (0, $.jsx)("tr", { children: /* @__PURE__ */ (0, $.jsx)("td", {
							colSpan: 8,
							className: "text-center py-12",
							children: /* @__PURE__ */ (0, $.jsx)(p, { className: "w-6 h-6 text-[#6a6a6a] animate-spin mx-auto" })
						}) }) : w.length === 0 ? /* @__PURE__ */ (0, $.jsx)("tr", { children: /* @__PURE__ */ (0, $.jsx)("td", {
							colSpan: 8,
							className: "text-center py-12 text-[#6a6a6a] text-sm",
							children: "No requests found"
						}) }) : w.map((e) => {
							let t = e.release_date?.slice(0, 4) || "N/A", n = e.media_type === "movie" ? `https://www.themoviedb.org/movie/${e.tmdb_id}` : `https://www.themoviedb.org/tv/${e.tmdb_id}`;
							return /* @__PURE__ */ (0, $.jsxs)("tr", {
								className: "border-b border-[#1A1A1A] hover:bg-[#141414]/50",
								children: [
									/* @__PURE__ */ (0, $.jsx)("td", {
										className: "px-5 py-3",
										children: e.poster_path ? /* @__PURE__ */ (0, $.jsx)("img", {
											src: `https://image.tmdb.org/t/p/w92${e.poster_path}`,
											alt: e.title,
											className: "w-10 h-14 object-cover rounded"
										}) : /* @__PURE__ */ (0, $.jsx)("div", {
											className: "w-10 h-14 bg-[#141414] rounded flex items-center justify-center",
											children: /* @__PURE__ */ (0, $.jsx)(u, {
												size: 16,
												className: "text-[#4a4a4a]"
											})
										})
									}),
									/* @__PURE__ */ (0, $.jsx)("td", {
										className: "px-5 py-3",
										children: /* @__PURE__ */ (0, $.jsxs)("div", {
											className: "flex flex-col gap-1",
											children: [/* @__PURE__ */ (0, $.jsx)("span", {
												className: "text-sm text-white font-medium truncate max-w-[240px]",
												children: e.title
											}), /* @__PURE__ */ (0, $.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, $.jsx)("span", {
													className: "text-xs text-[#6a6a6a]",
													children: t
												}), /* @__PURE__ */ (0, $.jsx)(Mn, { type: e.media_type })]
											})]
										})
									}),
									/* @__PURE__ */ (0, $.jsx)("td", {
										className: "px-5 py-3",
										children: /* @__PURE__ */ (0, $.jsxs)("a", {
											href: n,
											target: "_blank",
											rel: "noopener noreferrer",
											className: "inline-flex items-center gap-1 text-xs text-[#00D9FF] hover:underline font-['JetBrains_Mono']",
											children: [e.tmdb_id, /* @__PURE__ */ (0, $.jsx)(l, { size: 10 })]
										})
									}),
									/* @__PURE__ */ (0, $.jsx)("td", {
										className: "px-5 py-3 text-center",
										children: /* @__PURE__ */ (0, $.jsx)("span", {
											className: "text-sm text-white font-['JetBrains_Mono']",
											children: e.vote_average == null ? "—" : `\u2B50 ${Number(e.vote_average).toFixed(1)}`
										})
									}),
									/* @__PURE__ */ (0, $.jsx)("td", {
										className: "px-5 py-3 text-center",
										children: /* @__PURE__ */ (0, $.jsx)("span", {
											className: "text-sm text-white font-['JetBrains_Mono']",
											children: e.request_count
										})
									}),
									/* @__PURE__ */ (0, $.jsx)("td", {
										className: "px-5 py-3 text-center",
										children: e.in_library ? /* @__PURE__ */ (0, $.jsx)("span", {
											className: "text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#059669]/10 text-[#059669]",
											children: "YES"
										}) : /* @__PURE__ */ (0, $.jsx)("span", {
											className: "text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#141414] text-[#6a6a6a]",
											children: "NO"
										})
									}),
									/* @__PURE__ */ (0, $.jsx)("td", {
										className: "px-5 py-3 text-center",
										children: /* @__PURE__ */ (0, $.jsx)(jn, { status: e.status })
									}),
									/* @__PURE__ */ (0, $.jsx)("td", {
										className: "px-5 py-3 text-right",
										children: e.status === "pending" && /* @__PURE__ */ (0, $.jsx)("div", {
											className: "flex items-center gap-2 justify-end",
											children: g === e.id ? /* @__PURE__ */ (0, $.jsx)(p, {
												size: 16,
												className: "text-[#6a6a6a] animate-spin"
											}) : /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)("button", {
												onClick: () => C.mutate({
													id: e.id,
													status: "fulfilled"
												}),
												disabled: g !== null,
												className: "p-1.5 rounded-md hover:bg-[#059669]/10 text-[#6a6a6a] hover:text-[#059669] transition-colors disabled:opacity-30",
												title: "Fulfill",
												children: /* @__PURE__ */ (0, $.jsx)(a, { size: 16 })
											}), /* @__PURE__ */ (0, $.jsx)("button", {
												onClick: () => C.mutate({
													id: e.id,
													status: "rejected"
												}),
												disabled: g !== null,
												className: "p-1.5 rounded-md hover:bg-[#FF4444]/10 text-[#6a6a6a] hover:text-[#FF4444] transition-colors disabled:opacity-30",
												title: "Reject",
												children: /* @__PURE__ */ (0, $.jsx)(_, { size: 16 })
											})] })
										})
									})
								]
							}, e.id);
						}) })]
					})
				}),
				E > 1 && /* @__PURE__ */ (0, $.jsxs)("div", {
					className: "flex items-center justify-between mt-4",
					children: [/* @__PURE__ */ (0, $.jsxs)("span", {
						className: "text-xs text-[#6a6a6a]",
						children: [T, " total results"]
					}), /* @__PURE__ */ (0, $.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, $.jsx)("button", {
								onClick: () => h((e) => Math.max(1, e - 1)),
								disabled: m <= 1,
								className: "px-3 py-1.5 rounded-md text-xs font-medium text-[#8a8a8a] border border-[#2f2f2f] hover:bg-[#141414] transition-colors disabled:opacity-30",
								children: "Previous"
							}),
							/* @__PURE__ */ (0, $.jsxs)("span", {
								className: "text-xs text-[#8a8a8a] font-['JetBrains_Mono']",
								children: [
									m,
									" / ",
									E
								]
							}),
							/* @__PURE__ */ (0, $.jsx)("button", {
								onClick: () => h((e) => Math.min(E, e + 1)),
								disabled: m >= E,
								className: "px-3 py-1.5 rounded-md text-xs font-medium text-[#8a8a8a] border border-[#2f2f2f] hover:bg-[#141414] transition-colors disabled:opacity-30",
								children: "Next"
							})
						]
					})]
				})
			]
		})]
	});
}
//#endregion
//#region src/settings/TmdbTab.tsx
async function Pn() {
	let { data: e } = await Q.get("/tmdb-keys");
	return e.data;
}
async function Fn(e) {
	let { data: t } = await Q.post("/tmdb-keys", e);
	return t.data;
}
async function In(e) {
	await Q.delete(`/tmdb-keys/${e}`);
}
async function Ln() {
	let { data: e } = await Q.get("/media-library");
	return e.data;
}
async function Rn(e) {
	let { data: t } = await Q.post("/media-library", e);
	return t.data;
}
async function zn() {
	await Q.delete("/media-library");
}
async function Bn() {
	let { data: e } = await Q.post("/media-library/test");
	return e.data;
}
function Vn() {
	let i = r(), [a, o] = e(!1), [s, l] = e({
		name: "",
		db_type: "postgresql",
		host: "",
		port: "",
		database: "",
		username: "",
		password: "",
		table_name: "",
		tmdb_id_column: "tmdb_id",
		media_type_column: ""
	}), { data: u, isLoading: f } = n({
		queryKey: ["media-library-config"],
		queryFn: Ln
	}), m = t({
		mutationFn: () => Rn({
			...s,
			port: s.port ? Number(s.port) : void 0,
			media_type_column: s.media_type_column || void 0
		}),
		onSuccess: () => {
			i.invalidateQueries({ queryKey: ["media-library-config"] }), o(!1);
		}
	}), _ = t({
		mutationFn: zn,
		onSuccess: () => i.invalidateQueries({ queryKey: ["media-library-config"] })
	}), v = t({ mutationFn: Bn }), y = (e, t) => l((n) => ({
		...n,
		[e]: t
	}));
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "space-y-4 mt-8",
		children: [
			/* @__PURE__ */ (0, $.jsx)("div", {
				className: "flex items-center justify-between",
				children: /* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("h3", {
					className: "text-[18px] font-semibold text-white font-['Space_Grotesk']",
					children: "Media Library Database"
				}), /* @__PURE__ */ (0, $.jsx)("p", {
					className: "text-xs text-[#6a6a6a] mt-1",
					children: "Optional: connect to an external database to check if a title is already in your media library. If not configured, all requests are forwarded to the admin panel."
				})] })
			}),
			f ? /* @__PURE__ */ (0, $.jsx)("div", {
				className: "flex items-center justify-center py-8",
				children: /* @__PURE__ */ (0, $.jsx)(p, { className: "w-5 h-5 text-[#6a6a6a] animate-spin" })
			}) : u ? /* @__PURE__ */ (0, $.jsxs)("div", {
				className: "bg-[#0A0A0A] border border-[#2f2f2f] rounded-[10px] p-5 space-y-3",
				children: [
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "flex items-start justify-between",
						children: [/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("h4", {
							className: "text-sm font-medium text-white",
							children: u.name
						}), /* @__PURE__ */ (0, $.jsxs)("p", {
							className: "text-xs text-[#6a6a6a] font-['JetBrains_Mono'] mt-1",
							children: [
								u.db_type.toUpperCase(),
								" @ ",
								u.host,
								":",
								u.port || (u.db_type === "postgresql" ? 5432 : 3306),
								" / ",
								u.database
							]
						})] }), /* @__PURE__ */ (0, $.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, $.jsxs)("button", {
								onClick: () => v.mutate(),
								disabled: v.isPending,
								className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[#00D9FF] border border-[#00D9FF]/20 hover:bg-[#00D9FF]/10 transition-colors disabled:opacity-40",
								children: [v.isPending ? /* @__PURE__ */ (0, $.jsx)(p, {
									size: 12,
									className: "animate-spin"
								}) : /* @__PURE__ */ (0, $.jsx)(d, { size: 12 }), "Test"]
							}), /* @__PURE__ */ (0, $.jsx)("button", {
								onClick: () => _.mutate(),
								disabled: _.isPending,
								className: "p-1.5 rounded-md hover:bg-[#FF4444]/10 text-[#6a6a6a] hover:text-[#FF4444] transition-colors",
								title: "Remove config",
								children: /* @__PURE__ */ (0, $.jsx)(g, { size: 14 })
							})]
						})]
					}),
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "grid grid-cols-3 gap-3 text-xs",
						children: [
							/* @__PURE__ */ (0, $.jsxs)("div", { children: [
								/* @__PURE__ */ (0, $.jsx)("span", {
									className: "text-[#6a6a6a]",
									children: "Table:"
								}),
								" ",
								/* @__PURE__ */ (0, $.jsx)("span", {
									className: "text-white font-['JetBrains_Mono']",
									children: u.table_name
								})
							] }),
							/* @__PURE__ */ (0, $.jsxs)("div", { children: [
								/* @__PURE__ */ (0, $.jsx)("span", {
									className: "text-[#6a6a6a]",
									children: "TMDB ID Column:"
								}),
								" ",
								/* @__PURE__ */ (0, $.jsx)("span", {
									className: "text-white font-['JetBrains_Mono']",
									children: u.tmdb_id_column
								})
							] }),
							/* @__PURE__ */ (0, $.jsxs)("div", { children: [
								/* @__PURE__ */ (0, $.jsx)("span", {
									className: "text-[#6a6a6a]",
									children: "Type Column:"
								}),
								" ",
								/* @__PURE__ */ (0, $.jsx)("span", {
									className: "text-white font-['JetBrains_Mono']",
									children: u.media_type_column || "—"
								})
							] })
						]
					}),
					u.is_active && /* @__PURE__ */ (0, $.jsx)("span", {
						className: "text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#059669]/10 text-[#059669]",
						children: "ACTIVE"
					}),
					v.data && /* @__PURE__ */ (0, $.jsx)("p", {
						className: `text-xs font-['JetBrains_Mono'] ${v.data.success ? "text-[#059669]" : "text-[#FF4444]"}`,
						children: v.data.message
					})
				]
			}) : a ? null : /* @__PURE__ */ (0, $.jsxs)("button", {
				onClick: () => o(!0),
				className: "w-full py-6 bg-[#0A0A0A] border border-dashed border-[#2f2f2f] rounded-[10px] text-sm text-[#6a6a6a] hover:text-white hover:border-[#00D9FF]/30 transition-colors",
				children: [/* @__PURE__ */ (0, $.jsx)(c, {
					size: 20,
					className: "mx-auto mb-2 opacity-50"
				}), "Configure External Media Library"]
			}),
			a && !u && /* @__PURE__ */ (0, $.jsxs)("div", {
				className: "bg-[#0A0A0A] border border-[#2f2f2f] rounded-[10px] p-5 space-y-4",
				children: [
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "grid grid-cols-3 gap-4",
						children: [
							/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("label", {
								className: "block text-xs text-[#6a6a6a] mb-1.5",
								children: "Name"
							}), /* @__PURE__ */ (0, $.jsx)("input", {
								type: "text",
								value: s.name,
								onChange: (e) => y("name", e.target.value),
								placeholder: "My Media Server",
								className: "w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] focus:outline-none focus:border-[#00D9FF] transition-colors"
							})] }),
							/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("label", {
								className: "block text-xs text-[#6a6a6a] mb-1.5",
								children: "Database Type"
							}), /* @__PURE__ */ (0, $.jsxs)("select", {
								value: s.db_type,
								onChange: (e) => y("db_type", e.target.value),
								className: "w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors",
								children: [/* @__PURE__ */ (0, $.jsx)("option", {
									value: "postgresql",
									children: "PostgreSQL"
								}), /* @__PURE__ */ (0, $.jsx)("option", {
									value: "mysql",
									children: "MySQL"
								})]
							})] }),
							/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("label", {
								className: "block text-xs text-[#6a6a6a] mb-1.5",
								children: "Host"
							}), /* @__PURE__ */ (0, $.jsx)("input", {
								type: "text",
								value: s.host,
								onChange: (e) => y("host", e.target.value),
								placeholder: "192.168.1.100",
								className: "w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors"
							})] })
						]
					}),
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "grid grid-cols-4 gap-4",
						children: [
							/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("label", {
								className: "block text-xs text-[#6a6a6a] mb-1.5",
								children: "Port"
							}), /* @__PURE__ */ (0, $.jsx)("input", {
								type: "text",
								value: s.port,
								onChange: (e) => y("port", e.target.value),
								placeholder: s.db_type === "postgresql" ? "5432" : "3306",
								className: "w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors"
							})] }),
							/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("label", {
								className: "block text-xs text-[#6a6a6a] mb-1.5",
								children: "Database"
							}), /* @__PURE__ */ (0, $.jsx)("input", {
								type: "text",
								value: s.database,
								onChange: (e) => y("database", e.target.value),
								placeholder: "media_db",
								className: "w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors"
							})] }),
							/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("label", {
								className: "block text-xs text-[#6a6a6a] mb-1.5",
								children: "Username"
							}), /* @__PURE__ */ (0, $.jsx)("input", {
								type: "text",
								value: s.username,
								onChange: (e) => y("username", e.target.value),
								placeholder: "db_user",
								className: "w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors"
							})] }),
							/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("label", {
								className: "block text-xs text-[#6a6a6a] mb-1.5",
								children: "Password"
							}), /* @__PURE__ */ (0, $.jsx)("input", {
								type: "password",
								value: s.password,
								onChange: (e) => y("password", e.target.value),
								placeholder: "********",
								className: "w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors"
							})] })
						]
					}),
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "grid grid-cols-3 gap-4",
						children: [
							/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("label", {
								className: "block text-xs text-[#6a6a6a] mb-1.5",
								children: "Table Name"
							}), /* @__PURE__ */ (0, $.jsx)("input", {
								type: "text",
								value: s.table_name,
								onChange: (e) => y("table_name", e.target.value),
								placeholder: "movies",
								className: "w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors"
							})] }),
							/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("label", {
								className: "block text-xs text-[#6a6a6a] mb-1.5",
								children: "TMDB ID Column"
							}), /* @__PURE__ */ (0, $.jsx)("input", {
								type: "text",
								value: s.tmdb_id_column,
								onChange: (e) => y("tmdb_id_column", e.target.value),
								placeholder: "tmdb_id",
								className: "w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors"
							})] }),
							/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("label", {
								className: "block text-xs text-[#6a6a6a] mb-1.5",
								children: "Media Type Column (optional)"
							}), /* @__PURE__ */ (0, $.jsx)("input", {
								type: "text",
								value: s.media_type_column,
								onChange: (e) => y("media_type_column", e.target.value),
								placeholder: "media_type",
								className: "w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors"
							})] })
						]
					}),
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, $.jsx)("button", {
							onClick: () => o(!1),
							className: "px-3 py-1.5 rounded-md text-xs font-medium text-[#8a8a8a] border border-[#2f2f2f] hover:bg-[#141414] transition-colors",
							children: "Cancel"
						}), /* @__PURE__ */ (0, $.jsxs)("button", {
							onClick: () => m.mutate(),
							disabled: !s.name || !s.host || !s.database || !s.username || !s.password || !s.table_name || !s.tmdb_id_column || m.isPending,
							className: "inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#00D9FF] text-black text-xs font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-30",
							children: [m.isPending ? /* @__PURE__ */ (0, $.jsx)(p, {
								size: 12,
								className: "animate-spin"
							}) : /* @__PURE__ */ (0, $.jsx)(h, { size: 12 }), "Save"]
						})]
					})
				]
			})
		]
	});
}
function Hn() {
	let i = r(), [a, o] = e(!1), [s, c] = e(""), [l, u] = e(""), [d, h] = e(""), { data: _, isLoading: v } = n({
		queryKey: ["tmdb-keys"],
		queryFn: Pn
	}), y = t({
		mutationFn: () => Fn({
			name: s,
			api_key: l,
			access_token: d || void 0
		}),
		onSuccess: () => {
			i.invalidateQueries({ queryKey: ["tmdb-keys"] }), o(!1), c(""), u(""), h("");
		}
	}), b = t({
		mutationFn: (e) => In(e),
		onSuccess: () => i.invalidateQueries({ queryKey: ["tmdb-keys"] })
	}), x = _?.items || [];
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, $.jsx)("h3", {
					className: "text-[18px] font-semibold text-white font-['Space_Grotesk']",
					children: "TMDB API Keys"
				}), /* @__PURE__ */ (0, $.jsxs)("button", {
					onClick: () => o(!a),
					className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#00D9FF]/10 text-[#00D9FF] hover:bg-[#00D9FF]/20 transition-colors",
					children: [/* @__PURE__ */ (0, $.jsx)(m, { size: 14 }), "Add Key"]
				})]
			}),
			a && /* @__PURE__ */ (0, $.jsxs)("div", {
				className: "bg-[#0A0A0A] border border-[#2f2f2f] rounded-[10px] p-5 space-y-4",
				children: [/* @__PURE__ */ (0, $.jsxs)("div", {
					className: "grid grid-cols-3 gap-4",
					children: [
						/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("label", {
							className: "block text-xs text-[#6a6a6a] mb-1.5",
							children: "Name"
						}), /* @__PURE__ */ (0, $.jsx)("input", {
							type: "text",
							value: s,
							onChange: (e) => c(e.target.value),
							placeholder: "My TMDB Key",
							className: "w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] focus:outline-none focus:border-[#00D9FF] transition-colors"
						})] }),
						/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("label", {
							className: "block text-xs text-[#6a6a6a] mb-1.5",
							children: "API Key"
						}), /* @__PURE__ */ (0, $.jsx)("input", {
							type: "text",
							value: l,
							onChange: (e) => u(e.target.value),
							placeholder: "API key",
							className: "w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors"
						})] }),
						/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("label", {
							className: "block text-xs text-[#6a6a6a] mb-1.5",
							children: "Access Token (optional)"
						}), /* @__PURE__ */ (0, $.jsx)("input", {
							type: "text",
							value: d,
							onChange: (e) => h(e.target.value),
							placeholder: "Bearer token",
							className: "w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors"
						})] })
					]
				}), /* @__PURE__ */ (0, $.jsxs)("div", {
					className: "flex justify-end gap-2",
					children: [/* @__PURE__ */ (0, $.jsx)("button", {
						onClick: () => o(!1),
						className: "px-3 py-1.5 rounded-md text-xs font-medium text-[#8a8a8a] border border-[#2f2f2f] hover:bg-[#141414] transition-colors",
						children: "Cancel"
					}), /* @__PURE__ */ (0, $.jsxs)("button", {
						onClick: () => y.mutate(),
						disabled: !s || !l || y.isPending,
						className: "inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#00D9FF] text-black text-xs font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-30",
						children: [y.isPending ? /* @__PURE__ */ (0, $.jsx)(p, {
							size: 12,
							className: "animate-spin"
						}) : /* @__PURE__ */ (0, $.jsx)(m, { size: 12 }), "Add"]
					})]
				})]
			}),
			v ? /* @__PURE__ */ (0, $.jsx)("div", {
				className: "flex items-center justify-center py-12",
				children: /* @__PURE__ */ (0, $.jsx)(p, { className: "w-6 h-6 text-[#6a6a6a] animate-spin" })
			}) : x.length === 0 ? /* @__PURE__ */ (0, $.jsxs)("div", {
				className: "bg-[#0A0A0A] border border-[#2f2f2f] rounded-[10px] p-8 text-center",
				children: [/* @__PURE__ */ (0, $.jsx)(f, {
					size: 24,
					className: "text-[#4a4a4a] mx-auto mb-2"
				}), /* @__PURE__ */ (0, $.jsx)("p", {
					className: "text-sm text-[#6a6a6a]",
					children: "No TMDB API keys configured"
				})]
			}) : /* @__PURE__ */ (0, $.jsx)("div", {
				className: "grid grid-cols-2 gap-4",
				children: x.map((e) => /* @__PURE__ */ (0, $.jsxs)("div", {
					className: "bg-[#0A0A0A] border border-[#2f2f2f] rounded-[10px] p-5",
					children: [/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "flex items-start justify-between mb-3",
						children: [/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("h4", {
							className: "text-sm font-medium text-white",
							children: e.name
						}), /* @__PURE__ */ (0, $.jsx)("p", {
							className: "text-xs text-[#6a6a6a] font-['JetBrains_Mono'] mt-1",
							children: e.api_key_masked
						})] }), /* @__PURE__ */ (0, $.jsx)("button", {
							onClick: () => b.mutate(e.id),
							disabled: b.isPending,
							className: "p-1.5 rounded-md hover:bg-[#FF4444]/10 text-[#6a6a6a] hover:text-[#FF4444] transition-colors",
							title: "Delete key",
							children: /* @__PURE__ */ (0, $.jsx)(g, { size: 14 })
						})]
					}), /* @__PURE__ */ (0, $.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [e.is_active ? e.is_rate_limited ? /* @__PURE__ */ (0, $.jsx)("span", {
							className: "text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#FF8800]/10 text-[#FF8800]",
							children: "RATE LIMITED"
						}) : /* @__PURE__ */ (0, $.jsx)("span", {
							className: "text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#059669]/10 text-[#059669]",
							children: "ACTIVE"
						}) : /* @__PURE__ */ (0, $.jsx)("span", {
							className: "text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#141414] text-[#6a6a6a]",
							children: "INACTIVE"
						}), /* @__PURE__ */ (0, $.jsxs)("span", {
							className: "text-[10px] text-[#6a6a6a] font-['JetBrains_Mono']",
							children: [e.request_count, " requests"]
						})]
					})]
				}, e.id))
			}),
			/* @__PURE__ */ (0, $.jsx)(Vn, {})
		]
	});
}
//#endregion
//#region src/index.ts
var Un = {
	"./pages/Main": async () => ({ default: Nn }),
	"./settings/TmdbTab": async () => ({ default: Hn })
};
window["__acp_plugin_movie-request"] = { get(e) {
	let t = Un[e];
	if (!t) throw Error(`Module ${e} not found in plugin movie-request`);
	return t();
} };
//#endregion
export { Nn as MovieRequests, Hn as TmdbTab };
