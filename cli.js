#!/usr/bin/env node
require("v8-compile-cache"), function(modules) {
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
  __webpack_require__.m = modules, __webpack_require__.c = installedModules, __webpack_require__.d = function(exports, name, getter) {
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
  }, __webpack_require__.p = "", __webpack_require__(__webpack_require__.s = 4);
}([ function(module, exports) {
  module.exports = require("fs");
}, function(module, exports, __webpack_require__) {
  var EventEmitter = __webpack_require__(5).EventEmitter, spawn = __webpack_require__(6).spawn, path = __webpack_require__(7), dirname = path.dirname, basename = path.basename, fs = __webpack_require__(0);
  function Option(flags, description) {
    this.flags = flags, this.required = flags.indexOf("<") >= 0, this.optional = flags.indexOf("[") >= 0, 
    this.bool = -1 === flags.indexOf("-no-"), (flags = flags.split(/[ ,|]+/)).length > 1 && !/^[[<]/.test(flags[1]) && (this.short = flags.shift()), 
    this.long = flags.shift(), this.description = description || "";
  }
  function Command(name) {
    this.commands = [], this.options = [], this._execs = {}, this._allowUnknownOption = !1, 
    this._args = [], this._name = name || "";
  }
  function pad(str, width) {
    var len = Math.max(0, width - str.length);
    return str + Array(len + 1).join(" ");
  }
  function outputHelpIfNecessary(cmd, options) {
    options = options || [];
    for (var i = 0; i < options.length; i++) "--help" !== options[i] && "-h" !== options[i] || (cmd.outputHelp(), 
    process.exit(0));
  }
  function humanReadableArgName(arg) {
    var nameOutput = arg.name + (!0 === arg.variadic ? "..." : "");
    return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
  }
  function exists(file) {
    try {
      if (fs.statSync(file).isFile()) return !0;
    } catch (e) {
      return !1;
    }
  }
  __webpack_require__(8).inherits(Command, EventEmitter), (exports = module.exports = new Command).Command = Command, 
  exports.Option = Option, Option.prototype.name = function() {
    return this.long.replace("--", "").replace("no-", "");
  }, Option.prototype.attributeName = function() {
    return this.name().split("-").reduce((function(str, word) {
      return str + word[0].toUpperCase() + word.slice(1);
    }));
  }, Option.prototype.is = function(arg) {
    return this.short === arg || this.long === arg;
  }, Command.prototype.command = function(name, desc, opts) {
    "object" == typeof desc && null !== desc && (opts = desc, desc = null), opts = opts || {};
    var args = name.split(/ +/), cmd = new Command(args.shift());
    return desc && (cmd.description(desc), this.executables = !0, this._execs[cmd._name] = !0, 
    opts.isDefault && (this.defaultExecutable = cmd._name)), cmd._noHelp = !!opts.noHelp, 
    this.commands.push(cmd), cmd.parseExpectedArgs(args), cmd.parent = this, desc ? this : cmd;
  }, Command.prototype.arguments = function(desc) {
    return this.parseExpectedArgs(desc.split(/ +/));
  }, Command.prototype.addImplicitHelpCommand = function() {
    this.command("help [cmd]", "display help for [cmd]");
  }, Command.prototype.parseExpectedArgs = function(args) {
    if (args.length) {
      var self = this;
      return args.forEach((function(arg) {
        var argDetails = {
          required: !1,
          name: "",
          variadic: !1
        };
        switch (arg[0]) {
         case "<":
          argDetails.required = !0, argDetails.name = arg.slice(1, -1);
          break;

         case "[":
          argDetails.name = arg.slice(1, -1);
        }
        argDetails.name.length > 3 && "..." === argDetails.name.slice(-3) && (argDetails.variadic = !0, 
        argDetails.name = argDetails.name.slice(0, -3)), argDetails.name && self._args.push(argDetails);
      })), this;
    }
  }, Command.prototype.action = function(fn) {
    var self = this, listener = function(args, unknown) {
      args = args || [], unknown = unknown || [];
      var parsed = self.parseOptions(unknown);
      outputHelpIfNecessary(self, parsed.unknown), parsed.unknown.length > 0 && self.unknownOption(parsed.unknown[0]), 
      parsed.args.length && (args = parsed.args.concat(args)), self._args.forEach((function(arg, i) {
        arg.required && null == args[i] ? self.missingArgument(arg.name) : arg.variadic && (i !== self._args.length - 1 && self.variadicArgNotLast(arg.name), 
        args[i] = args.splice(i));
      })), self._args.length ? args[self._args.length] = self : args.push(self), fn.apply(self, args);
    }, parent = this.parent || this, name = parent === this ? "*" : this._name;
    return parent.on("command:" + name, listener), this._alias && parent.on("command:" + this._alias, listener), 
    this;
  }, Command.prototype.option = function(flags, description, fn, defaultValue) {
    var self = this, option = new Option(flags, description), oname = option.name(), name = option.attributeName();
    if ("function" != typeof fn) if (fn instanceof RegExp) {
      var regex = fn;
      fn = function(val, def) {
        var m = regex.exec(val);
        return m ? m[0] : def;
      };
    } else defaultValue = fn, fn = null;
    return (!option.bool || option.optional || option.required) && (option.bool || (defaultValue = !0), 
    void 0 !== defaultValue && (self[name] = defaultValue, option.defaultValue = defaultValue)), 
    this.options.push(option), this.on("option:" + oname, (function(val) {
      null !== val && fn && (val = fn(val, void 0 === self[name] ? defaultValue : self[name])), 
      "boolean" == typeof self[name] || void 0 === self[name] ? self[name] = null == val ? !!option.bool && (defaultValue || !0) : val : null !== val && (self[name] = val);
    })), this;
  }, Command.prototype.allowUnknownOption = function(arg) {
    return this._allowUnknownOption = 0 === arguments.length || arg, this;
  }, Command.prototype.parse = function(argv) {
    this.executables && this.addImplicitHelpCommand(), this.rawArgs = argv, this._name = this._name || basename(argv[1], ".js"), 
    this.executables && argv.length < 3 && !this.defaultExecutable && argv.push("--help");
    var parsed = this.parseOptions(this.normalize(argv.slice(2))), args = this.args = parsed.args, result = this.parseArgs(this.args, parsed.unknown), name = result.args[0], aliasCommand = null;
    return name && (aliasCommand = this.commands.filter((function(command) {
      return command.alias() === name;
    }))[0]), !0 === this._execs[name] ? this.executeSubCommand(argv, args, parsed.unknown) : aliasCommand ? (args[0] = aliasCommand._name, 
    this.executeSubCommand(argv, args, parsed.unknown)) : this.defaultExecutable ? (args.unshift(this.defaultExecutable), 
    this.executeSubCommand(argv, args, parsed.unknown)) : result;
  }, Command.prototype.executeSubCommand = function(argv, args, unknown) {
    (args = args.concat(unknown)).length || this.help(), "help" === args[0] && 1 === args.length && this.help(), 
    "help" === args[0] && (args[0] = args[1], args[1] = "--help");
    var baseDir, f = argv[1], bin = basename(f, path.extname(f)) + "-" + args[0], resolvedLink = fs.realpathSync(f);
    baseDir = dirname(resolvedLink);
    var proc, localBin = path.join(baseDir, bin), isExplicitJS = !1;
    exists(localBin + ".js") ? (bin = localBin + ".js", isExplicitJS = !0) : exists(localBin + ".ts") ? (bin = localBin + ".ts", 
    isExplicitJS = !0) : exists(localBin) && (bin = localBin), args = args.slice(1), 
    "win32" !== process.platform ? isExplicitJS ? (args.unshift(bin), args = (process.execArgv || []).concat(args), 
    proc = spawn(process.argv[0], args, {
      stdio: "inherit",
      customFds: [ 0, 1, 2 ]
    })) : proc = spawn(bin, args, {
      stdio: "inherit",
      customFds: [ 0, 1, 2 ]
    }) : (args.unshift(bin), proc = spawn(process.execPath, args, {
      stdio: "inherit"
    }));
    [ "SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP" ].forEach((function(signal) {
      process.on(signal, (function() {
        !1 === proc.killed && null === proc.exitCode && proc.kill(signal);
      }));
    })), proc.on("close", process.exit.bind(process)), proc.on("error", (function(err) {
      "ENOENT" === err.code ? console.error("error: %s(1) does not exist, try --help", bin) : "EACCES" === err.code && console.error("error: %s(1) not executable. try chmod or run with root", bin), 
      process.exit(1);
    })), this.runningCommand = proc;
  }, Command.prototype.normalize = function(args) {
    for (var arg, lastOpt, index, ret = [], i = 0, len = args.length; i < len; ++i) {
      if (arg = args[i], i > 0 && (lastOpt = this.optionFor(args[i - 1])), "--" === arg) {
        ret = ret.concat(args.slice(i));
        break;
      }
      lastOpt && lastOpt.required ? ret.push(arg) : arg.length > 1 && "-" === arg[0] && "-" !== arg[1] ? arg.slice(1).split("").forEach((function(c) {
        ret.push("-" + c);
      })) : /^--/.test(arg) && ~(index = arg.indexOf("=")) ? ret.push(arg.slice(0, index), arg.slice(index + 1)) : ret.push(arg);
    }
    return ret;
  }, Command.prototype.parseArgs = function(args, unknown) {
    var name;
    return args.length ? (name = args[0], this.listeners("command:" + name).length ? this.emit("command:" + args.shift(), args, unknown) : this.emit("command:*", args)) : (outputHelpIfNecessary(this, unknown), 
    unknown.length > 0 && this.unknownOption(unknown[0]), 0 === this.commands.length && 0 === this._args.filter((function(a) {
      return a.required;
    })).length && this.emit("command:*")), this;
  }, Command.prototype.optionFor = function(arg) {
    for (var i = 0, len = this.options.length; i < len; ++i) if (this.options[i].is(arg)) return this.options[i];
  }, Command.prototype.parseOptions = function(argv) {
    for (var literal, option, arg, args = [], len = argv.length, unknownOptions = [], i = 0; i < len; ++i) if (arg = argv[i], 
    literal) args.push(arg); else if ("--" !== arg) if (option = this.optionFor(arg)) if (option.required) {
      if (null == (arg = argv[++i])) return this.optionMissingArgument(option);
      this.emit("option:" + option.name(), arg);
    } else option.optional ? (null == (arg = argv[i + 1]) || "-" === arg[0] && "-" !== arg ? arg = null : ++i, 
    this.emit("option:" + option.name(), arg)) : this.emit("option:" + option.name()); else arg.length > 1 && "-" === arg[0] ? (unknownOptions.push(arg), 
    i + 1 < argv.length && "-" !== argv[i + 1][0] && unknownOptions.push(argv[++i])) : args.push(arg); else literal = !0;
    return {
      args: args,
      unknown: unknownOptions
    };
  }, Command.prototype.opts = function() {
    for (var result = {}, len = this.options.length, i = 0; i < len; i++) {
      var key = this.options[i].attributeName();
      result[key] = key === this._versionOptionName ? this._version : this[key];
    }
    return result;
  }, Command.prototype.missingArgument = function(name) {
    console.error("error: missing required argument `%s'", name), process.exit(1);
  }, Command.prototype.optionMissingArgument = function(option, flag) {
    flag ? console.error("error: option `%s' argument missing, got `%s'", option.flags, flag) : console.error("error: option `%s' argument missing", option.flags), 
    process.exit(1);
  }, Command.prototype.unknownOption = function(flag) {
    this._allowUnknownOption || (console.error("error: unknown option `%s'", flag), 
    process.exit(1));
  }, Command.prototype.variadicArgNotLast = function(name) {
    console.error("error: variadic arguments must be last `%s'", name), process.exit(1);
  }, Command.prototype.version = function(str, flags) {
    if (0 === arguments.length) return this._version;
    this._version = str;
    var versionOption = new Option(flags = flags || "-V, --version", "output the version number");
    return this._versionOptionName = versionOption.long.substr(2) || "version", this.options.push(versionOption), 
    this.on("option:" + this._versionOptionName, (function() {
      process.stdout.write(str + "\n"), process.exit(0);
    })), this;
  }, Command.prototype.description = function(str, argsDescription) {
    return 0 === arguments.length ? this._description : (this._description = str, this._argsDescription = argsDescription, 
    this);
  }, Command.prototype.alias = function(alias) {
    var command = this;
    if (0 !== this.commands.length && (command = this.commands[this.commands.length - 1]), 
    0 === arguments.length) return command._alias;
    if (alias === command._name) throw new Error("Command alias can't be the same as its name");
    return command._alias = alias, this;
  }, Command.prototype.usage = function(str) {
    var args = this._args.map((function(arg) {
      return humanReadableArgName(arg);
    })), usage = "[options]" + (this.commands.length ? " [command]" : "") + (this._args.length ? " " + args.join(" ") : "");
    return 0 === arguments.length ? this._usage || usage : (this._usage = str, this);
  }, Command.prototype.name = function(str) {
    return 0 === arguments.length ? this._name : (this._name = str, this);
  }, Command.prototype.prepareCommands = function() {
    return this.commands.filter((function(cmd) {
      return !cmd._noHelp;
    })).map((function(cmd) {
      var args = cmd._args.map((function(arg) {
        return humanReadableArgName(arg);
      })).join(" ");
      return [ cmd._name + (cmd._alias ? "|" + cmd._alias : "") + (cmd.options.length ? " [options]" : "") + (args ? " " + args : ""), cmd._description ];
    }));
  }, Command.prototype.largestCommandLength = function() {
    return this.prepareCommands().reduce((function(max, command) {
      return Math.max(max, command[0].length);
    }), 0);
  }, Command.prototype.largestOptionLength = function() {
    var options = [].slice.call(this.options);
    return options.push({
      flags: "-h, --help"
    }), options.reduce((function(max, option) {
      return Math.max(max, option.flags.length);
    }), 0);
  }, Command.prototype.largestArgLength = function() {
    return this._args.reduce((function(max, arg) {
      return Math.max(max, arg.name.length);
    }), 0);
  }, Command.prototype.padWidth = function() {
    var width = this.largestOptionLength();
    return this._argsDescription && this._args.length && this.largestArgLength() > width && (width = this.largestArgLength()), 
    this.commands && this.commands.length && this.largestCommandLength() > width && (width = this.largestCommandLength()), 
    width;
  }, Command.prototype.optionHelp = function() {
    var width = this.padWidth();
    return this.options.map((function(option) {
      return pad(option.flags, width) + "  " + option.description + (option.bool && void 0 !== option.defaultValue ? " (default: " + JSON.stringify(option.defaultValue) + ")" : "");
    })).concat([ pad("-h, --help", width) + "  output usage information" ]).join("\n");
  }, Command.prototype.commandHelp = function() {
    if (!this.commands.length) return "";
    var commands = this.prepareCommands(), width = this.padWidth();
    return [ "Commands:", commands.map((function(cmd) {
      var desc = cmd[1] ? "  " + cmd[1] : "";
      return (desc ? pad(cmd[0], width) : cmd[0]) + desc;
    })).join("\n").replace(/^/gm, "  "), "" ].join("\n");
  }, Command.prototype.helpInformation = function() {
    var desc = [];
    if (this._description) {
      desc = [ this._description, "" ];
      var argsDescription = this._argsDescription;
      if (argsDescription && this._args.length) {
        var width = this.padWidth();
        desc.push("Arguments:"), desc.push(""), this._args.forEach((function(arg) {
          desc.push("  " + pad(arg.name, width) + "  " + argsDescription[arg.name]);
        })), desc.push("");
      }
    }
    var cmdName = this._name;
    this._alias && (cmdName = cmdName + "|" + this._alias);
    var usage = [ "Usage: " + cmdName + " " + this.usage(), "" ], cmds = [], commandHelp = this.commandHelp();
    commandHelp && (cmds = [ commandHelp ]);
    var options = [ "Options:", "" + this.optionHelp().replace(/^/gm, "  "), "" ];
    return usage.concat(desc).concat(options).concat(cmds).join("\n");
  }, Command.prototype.outputHelp = function(cb) {
    cb || (cb = function(passthru) {
      return passthru;
    }), process.stdout.write(cb(this.helpInformation())), this.emit("--help");
  }, Command.prototype.help = function(cb) {
    this.outputHelp(cb), process.exit();
  };
}, function(module) {
  module.exports = JSON.parse('{"a":"1.0.2"}');
}, function(module, exports) {
  module.exports = require("./index");
}, function(module, __webpack_exports__, __webpack_require__) {
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0), fs__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__), commander__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1), commander__WEBPACK_IMPORTED_MODULE_1___default = __webpack_require__.n(commander__WEBPACK_IMPORTED_MODULE_1__), _package_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2), _index__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3);
  commander__WEBPACK_IMPORTED_MODULE_1___default.a.version(_package_json__WEBPACK_IMPORTED_MODULE_2__.a, "-v, --version").usage("[options] [yarn.lock path (default: yarn.lock)]").option("-x, --exclude <exclude>", 'a RegExp pattern of packages not to upgrade (e.g. "^@babel")', val => new RegExp(val)).option("-p, --print", "instead of saving the updated yarn.lock, print the result in console");
  const program = commander__WEBPACK_IMPORTED_MODULE_1___default.a.parse(process.argv), file = program.args.length ? program.args[0] : "yarn.lock";
  try {
    const yarnLock = fs__WEBPACK_IMPORTED_MODULE_0___default.a.readFileSync(file, "utf8"), updatedYarnLock = Object(_index__WEBPACK_IMPORTED_MODULE_3__.updatePackages)(yarnLock, program.exclude);
    program.print ? console.log(updatedYarnLock) : updatedYarnLock !== yarnLock && fs__WEBPACK_IMPORTED_MODULE_0___default.a.writeFileSync(file, updatedYarnLock), 
    process.exitCode = 0;
  } catch (e) {
    console.error(e), process.exitCode = -1;
  }
}, function(module, exports) {
  module.exports = require("events");
}, function(module, exports) {
  module.exports = require("child_process");
}, function(module, exports) {
  module.exports = require("path");
}, function(module, exports) {
  module.exports = require("util");
} ]);