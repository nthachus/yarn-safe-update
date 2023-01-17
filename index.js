module.exports = function(modules) {
  var installedModules = {};
  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) return installedModules[moduleId].exports;
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: !1,
      exports: {}
    };
    return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), 
    module.l = !0, module.exports;
  }
  return __webpack_require__.m = modules, __webpack_require__.c = installedModules, 
  __webpack_require__.d = function(exports, name, getter) {
    __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
      enumerable: !0,
      get: getter
    });
  }, __webpack_require__.r = function(exports) {
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(exports, Symbol.toStringTag, {
      value: "Module"
    }), Object.defineProperty(exports, "__esModule", {
      value: !0
    });
  }, __webpack_require__.t = function(value, mode) {
    if (1 & mode && (value = __webpack_require__(value)), 8 & mode) return value;
    if (4 & mode && "object" == typeof value && value && value.__esModule) return value;
    var ns = Object.create(null);
    if (__webpack_require__.r(ns), Object.defineProperty(ns, "default", {
      enumerable: !0,
      value: value
    }), 2 & mode && "string" != typeof value) for (var key in value) __webpack_require__.d(ns, key, function(key) {
      return value[key];
    }.bind(null, key));
    return ns;
  }, __webpack_require__.n = function(module) {
    var getter = module && module.__esModule ? function() {
      return module.default;
    } : function() {
      return module;
    };
    return __webpack_require__.d(getter, "a", getter), getter;
  }, __webpack_require__.o = function(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  }, __webpack_require__.p = "", __webpack_require__(__webpack_require__.s = 34);
}([ function(module, exports, __webpack_require__) {
  const internalRe = __webpack_require__(5);
  module.exports = {
    re: internalRe.re,
    src: internalRe.src,
    tokens: internalRe.t,
    SEMVER_SPEC_VERSION: __webpack_require__(6).SEMVER_SPEC_VERSION,
    SemVer: __webpack_require__(3),
    clean: __webpack_require__(22),
    rsort: __webpack_require__(24),
    lte: __webpack_require__(10),
    Comparator: __webpack_require__(11),
    Range: __webpack_require__(8),
    satisfies: __webpack_require__(32),
    validRange: __webpack_require__(33)
  };
}, function(module, exports) {
  module.exports = require("fs");
}, function(module, exports, __webpack_require__) {
  "use strict";
  var NODE_ENV = process.env.NODE_ENV;
  module.exports = function(condition, format, a, b, c, d, e, f) {
    if ("production" !== NODE_ENV && void 0 === format) throw new Error("invariant requires an error message argument");
    if (!condition) {
      var error;
      if (void 0 === format) error = new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings."); else {
        var args = [ a, b, c, d, e, f ], argIndex = 0;
        (error = new Error(format.replace(/%s/g, (function() {
          return args[argIndex++];
        })))).name = "Invariant Violation";
      }
      throw error.framesToPop = 1, error;
    }
  };
}, function(module, exports, __webpack_require__) {
  const debug = __webpack_require__(7), _require = __webpack_require__(6), MAX_LENGTH = _require.MAX_LENGTH, MAX_SAFE_INTEGER = _require.MAX_SAFE_INTEGER, _require2 = __webpack_require__(5), re = _require2.re, t = _require2.t, compareIdentifiers = __webpack_require__(21).compareIdentifiers;
  class SemVer {
    constructor(version, options) {
      if (options && "object" == typeof options || (options = {
        loose: !!options,
        includePrerelease: !1
      }), version instanceof SemVer) {
        if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) return version;
        version = version.version;
      } else if ("string" != typeof version) throw new TypeError("Invalid Version: " + version);
      if (version.length > MAX_LENGTH) throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
      debug("SemVer", version, options), this.options = options, this.loose = !!options.loose, 
      this.includePrerelease = !!options.includePrerelease;
      const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
      if (!m) throw new TypeError("Invalid Version: " + version);
      if (this.raw = version, this.major = +m[1], this.minor = +m[2], this.patch = +m[3], 
      this.major > MAX_SAFE_INTEGER || this.major < 0) throw new TypeError("Invalid major version");
      if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) throw new TypeError("Invalid minor version");
      if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) throw new TypeError("Invalid patch version");
      m[4] ? this.prerelease = m[4].split(".").map(id => {
        if (/^[0-9]+$/.test(id)) {
          const num = +id;
          if (num >= 0 && num < MAX_SAFE_INTEGER) return num;
        }
        return id;
      }) : this.prerelease = [], this.build = m[5] ? m[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += "-" + this.prerelease.join(".")), 
      this.version;
    }
    toString() {
      return this.version;
    }
    compare(other) {
      if (debug("SemVer.compare", this.version, this.options, other), !(other instanceof SemVer)) {
        if ("string" == typeof other && other === this.version) return 0;
        other = new SemVer(other, this.options);
      }
      return other.version === this.version ? 0 : this.compareMain(other) || this.comparePre(other);
    }
    compareMain(other) {
      return other instanceof SemVer || (other = new SemVer(other, this.options)), compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
    }
    comparePre(other) {
      if (other instanceof SemVer || (other = new SemVer(other, this.options)), this.prerelease.length && !other.prerelease.length) return -1;
      if (!this.prerelease.length && other.prerelease.length) return 1;
      if (!this.prerelease.length && !other.prerelease.length) return 0;
      let i = 0;
      do {
        const a = this.prerelease[i], b = other.prerelease[i];
        if (debug("prerelease compare", i, a, b), void 0 === a && void 0 === b) return 0;
        if (void 0 === b) return 1;
        if (void 0 === a) return -1;
        if (a !== b) return compareIdentifiers(a, b);
      } while (++i);
    }
    compareBuild(other) {
      other instanceof SemVer || (other = new SemVer(other, this.options));
      let i = 0;
      do {
        const a = this.build[i], b = other.build[i];
        if (debug("prerelease compare", i, a, b), void 0 === a && void 0 === b) return 0;
        if (void 0 === b) return 1;
        if (void 0 === a) return -1;
        if (a !== b) return compareIdentifiers(a, b);
      } while (++i);
    }
    inc(release, identifier) {
      switch (release) {
       case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", identifier);
        break;

       case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", identifier);
        break;

       case "prepatch":
        this.prerelease.length = 0, this.inc("patch", identifier), this.inc("pre", identifier);
        break;

       case "prerelease":
        0 === this.prerelease.length && this.inc("patch", identifier), this.inc("pre", identifier);
        break;

       case "major":
        0 === this.minor && 0 === this.patch && 0 !== this.prerelease.length || this.major++, 
        this.minor = 0, this.patch = 0, this.prerelease = [];
        break;

       case "minor":
        0 === this.patch && 0 !== this.prerelease.length || this.minor++, this.patch = 0, 
        this.prerelease = [];
        break;

       case "patch":
        0 === this.prerelease.length && this.patch++, this.prerelease = [];
        break;

       case "pre":
        if (0 === this.prerelease.length) this.prerelease = [ 0 ]; else {
          let i = this.prerelease.length;
          for (;--i >= 0; ) "number" == typeof this.prerelease[i] && (this.prerelease[i]++, 
          i = -2);
          -1 === i && this.prerelease.push(0);
        }
        identifier && (this.prerelease[0] === identifier ? isNaN(this.prerelease[1]) && (this.prerelease = [ identifier, 0 ]) : this.prerelease = [ identifier, 0 ]);
        break;

       default:
        throw new Error("invalid increment argument: " + release);
      }
      return this.format(), this.raw = this.version, this;
    }
  }
  module.exports = SemVer;
}, function(module, exports, __webpack_require__) {
  const SemVer = __webpack_require__(3);
  module.exports = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
}, function(module, exports, __webpack_require__) {
  const MAX_SAFE_COMPONENT_LENGTH = __webpack_require__(6).MAX_SAFE_COMPONENT_LENGTH, debug = __webpack_require__(7), re = (exports = module.exports = {}).re = [], src = exports.src = [], t = exports.t = {};
  let R = 0;
  const createToken = (name, value, isGlobal) => {
    const index = R++;
    debug(index, value), t[name] = index, src[index] = value, re[index] = new RegExp(value, isGlobal ? "g" : void 0);
  };
  createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*"), createToken("NUMERICIDENTIFIERLOOSE", "[0-9]+"), 
  createToken("NONNUMERICIDENTIFIER", "\\d*[a-zA-Z-][a-zA-Z0-9-]*"), createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`), 
  createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`), 
  createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`), 
  createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`), 
  createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`), 
  createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`), 
  createToken("BUILDIDENTIFIER", "[0-9A-Za-z-]+"), createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`), 
  createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`), 
  createToken("FULL", `^${src[t.FULLPLAIN]}$`), createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`), 
  createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`), createToken("GTLT", "((?:<|>)?=?)"), 
  createToken("XRANGEIDENTIFIERLOOSE", src[t.NUMERICIDENTIFIERLOOSE] + "|x|X|\\*"), 
  createToken("XRANGEIDENTIFIER", src[t.NUMERICIDENTIFIER] + "|x|X|\\*"), createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`), 
  createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`), 
  createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`), createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`), 
  createToken("COERCE", `(^|[^\\d])(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:$|[^\\d])`), 
  createToken("COERCERTL", src[t.COERCE], !0), createToken("LONETILDE", "(?:~>?)"), 
  createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, !0), exports.tildeTrimReplace = "$1~", 
  createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`), createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`), 
  createToken("LONECARET", "(?:\\^)"), createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, !0), 
  exports.caretTrimReplace = "$1^", createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`), 
  createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`), createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`), 
  createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`), createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, !0), 
  exports.comparatorTrimReplace = "$1$2$3", createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`), 
  createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`), 
  createToken("STAR", "(<|>)?=?\\s*\\*");
}, function(module, exports) {
  const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
  module.exports = {
    SEMVER_SPEC_VERSION: "2.0.0",
    MAX_LENGTH: 256,
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
    MAX_SAFE_COMPONENT_LENGTH: 16
  };
}, function(module, exports) {
  const debug = "object" == typeof process && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {};
  module.exports = debug;
}, function(module, exports, __webpack_require__) {
  class Range {
    constructor(range, options) {
      if (options && "object" == typeof options || (options = {
        loose: !!options,
        includePrerelease: !1
      }), range instanceof Range) return range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease ? range : new Range(range.raw, options);
      if (range instanceof Comparator) return this.raw = range.value, this.set = [ [ range ] ], 
      this.format(), this;
      if (this.options = options, this.loose = !!options.loose, this.includePrerelease = !!options.includePrerelease, 
      this.raw = range, this.set = range.split(/\s*\|\|\s*/).map(range => this.parseRange(range.trim())).filter(c => c.length), 
      !this.set.length) throw new TypeError("Invalid SemVer Range: " + range);
      this.format();
    }
    format() {
      return this.range = this.set.map(comps => comps.join(" ").trim()).join("||").trim(), 
      this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(range) {
      const loose = this.options.loose;
      range = range.trim();
      const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
      range = range.replace(hr, hyphenReplace), debug("hyphen replace", range), range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace), 
      debug("comparator trim", range, re[t.COMPARATORTRIM]), range = (range = (range = range.replace(re[t.TILDETRIM], tildeTrimReplace)).replace(re[t.CARETTRIM], caretTrimReplace)).split(/\s+/).join(" ");
      const compRe = loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
      return range.split(" ").map(comp => parseComparator(comp, this.options)).join(" ").split(/\s+/).filter(this.options.loose ? comp => !!comp.match(compRe) : () => !0).map(comp => new Comparator(comp, this.options));
    }
    intersects(range, options) {
      if (!(range instanceof Range)) throw new TypeError("a Range is required");
      return this.set.some(thisComparators => isSatisfiable(thisComparators, options) && range.set.some(rangeComparators => isSatisfiable(rangeComparators, options) && thisComparators.every(thisComparator => rangeComparators.every(rangeComparator => thisComparator.intersects(rangeComparator, options)))));
    }
    test(version) {
      if (!version) return !1;
      if ("string" == typeof version) try {
        version = new SemVer(version, this.options);
      } catch (er) {
        return !1;
      }
      for (let i = 0; i < this.set.length; i++) if (testSet(this.set[i], version, this.options)) return !0;
      return !1;
    }
  }
  module.exports = Range;
  const Comparator = __webpack_require__(11), debug = __webpack_require__(7), SemVer = __webpack_require__(3), _require = __webpack_require__(5), re = _require.re, t = _require.t, comparatorTrimReplace = _require.comparatorTrimReplace, tildeTrimReplace = _require.tildeTrimReplace, caretTrimReplace = _require.caretTrimReplace, isSatisfiable = (comparators, options) => {
    let result = !0;
    const remainingComparators = comparators.slice();
    let testComparator = remainingComparators.pop();
    for (;result && remainingComparators.length; ) result = remainingComparators.every(otherComparator => testComparator.intersects(otherComparator, options)), 
    testComparator = remainingComparators.pop();
    return result;
  }, parseComparator = (comp, options) => (debug("comp", comp, options), comp = replaceCarets(comp, options), 
  debug("caret", comp), comp = replaceTildes(comp, options), debug("tildes", comp), 
  comp = replaceXRanges(comp, options), debug("xrange", comp), comp = replaceStars(comp, options), 
  debug("stars", comp), comp), isX = id => !id || "x" === id.toLowerCase() || "*" === id, replaceTildes = (comp, options) => comp.trim().split(/\s+/).map(comp => replaceTilde(comp, options)).join(" "), replaceTilde = (comp, options) => {
    const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
    return comp.replace(r, (_, M, m, p, pr) => {
      let ret;
      return debug("tilde", comp, _, M, m, p, pr), isX(M) ? ret = "" : isX(m) ? ret = `>=${M}.0.0 <${+M + 1}.0.0` : isX(p) ? ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0` : pr ? (debug("replaceTilde pr", pr), 
      ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0`) : ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0`, 
      debug("tilde return", ret), ret;
    });
  }, replaceCarets = (comp, options) => comp.trim().split(/\s+/).map(comp => replaceCaret(comp, options)).join(" "), replaceCaret = (comp, options) => {
    debug("caret", comp, options);
    const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
    return comp.replace(r, (_, M, m, p, pr) => {
      let ret;
      return debug("caret", comp, _, M, m, p, pr), isX(M) ? ret = "" : isX(m) ? ret = `>=${M}.0.0 <${+M + 1}.0.0` : isX(p) ? ret = "0" === M ? `>=${M}.${m}.0 <${M}.${+m + 1}.0` : `>=${M}.${m}.0 <${+M + 1}.0.0` : pr ? (debug("replaceCaret pr", pr), 
      ret = "0" === M ? "0" === m ? `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}` : `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0` : `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0`) : (debug("no pr"), 
      ret = "0" === M ? "0" === m ? `>=${M}.${m}.${p} <${M}.${m}.${+p + 1}` : `>=${M}.${m}.${p} <${M}.${+m + 1}.0` : `>=${M}.${m}.${p} <${+M + 1}.0.0`), 
      debug("caret return", ret), ret;
    });
  }, replaceXRanges = (comp, options) => (debug("replaceXRanges", comp, options), 
  comp.split(/\s+/).map(comp => replaceXRange(comp, options)).join(" ")), replaceXRange = (comp, options) => {
    comp = comp.trim();
    const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
      debug("xRange", comp, ret, gtlt, M, m, p, pr);
      const xM = isX(M), xm = xM || isX(m), xp = xm || isX(p), anyX = xp;
      return "=" === gtlt && anyX && (gtlt = ""), pr = options.includePrerelease ? "-0" : "", 
      xM ? ret = ">" === gtlt || "<" === gtlt ? "<0.0.0-0" : "*" : gtlt && anyX ? (xm && (m = 0), 
      p = 0, ">" === gtlt ? (gtlt = ">=", xm ? (M = +M + 1, m = 0, p = 0) : (m = +m + 1, 
      p = 0)) : "<=" === gtlt && (gtlt = "<", xm ? M = +M + 1 : m = +m + 1), ret = `${gtlt + M}.${m}.${p}${pr}`) : xm ? ret = `>=${M}.0.0${pr} <${+M + 1}.0.0${pr}` : xp && (ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0${pr}`), 
      debug("xRange return", ret), ret;
    });
  }, replaceStars = (comp, options) => (debug("replaceStars", comp, options), comp.trim().replace(re[t.STAR], "")), hyphenReplace = ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) => `${from = isX(fM) ? "" : isX(fm) ? `>=${fM}.0.0` : isX(fp) ? `>=${fM}.${fm}.0` : ">=" + from} ${to = isX(tM) ? "" : isX(tm) ? `<${+tM + 1}.0.0` : isX(tp) ? `<${tM}.${+tm + 1}.0` : tpr ? `<=${tM}.${tm}.${tp}-${tpr}` : "<=" + to}`.trim(), testSet = (set, version, options) => {
    for (let i = 0; i < set.length; i++) if (!set[i].test(version)) return !1;
    if (version.prerelease.length && !options.includePrerelease) {
      for (let i = 0; i < set.length; i++) if (debug(set[i].semver), set[i].semver !== Comparator.ANY && set[i].semver.prerelease.length > 0) {
        const allowed = set[i].semver;
        if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) return !0;
      }
      return !1;
    }
    return !0;
  };
}, function(module, exports, __webpack_require__) {
  "use strict";
  module.exports = x => {
    if ("string" != typeof x) throw new TypeError("Expected a string, got " + typeof x);
    return 65279 === x.charCodeAt(0) ? x.slice(1) : x;
  };
}, function(module, exports, __webpack_require__) {
  const compare = __webpack_require__(4);
  module.exports = (a, b, loose) => compare(a, b, loose) <= 0;
}, function(module, exports, __webpack_require__) {
  const ANY = Symbol("SemVer ANY");
  class Comparator {
    static get ANY() {
      return ANY;
    }
    constructor(comp, options) {
      if (options && "object" == typeof options || (options = {
        loose: !!options,
        includePrerelease: !1
      }), comp instanceof Comparator) {
        if (comp.loose === !!options.loose) return comp;
        comp = comp.value;
      }
      debug("comparator", comp, options), this.options = options, this.loose = !!options.loose, 
      this.parse(comp), this.semver === ANY ? this.value = "" : this.value = this.operator + this.semver.version, 
      debug("comp", this);
    }
    parse(comp) {
      const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR], m = comp.match(r);
      if (!m) throw new TypeError("Invalid comparator: " + comp);
      this.operator = void 0 !== m[1] ? m[1] : "", "=" === this.operator && (this.operator = ""), 
      m[2] ? this.semver = new SemVer(m[2], this.options.loose) : this.semver = ANY;
    }
    toString() {
      return this.value;
    }
    test(version) {
      if (debug("Comparator.test", version, this.options.loose), this.semver === ANY || version === ANY) return !0;
      if ("string" == typeof version) try {
        version = new SemVer(version, this.options);
      } catch (er) {
        return !1;
      }
      return cmp(version, this.operator, this.semver, this.options);
    }
    intersects(comp, options) {
      if (!(comp instanceof Comparator)) throw new TypeError("a Comparator is required");
      if (options && "object" == typeof options || (options = {
        loose: !!options,
        includePrerelease: !1
      }), "" === this.operator) return "" === this.value || new Range(comp.value, options).test(this.value);
      if ("" === comp.operator) return "" === comp.value || new Range(this.value, options).test(comp.semver);
      const sameDirectionIncreasing = !(">=" !== this.operator && ">" !== this.operator || ">=" !== comp.operator && ">" !== comp.operator), sameDirectionDecreasing = !("<=" !== this.operator && "<" !== this.operator || "<=" !== comp.operator && "<" !== comp.operator), sameSemVer = this.semver.version === comp.semver.version, differentDirectionsInclusive = !(">=" !== this.operator && "<=" !== this.operator || ">=" !== comp.operator && "<=" !== comp.operator), oppositeDirectionsLessThan = cmp(this.semver, "<", comp.semver, options) && (">=" === this.operator || ">" === this.operator) && ("<=" === comp.operator || "<" === comp.operator), oppositeDirectionsGreaterThan = cmp(this.semver, ">", comp.semver, options) && ("<=" === this.operator || "<" === this.operator) && (">=" === comp.operator || ">" === comp.operator);
      return sameDirectionIncreasing || sameDirectionDecreasing || sameSemVer && differentDirectionsInclusive || oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
    }
  }
  module.exports = Comparator;
  const _require = __webpack_require__(5), re = _require.re, t = _require.t, cmp = __webpack_require__(26), debug = __webpack_require__(7), SemVer = __webpack_require__(3), Range = __webpack_require__(8);
}, function(module, exports) {
  module.exports = require("util");
}, function(module, exports) {
  module.exports = require("path");
}, function(module, exports, __webpack_require__) {
  "use strict";
  const Buffer = __webpack_require__(17).Buffer, crypto = __webpack_require__(19), SPEC_ALGORITHMS = (__webpack_require__(20).Transform, 
  [ "sha256", "sha384", "sha512" ]), BASE64_REGEX = /^[a-z0-9+/]+(?:=?=?)$/i, SRI_REGEX = /^([^-]+)-([^?]+)([?\S*]*)$/, STRICT_SRI_REGEX = /^([^-]+)-([A-Za-z0-9+/=]{44,88})(\?[\x21-\x7E]*)*$/, VCHAR_REGEX = /^[\x21-\x7E]+$/;
  class Hash {
    get isHash() {
      return !0;
    }
    constructor(hash, opts) {
      const strict = !(!opts || !opts.strict);
      this.source = hash.trim();
      const match = this.source.match(strict ? STRICT_SRI_REGEX : SRI_REGEX);
      if (!match) return;
      if (strict && !SPEC_ALGORITHMS.some(a => a === match[1])) return;
      this.algorithm = match[1], this.digest = match[2];
      const rawOpts = match[3];
      this.options = rawOpts ? rawOpts.slice(1).split("?") : [];
    }
    hexDigest() {
      return this.digest && Buffer.from(this.digest, "base64").toString("hex");
    }
    toJSON() {
      return this.toString();
    }
    toString(opts) {
      if (opts && opts.strict && !(SPEC_ALGORITHMS.some(x => x === this.algorithm) && this.digest.match(BASE64_REGEX) && (this.options || []).every(opt => opt.match(VCHAR_REGEX)))) return "";
      const options = this.options && this.options.length ? "?" + this.options.join("?") : "";
      return `${this.algorithm}-${this.digest}${options}`;
    }
  }
  class Integrity {
    get isIntegrity() {
      return !0;
    }
    toJSON() {
      return this.toString();
    }
    toString(opts) {
      let sep = (opts = opts || {}).sep || " ";
      return opts.strict && (sep = sep.replace(/\S+/g, " ")), Object.keys(this).map(k => this[k].map(hash => Hash.prototype.toString.call(hash, opts)).filter(x => x.length).join(sep)).filter(x => x.length).join(sep);
    }
    concat(integrity, opts) {
      const other = "string" == typeof integrity ? integrity : stringify(integrity, opts);
      return parse(`${this.toString(opts)} ${other}`, opts);
    }
    hexDigest() {
      return parse(this, {
        single: !0
      }).hexDigest();
    }
    match(integrity, opts) {
      const other = parse(integrity, opts), algo = other.pickAlgorithm(opts);
      return this[algo] && other[algo] && this[algo].find(hash => other[algo].find(otherhash => hash.digest === otherhash.digest)) || !1;
    }
    pickAlgorithm(opts) {
      const pickAlgorithm = opts && opts.pickAlgorithm || getPrioritizedHash, keys = Object.keys(this);
      if (!keys.length) throw new Error("No algorithms available for " + JSON.stringify(this.toString()));
      return keys.reduce((acc, algo) => pickAlgorithm(acc, algo) || acc);
    }
  }
  function parse(sri, opts) {
    if (opts = opts || {}, "string" == typeof sri) return _parse(sri, opts);
    if (sri.algorithm && sri.digest) {
      const fullSri = new Integrity;
      return fullSri[sri.algorithm] = [ sri ], _parse(stringify(fullSri, opts), opts);
    }
    return _parse(stringify(sri, opts), opts);
  }
  function _parse(integrity, opts) {
    return opts.single ? new Hash(integrity, opts) : integrity.trim().split(/\s+/).reduce((acc, string) => {
      const hash = new Hash(string, opts);
      if (hash.algorithm && hash.digest) {
        const algo = hash.algorithm;
        acc[algo] || (acc[algo] = []), acc[algo].push(hash);
      }
      return acc;
    }, new Integrity);
  }
  function stringify(obj, opts) {
    return obj.algorithm && obj.digest ? Hash.prototype.toString.call(obj, opts) : "string" == typeof obj ? stringify(parse(obj, opts), opts) : Integrity.prototype.toString.call(obj, opts);
  }
  module.exports.parse = parse;
  const NODE_HASHES = new Set(crypto.getHashes()), DEFAULT_PRIORITY = [ "md5", "whirlpool", "sha1", "sha224", "sha256", "sha384", "sha512", "sha3", "sha3-256", "sha3-384", "sha3-512", "sha3_256", "sha3_384", "sha3_512" ].filter(algo => NODE_HASHES.has(algo));
  function getPrioritizedHash(algo1, algo2) {
    return DEFAULT_PRIORITY.indexOf(algo1.toLowerCase()) >= DEFAULT_PRIORITY.indexOf(algo2.toLowerCase()) ? algo1 : algo2;
  }
}, function(module) {
  module.exports = JSON.parse('{"yarnVersion":"1.10.0-0"}');
}, function(module, exports) {
  module.exports = require("child_process");
}, function(module, exports, __webpack_require__) {
  var buffer = __webpack_require__(18), Buffer = buffer.Buffer;
  function copyProps(src, dst) {
    for (var key in src) dst[key] = src[key];
  }
  function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer(arg, encodingOrOffset, length);
  }
  Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow ? module.exports = buffer : (copyProps(buffer, exports), 
  exports.Buffer = SafeBuffer), copyProps(Buffer, SafeBuffer), SafeBuffer.from = function(arg, encodingOrOffset, length) {
    if ("number" == typeof arg) throw new TypeError("Argument must not be a number");
    return Buffer(arg, encodingOrOffset, length);
  }, SafeBuffer.alloc = function(size, fill, encoding) {
    if ("number" != typeof size) throw new TypeError("Argument must be a number");
    var buf = Buffer(size);
    return void 0 !== fill ? "string" == typeof encoding ? buf.fill(fill, encoding) : buf.fill(fill) : buf.fill(0), 
    buf;
  }, SafeBuffer.allocUnsafe = function(size) {
    if ("number" != typeof size) throw new TypeError("Argument must be a number");
    return Buffer(size);
  }, SafeBuffer.allocUnsafeSlow = function(size) {
    if ("number" != typeof size) throw new TypeError("Argument must be a number");
    return buffer.SlowBuffer(size);
  };
}, function(module, exports) {
  module.exports = require("buffer");
}, function(module, exports) {
  module.exports = require("crypto");
}, function(module, exports) {
  module.exports = require("stream");
}, function(module, exports) {
  const numeric = /^[0-9]+$/, compareIdentifiers = (a, b) => {
    const anum = numeric.test(a), bnum = numeric.test(b);
    return anum && bnum && (a = +a, b = +b), a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
  };
  module.exports = {
    compareIdentifiers: compareIdentifiers,
    rcompareIdentifiers: (a, b) => compareIdentifiers(b, a)
  };
}, function(module, exports, __webpack_require__) {
  const parse = __webpack_require__(23);
  module.exports = (version, options) => {
    const s = parse(version.trim().replace(/^[=v]+/, ""), options);
    return s ? s.version : null;
  };
}, function(module, exports, __webpack_require__) {
  const MAX_LENGTH = __webpack_require__(6).MAX_LENGTH, _require2 = __webpack_require__(5), re = _require2.re, t = _require2.t, SemVer = __webpack_require__(3);
  module.exports = (version, options) => {
    if (options && "object" == typeof options || (options = {
      loose: !!options,
      includePrerelease: !1
    }), version instanceof SemVer) return version;
    if ("string" != typeof version) return null;
    if (version.length > MAX_LENGTH) return null;
    if (!(options.loose ? re[t.LOOSE] : re[t.FULL]).test(version)) return null;
    try {
      return new SemVer(version, options);
    } catch (er) {
      return null;
    }
  };
}, function(module, exports, __webpack_require__) {
  const compareBuild = __webpack_require__(25);
  module.exports = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
}, function(module, exports, __webpack_require__) {
  const SemVer = __webpack_require__(3);
  module.exports = (a, b, loose) => {
    const versionA = new SemVer(a, loose), versionB = new SemVer(b, loose);
    return versionA.compare(versionB) || versionA.compareBuild(versionB);
  };
}, function(module, exports, __webpack_require__) {
  const eq = __webpack_require__(27), neq = __webpack_require__(28), gt = __webpack_require__(29), gte = __webpack_require__(30), lt = __webpack_require__(31), lte = __webpack_require__(10);
  module.exports = (a, op, b, loose) => {
    switch (op) {
     case "===":
      return "object" == typeof a && (a = a.version), "object" == typeof b && (b = b.version), 
      a === b;

     case "!==":
      return "object" == typeof a && (a = a.version), "object" == typeof b && (b = b.version), 
      a !== b;

     case "":
     case "=":
     case "==":
      return eq(a, b, loose);

     case "!=":
      return neq(a, b, loose);

     case ">":
      return gt(a, b, loose);

     case ">=":
      return gte(a, b, loose);

     case "<":
      return lt(a, b, loose);

     case "<=":
      return lte(a, b, loose);

     default:
      throw new TypeError("Invalid operator: " + op);
    }
  };
}, function(module, exports, __webpack_require__) {
  const compare = __webpack_require__(4);
  module.exports = (a, b, loose) => 0 === compare(a, b, loose);
}, function(module, exports, __webpack_require__) {
  const compare = __webpack_require__(4);
  module.exports = (a, b, loose) => 0 !== compare(a, b, loose);
}, function(module, exports, __webpack_require__) {
  const compare = __webpack_require__(4);
  module.exports = (a, b, loose) => compare(a, b, loose) > 0;
}, function(module, exports, __webpack_require__) {
  const compare = __webpack_require__(4);
  module.exports = (a, b, loose) => compare(a, b, loose) >= 0;
}, function(module, exports, __webpack_require__) {
  const compare = __webpack_require__(4);
  module.exports = (a, b, loose) => compare(a, b, loose) < 0;
}, function(module, exports, __webpack_require__) {
  const Range = __webpack_require__(8);
  module.exports = (version, range, options) => {
    try {
      range = new Range(range, options);
    } catch (er) {
      return !1;
    }
    return range.test(version);
  };
}, function(module, exports, __webpack_require__) {
  const Range = __webpack_require__(8);
  module.exports = (range, options) => {
    try {
      return new Range(range, options).range || "*";
    } catch (er) {
      return null;
    }
  };
}, function(module, __webpack_exports__, __webpack_require__) {
  "use strict";
  function sortAlpha(a, b) {
    const shortLen = Math.min(a.length, b.length);
    for (let i = 0; i < shortLen; i++) {
      const aChar = a.charCodeAt(i), bChar = b.charCodeAt(i);
      if (aChar !== bChar) return aChar - bChar;
    }
    return a.length - b.length;
  }
  __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "collectPackages", (function() {
    return collectPackages;
  })), __webpack_require__.d(__webpack_exports__, "selectUpdates", (function() {
    return selectUpdates;
  })), __webpack_require__.d(__webpack_exports__, "updatePackages", (function() {
    return updatePackages;
  }));
  var external_util_ = __webpack_require__(12), external_util_default = __webpack_require__.n(external_util_), invariant = __webpack_require__(2), invariant_default = __webpack_require__.n(invariant), strip_bom = __webpack_require__(9), strip_bom_default = __webpack_require__.n(strip_bom);
  class MessageError extends Error {
    constructor(msg, code) {
      super(msg), this.code = code;
    }
  }
  function nullify(obj = {}) {
    if (Array.isArray(obj)) for (const item of obj) nullify(item); else if ((null !== obj && "object" == typeof obj || "function" == typeof obj) && (Object.setPrototypeOf(obj, null), 
    "object" == typeof obj)) for (const key in obj) nullify(obj[key]);
    return obj;
  }
  const VERSION_REGEX = /^yarn lockfile v(\d+)$/, TOKEN_TYPES_boolean = "BOOLEAN", TOKEN_TYPES_string = "STRING", TOKEN_TYPES_eof = "EOF", TOKEN_TYPES_colon = "COLON", TOKEN_TYPES_newline = "NEWLINE", TOKEN_TYPES_comment = "COMMENT", TOKEN_TYPES_indent = "INDENT", TOKEN_TYPES_invalid = "INVALID", TOKEN_TYPES_number = "NUMBER", TOKEN_TYPES_comma = "COMMA", VALID_PROP_VALUE_TOKENS = [ TOKEN_TYPES_boolean, TOKEN_TYPES_string, TOKEN_TYPES_number ];
  class parse_Parser {
    constructor(input, fileLoc = "lockfile") {
      this.comments = [], this.tokens = function*(input) {
        let lastNewline = !1, line = 1, col = 0;
        function buildToken(type, value) {
          return {
            line: line,
            col: col,
            type: type,
            value: value
          };
        }
        for (;input.length; ) {
          let chop = 0;
          if ("\n" === input[0] || "\r" === input[0]) chop++, "\n" === input[1] && chop++, 
          line++, col = 0, yield buildToken(TOKEN_TYPES_newline); else if ("#" === input[0]) {
            chop++;
            let val = "";
            for (;"\n" !== input[chop]; ) val += input[chop], chop++;
            yield buildToken(TOKEN_TYPES_comment, val);
          } else if (" " === input[0]) if (lastNewline) {
            let indent = "";
            for (let i = 0; " " === input[i]; i++) indent += input[i];
            if (indent.length % 2) throw new TypeError("Invalid number of spaces");
            chop = indent.length, yield buildToken(TOKEN_TYPES_indent, indent.length / 2);
          } else chop++; else if ('"' === input[0]) {
            let val = "";
            for (let i = 0; ;i++) {
              const currentChar = input[i];
              if (val += currentChar, i > 0 && '"' === currentChar) {
                if (!("\\" === input[i - 1] && "\\" !== input[i - 2])) break;
              }
            }
            chop = val.length;
            try {
              yield buildToken(TOKEN_TYPES_string, JSON.parse(val));
            } catch (err) {
              if (!(err instanceof SyntaxError)) throw err;
              yield buildToken(TOKEN_TYPES_invalid);
            }
          } else if (/^[0-9]/.test(input)) {
            let val = "";
            for (let i = 0; /^[0-9]$/.test(input[i]); i++) val += input[i];
            chop = val.length, yield buildToken(TOKEN_TYPES_number, +val);
          } else if (/^true/.test(input)) yield buildToken(TOKEN_TYPES_boolean, !0), chop = 4; else if (/^false/.test(input)) yield buildToken(TOKEN_TYPES_boolean, !1), 
          chop = 5; else if (":" === input[0]) yield buildToken(TOKEN_TYPES_colon), chop++; else if ("," === input[0]) yield buildToken(TOKEN_TYPES_comma), 
          chop++; else if (/^[a-zA-Z\/-]/g.test(input)) {
            let name = "";
            for (let i = 0; i < input.length; i++) {
              const char = input[i];
              if (":" === char || " " === char || "\n" === char || "\r" === char || "," === char) break;
              name += char;
            }
            chop = name.length, yield buildToken(TOKEN_TYPES_string, name);
          } else yield buildToken(TOKEN_TYPES_invalid);
          chop || (yield buildToken(TOKEN_TYPES_invalid)), col += chop, lastNewline = "\n" === input[0] || "\r" === input[0] && "\n" === input[1], 
          input = input.slice(chop);
        }
        yield buildToken(TOKEN_TYPES_eof);
      }(input), this.fileLoc = fileLoc;
    }
    onComment(token) {
      const value = token.value;
      invariant_default()("string" == typeof value, "expected token value to be a string");
      const comment = value.trim(), versionMatch = comment.match(VERSION_REGEX);
      if (versionMatch) {
        const version = +versionMatch[1];
        if (version > 1) throw new MessageError(`Can't install from a lockfile of version ${version} as you're on an old yarn version that only supports versions up to 1. Run \`$ yarn self-update\` to upgrade to the latest version.`);
      }
      this.comments.push(comment);
    }
    next() {
      const item = this.tokens.next();
      invariant_default()(item, "expected a token");
      const done = item.done, value = item.value;
      if (done || !value) throw new Error("No more tokens");
      return value.type === TOKEN_TYPES_comment ? (this.onComment(value), this.next()) : this.token = value;
    }
    unexpected(msg = "Unexpected token") {
      throw new SyntaxError(`${msg} ${this.token.line}:${this.token.col} in ${this.fileLoc}`);
    }
    expect(tokType) {
      this.token.type === tokType ? this.next() : this.unexpected();
    }
    eat(tokType) {
      return this.token.type === tokType && (this.next(), !0);
    }
    parse(indent = 0) {
      const obj = nullify();
      for (;;) {
        const propToken = this.token;
        if (propToken.type === TOKEN_TYPES_newline) {
          const nextToken = this.next();
          if (!indent) continue;
          if (nextToken.type !== TOKEN_TYPES_indent) break;
          if (nextToken.value !== indent) break;
          this.next();
        } else if (propToken.type === TOKEN_TYPES_indent) {
          if (propToken.value !== indent) break;
          this.next();
        } else {
          if (propToken.type === TOKEN_TYPES_eof) break;
          if (propToken.type === TOKEN_TYPES_string) {
            const key = propToken.value;
            invariant_default()(key, "Expected a key");
            const keys = [ key ];
            for (this.next(); this.token.type === TOKEN_TYPES_comma; ) {
              this.next();
              const keyToken = this.token;
              keyToken.type !== TOKEN_TYPES_string && this.unexpected("Expected string");
              const key = keyToken.value;
              invariant_default()(key, "Expected a key"), keys.push(key), this.next();
            }
            const valToken = this.token;
            if (valToken.type === TOKEN_TYPES_colon) {
              this.next();
              const val = this.parse(indent + 1);
              for (const key of keys) obj[key] = val;
              if (indent && this.token.type !== TOKEN_TYPES_indent) break;
            } else if (token = valToken, VALID_PROP_VALUE_TOKENS.indexOf(token.type) >= 0) {
              for (const key of keys) obj[key] = valToken.value;
              this.next();
            } else this.unexpected("Invalid value type");
          } else this.unexpected("Unknown token: " + external_util_default.a.inspect(propToken));
        }
      }
      var token;
      return obj;
    }
  }
  function parse(str, fileLoc) {
    const parser = new parse_Parser(str, fileLoc);
    return parser.next(), parser.parse();
  }
  var lockfile_parse = function(str, fileLoc = "lockfile") {
    return function(str) {
      return str.includes("<<<<<<<") && str.includes("=======") && str.includes(">>>>>>>");
    }(str = strip_bom_default()(str)) ? function(str, fileLoc) {
      const variants = function(str) {
        const variants = [ [], [] ], lines = str.split(/\r?\n/g);
        let skip = !1;
        for (;lines.length; ) {
          const line = lines.shift();
          if (line.startsWith("<<<<<<<")) {
            for (;lines.length; ) {
              const conflictLine = lines.shift();
              if ("=======" === conflictLine) {
                skip = !1;
                break;
              }
              skip || conflictLine.startsWith("|||||||") ? skip = !0 : variants[0].push(conflictLine);
            }
            for (;lines.length; ) {
              const conflictLine = lines.shift();
              if (conflictLine.startsWith(">>>>>>>")) break;
              variants[1].push(conflictLine);
            }
          } else variants[0].push(line), variants[1].push(line);
        }
        return [ variants[0].join("\n"), variants[1].join("\n") ];
      }(str);
      try {
        return {
          type: "merge",
          object: Object.assign({}, parse(variants[0], fileLoc), parse(variants[1], fileLoc))
        };
      } catch (err) {
        if (err instanceof SyntaxError) return {
          type: "conflict",
          object: {}
        };
        throw err;
      }
    }(str, fileLoc) : {
      type: "success",
      object: parse(str, fileLoc)
    };
  }, external_fs_ = __webpack_require__(1), external_fs_default = __webpack_require__.n(external_fs_);
  void 0 !== external_fs_default.a.constants ? external_fs_default.a.constants : (external_fs_default.a.R_OK, 
  external_fs_default.a.W_OK, external_fs_default.a.X_OK), external_fs_default.a.existsSync, 
  external_fs_default.a.lstatSync, external_fs_default.a.readFileSync;
  __webpack_require__(13), __webpack_require__(14);
  var lockfile_package = __webpack_require__(15);
  const NODE_VERSION = process.version;
  function maybeWrap(str) {
    return "boolean" == typeof str || "number" == typeof str || function(str) {
      return 0 === str.indexOf("true") || 0 === str.indexOf("false") || /[:\s\n\\",\[\]]/g.test(str) || /^[0-9]/g.test(str) || !/^[a-zA-Z]/g.test(str);
    }(str) ? JSON.stringify(str) : str;
  }
  const priorities = {
    name: 1,
    version: 2,
    uid: 3,
    resolved: 4,
    integrity: 5,
    registry: 6,
    dependencies: 7
  };
  function priorityThenAlphaSort(a, b) {
    return priorities[a] || priorities[b] ? (priorities[a] || 100) > (priorities[b] || 100) ? 1 : -1 : sortAlpha(a, b);
  }
  function stringify(obj, noHeader, enableVersions) {
    const val = function _stringify(obj, options) {
      if ("object" != typeof obj) throw new TypeError;
      const indent = options.indent, lines = [], keys = Object.keys(obj).sort(priorityThenAlphaSort);
      let addedKeys = [];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i], val = obj[key];
        if (null == val || addedKeys.indexOf(key) >= 0) continue;
        const valKeys = [ key ];
        if ("object" == typeof val) for (let j = i + 1; j < keys.length; j++) {
          const key = keys[j];
          val === obj[key] && valKeys.push(key);
        }
        const keyLine = valKeys.sort(sortAlpha).map(maybeWrap).join(", ");
        if ("string" == typeof val || "boolean" == typeof val || "number" == typeof val) lines.push(`${keyLine} ${maybeWrap(val)}`); else {
          if ("object" != typeof val) throw new TypeError;
          lines.push(`${keyLine}:\n${_stringify(val, {
            indent: indent + "  "
          })}` + (options.topLevel ? "\n" : ""));
        }
        addedKeys = addedKeys.concat(valKeys);
      }
      return indent + lines.join("\n" + indent);
    }(obj, {
      indent: "",
      topLevel: !0
    });
    if (noHeader) return val;
    const lines = [];
    return lines.push("# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY."), 
    lines.push("# yarn lockfile v1"), enableVersions && (lines.push("# yarn v" + lockfile_package.yarnVersion), 
    lines.push("# node " + NODE_VERSION)), lines.push("\n"), lines.push(val), lines.join("\n");
  }
  var semver = __webpack_require__(0), semver_default = __webpack_require__.n(semver), external_child_process_ = __webpack_require__(16);
  const yarnInfo = (pkg, field = null) => {
    const out = Object(external_child_process_.execSync)(`yarn info --json "${pkg}" ${field || ""}`), m = /^{"type":"inspect".*}\s*$/m.exec(String(out));
    if (!m) throw new Error(out.toString().trim());
    return JSON.parse(m[0]).data;
  }, resolvePackageUrl = (pkg, oldPkg) => {
    let url;
    if (pkg.dist && pkg.dist.tarball) url = pkg.dist.tarball.replace(".npmjs.org/", ".yarnpkg.com/"); else {
      if (!oldPkg.resolved) return null;
      url = oldPkg.resolved.replace(new RegExp(`\\b${text = oldPkg.version, text.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")}\\b`), pkg.version).replace(/#[^#]*$/, "");
    }
    var text;
    return pkg.dist && pkg.dist.shasum ? `${url}#${pkg.dist.shasum}` : url;
  }, isEmptyObject = obj => !obj || !Object.keys(obj).length;
  function _slicedToArray(arr, i) {
    return function(arr) {
      if (Array.isArray(arr)) return arr;
    }(arr) || function(arr, i) {
      if ("undefined" == typeof Symbol || !(Symbol.iterator in Object(arr))) return;
      var _arr = [], _n = !0, _d = !1, _e = void 0;
      try {
        for (var _s, _i = arr[Symbol.iterator](); !(_n = (_s = _i.next()).done) && (_arr.push(_s.value), 
        !i || _arr.length !== i); _n = !0) ;
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          _n || null == _i.return || _i.return();
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }(arr, i) || function(o, minLen) {
      if (!o) return;
      if ("string" == typeof o) return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      "Object" === n && o.constructor && (n = o.constructor.name);
      if ("Map" === n || "Set" === n) return Array.from(o);
      if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }(arr, i) || function() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }();
  }
  function _arrayLikeToArray(arr, len) {
    (null == len || len > arr.length) && (len = arr.length);
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  const collectPackages = (json, exclude) => {
    const packages = {};
    return Object.keys(json).forEach(name => {
      const pkg = json[name], _parsePackageName2 = _slicedToArray((name => {
        const i = name.lastIndexOf("@");
        return i > 0 ? [ name.substr(0, i), name.substr(i + 1) ] : [ name, null ];
      })(name), 2), pkgName = _parsePackageName2[0], version = _parsePackageName2[1];
      packages[pkgName] || (packages[pkgName] = {});
      const group = packages[pkgName];
      group[pkg.version] || (group[pkg.version] = {
        pkg: pkg,
        versions: [],
        updated: !1
      });
      const obj = group[pkg.version];
      obj.versions.push(version), obj.updated || (exclude && exclude.test(name) ? obj.updated = !0 : version && semver_default.a.clean(version, !0) === pkg.version && (obj.updated = !0, 
      console.log(" [32m%s[0m %s", "[  FIXED]", name)));
    }), packages;
  }, selectUpdates = packages => {
    const json = {};
    return Object.keys(packages).forEach(name => {
      Object.keys(packages[name]).forEach(version => {
        const obj = packages[name][version];
        "string" == typeof obj.updated && obj.versions.forEach(range => {
          json["string" == typeof range ? `${name}@${range}` : name] = obj.pkg;
        });
      });
    }), json;
  }, isCompatibleDeps = (newDeps, oldDeps, packages) => {
    const list = [];
    if (!newDeps) return list;
    const newKeys = Object.keys(newDeps);
    if (!newKeys.length) return list;
    if (!oldDeps) return null;
    const oldKeys = Object.keys(oldDeps);
    if (!oldKeys.length) return null;
    if (newKeys.some(k => !oldKeys.includes(k))) return null;
    return newKeys.every(name => {
      if (!newDeps[name] || !oldDeps[name]) return !0;
      const newVer = semver_default.a.validRange(newDeps[name], !0), oldVer = semver_default.a.validRange(oldDeps[name], !0);
      if (newVer === oldVer || "*" === newVer || "*" === oldVer) return !0;
      const item = ((newVer, oldVer, packages, name) => {
        const group = packages[name], version = Object.keys(group).find(v => group[v].versions.includes(oldVer));
        if (!version) throw new Error(`Could not found package: ${name}@${oldVer}`);
        const obj = group[version];
        return semver_default.a.satisfies(version, newVer, !0) || (obj.updated || updateAPackage(packages, name, version), 
        "string" == typeof obj.updated && semver_default.a.satisfies(obj.updated, newVer, !0)) ? [ newVer, obj ] : null;
      })(newDeps[name], oldDeps[name], packages, name);
      return !!item && (list.push(item), !0);
    }) ? list : null;
  }, updateAPackage = (packages, name, version) => {
    const obj = packages[name][version];
    if (obj.updated) return;
    const versions = yarnInfo(name, "versions");
    if (!versions) throw new Error("Could not fetch package versions: " + name);
    semver_default.a.rsort(versions, !0), versions.some(ver => {
      if (semver_default.a.lte(ver, version, !0)) return obj.updated = !0, console.log(" [32m%s[0m %s@%s", "[HIGHEST]", name, version), 
      !0;
      if (obj.versions.some(range => range && semver_default.a.satisfies(version, range, !0) && !semver_default.a.satisfies(ver, range, !0))) return !1;
      const pkg = yarnInfo(`${name}@${ver}`);
      if (!pkg) throw new Error(`Could not fetch package info: ${name}@${ver}`);
      const upOpts = isCompatibleDeps(pkg.optionalDependencies, obj.pkg.optionalDependencies, packages);
      if (!upOpts) return !1;
      const upDeps = isCompatibleDeps(pkg.dependencies, obj.pkg.dependencies, packages);
      return !!upDeps && (obj.pkg = ((pkg, oldPkg) => ({
        version: pkg.version,
        resolved: resolvePackageUrl(pkg, oldPkg),
        integrity: pkg.dist && pkg.dist.integrity,
        dependencies: isEmptyObject(pkg.dependencies) ? null : pkg.dependencies,
        optionalDependencies: isEmptyObject(pkg.optionalDependencies) ? null : pkg.optionalDependencies
      }))(pkg, obj.pkg), obj.updated = ver, upOpts.concat(upDeps).forEach(item => {
        const _item = _slicedToArray(item, 2), newVer = _item[0], obj = _item[1];
        obj.versions.push(newVer), "string" != typeof obj.updated && (obj.updated = obj.pkg.version);
      }), console.info(" [33m%s[0m %s@%s -> %s", "[ UPDATE]", name, version, ver), !0);
    });
  }, updatePackages = (yarnLock, exclude) => {
    const json = lockfile_parse(yarnLock).object, packages = collectPackages(json, exclude);
    return Object.keys(packages).forEach(name => {
      Object.keys(packages[name]).forEach(version => {
        updateAPackage(packages, name, version);
      });
    }), Object.assign(json, selectUpdates(packages)), stringify(json);
  };
} ]);