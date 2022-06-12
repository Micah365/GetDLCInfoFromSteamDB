// ==UserScript==
// @name          Get Data from Steam / SteamDB
// @namespace     sak32009-gaxvyvrguokgtog
// @description   Get Data from Steam / SteamDB (ex Get DLC Info from SteamDB) it’s a userscript able to extract all the information of the dlcs games from Steam / SteamDB and are exported in various formats.
// @author        Sak32009
// @version       4.4.3
// @license       MIT
// @homepageURL   https://github.com/Sak32009/GetDLCInfoFromSteamDB/
// @supportURL    https://github.com/Sak32009/GetDLCInfoFromSteamDB/issues/
// @updateURL     https://raw.githack.com/Sak32009/GetDLCInfoFromSteamDB/master/sak32009-get-dlc-info-from-steamdb.user.js
// @downloadURL   https://raw.githack.com/Sak32009/GetDLCInfoFromSteamDB/master/sak32009-get-dlc-info-from-steamdb.user.js
// @icon          https://raw.githack.com/Sak32009/GetDLCInfoFromSteamDB/master/src/icon.png
// @require       https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.slim.min.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.2.0-beta1/js/bootstrap.min.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js
// @match         *://steamdb.info/app/*
// @match         *://steamdb.info/depot/*
// @match         *://store.steampowered.com/app/*
// @run-at        document-end
// @grant         unsafeWindow
// @grant         GM_addStyle
// ==/UserScript==
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a2, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a2, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a2, prop, b[prop]);
    }
  return a2;
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */
var objectToString = Object.prototype.toString;
var isArray = Array.isArray || function isArrayPolyfill(object) {
  return objectToString.call(object) === "[object Array]";
};
function isFunction(object) {
  return typeof object === "function";
}
function typeStr(obj) {
  return isArray(obj) ? "array" : typeof obj;
}
function escapeRegExp(string) {
  return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}
function hasProperty(obj, propName) {
  return obj != null && typeof obj === "object" && propName in obj;
}
function primitiveHasOwnProperty(primitive, propName) {
  return primitive != null && typeof primitive !== "object" && primitive.hasOwnProperty && primitive.hasOwnProperty(propName);
}
var regExpTest = RegExp.prototype.test;
function testRegExp(re, string) {
  return regExpTest.call(re, string);
}
var nonSpaceRe = /\S/;
function isWhitespace(string) {
  return !testRegExp(nonSpaceRe, string);
}
var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;"
};
function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
    return entityMap[s];
  });
}
var whiteRe = /\s*/;
var spaceRe = /\s+/;
var equalsRe = /\s*=/;
var curlyRe = /\s*\}/;
var tagRe = /#|\^|\/|>|\{|&|=|!/;
function parseTemplate(template, tags) {
  if (!template)
    return [];
  var lineHasNonSpace = false;
  var sections = [];
  var tokens = [];
  var spaces = [];
  var hasTag = false;
  var nonSpace = false;
  var indentation = "";
  var tagIndex = 0;
  function stripSpace() {
    if (hasTag && !nonSpace) {
      while (spaces.length)
        delete tokens[spaces.pop()];
    } else {
      spaces = [];
    }
    hasTag = false;
    nonSpace = false;
  }
  var openingTagRe, closingTagRe, closingCurlyRe;
  function compileTags(tagsToCompile) {
    if (typeof tagsToCompile === "string")
      tagsToCompile = tagsToCompile.split(spaceRe, 2);
    if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
      throw new Error("Invalid tags: " + tagsToCompile);
    openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + "\\s*");
    closingTagRe = new RegExp("\\s*" + escapeRegExp(tagsToCompile[1]));
    closingCurlyRe = new RegExp("\\s*" + escapeRegExp("}" + tagsToCompile[1]));
  }
  compileTags(tags || mustache.tags);
  var scanner = new Scanner(template);
  var start, type, value, chr, token, openSection;
  while (!scanner.eos()) {
    start = scanner.pos;
    value = scanner.scanUntil(openingTagRe);
    if (value) {
      for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
        chr = value.charAt(i);
        if (isWhitespace(chr)) {
          spaces.push(tokens.length);
          indentation += chr;
        } else {
          nonSpace = true;
          lineHasNonSpace = true;
          indentation += " ";
        }
        tokens.push(["text", chr, start, start + 1]);
        start += 1;
        if (chr === "\n") {
          stripSpace();
          indentation = "";
          tagIndex = 0;
          lineHasNonSpace = false;
        }
      }
    }
    if (!scanner.scan(openingTagRe))
      break;
    hasTag = true;
    type = scanner.scan(tagRe) || "name";
    scanner.scan(whiteRe);
    if (type === "=") {
      value = scanner.scanUntil(equalsRe);
      scanner.scan(equalsRe);
      scanner.scanUntil(closingTagRe);
    } else if (type === "{") {
      value = scanner.scanUntil(closingCurlyRe);
      scanner.scan(curlyRe);
      scanner.scanUntil(closingTagRe);
      type = "&";
    } else {
      value = scanner.scanUntil(closingTagRe);
    }
    if (!scanner.scan(closingTagRe))
      throw new Error("Unclosed tag at " + scanner.pos);
    if (type == ">") {
      token = [type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace];
    } else {
      token = [type, value, start, scanner.pos];
    }
    tagIndex++;
    tokens.push(token);
    if (type === "#" || type === "^") {
      sections.push(token);
    } else if (type === "/") {
      openSection = sections.pop();
      if (!openSection)
        throw new Error('Unopened section "' + value + '" at ' + start);
      if (openSection[1] !== value)
        throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
    } else if (type === "name" || type === "{" || type === "&") {
      nonSpace = true;
    } else if (type === "=") {
      compileTags(value);
    }
  }
  stripSpace();
  openSection = sections.pop();
  if (openSection)
    throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
  return nestTokens(squashTokens(tokens));
}
function squashTokens(tokens) {
  var squashedTokens = [];
  var token, lastToken;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    token = tokens[i];
    if (token) {
      if (token[0] === "text" && lastToken && lastToken[0] === "text") {
        lastToken[1] += token[1];
        lastToken[3] = token[3];
      } else {
        squashedTokens.push(token);
        lastToken = token;
      }
    }
  }
  return squashedTokens;
}
function nestTokens(tokens) {
  var nestedTokens = [];
  var collector = nestedTokens;
  var sections = [];
  var token, section;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    token = tokens[i];
    switch (token[0]) {
      case "#":
      case "^":
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case "/":
        section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
    }
  }
  return nestedTokens;
}
function Scanner(string) {
  this.string = string;
  this.tail = string;
  this.pos = 0;
}
Scanner.prototype.eos = function eos() {
  return this.tail === "";
};
Scanner.prototype.scan = function scan(re) {
  var match = this.tail.match(re);
  if (!match || match.index !== 0)
    return "";
  var string = match[0];
  this.tail = this.tail.substring(string.length);
  this.pos += string.length;
  return string;
};
Scanner.prototype.scanUntil = function scanUntil(re) {
  var index = this.tail.search(re), match;
  switch (index) {
    case -1:
      match = this.tail;
      this.tail = "";
      break;
    case 0:
      match = "";
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
  }
  this.pos += match.length;
  return match;
};
function Context(view, parentContext) {
  this.view = view;
  this.cache = { ".": this.view };
  this.parent = parentContext;
}
Context.prototype.push = function push(view) {
  return new Context(view, this);
};
Context.prototype.lookup = function lookup(name2) {
  var cache = this.cache;
  var value;
  if (cache.hasOwnProperty(name2)) {
    value = cache[name2];
  } else {
    var context = this, intermediateValue, names, index, lookupHit = false;
    while (context) {
      if (name2.indexOf(".") > 0) {
        intermediateValue = context.view;
        names = name2.split(".");
        index = 0;
        while (intermediateValue != null && index < names.length) {
          if (index === names.length - 1)
            lookupHit = hasProperty(intermediateValue, names[index]) || primitiveHasOwnProperty(intermediateValue, names[index]);
          intermediateValue = intermediateValue[names[index++]];
        }
      } else {
        intermediateValue = context.view[name2];
        lookupHit = hasProperty(context.view, name2);
      }
      if (lookupHit) {
        value = intermediateValue;
        break;
      }
      context = context.parent;
    }
    cache[name2] = value;
  }
  if (isFunction(value))
    value = value.call(this.view);
  return value;
};
function Writer() {
  this.templateCache = {
    _cache: {},
    set: function set(key, value) {
      this._cache[key] = value;
    },
    get: function get(key) {
      return this._cache[key];
    },
    clear: function clear() {
      this._cache = {};
    }
  };
}
Writer.prototype.clearCache = function clearCache() {
  if (typeof this.templateCache !== "undefined") {
    this.templateCache.clear();
  }
};
Writer.prototype.parse = function parse(template, tags) {
  var cache = this.templateCache;
  var cacheKey = template + ":" + (tags || mustache.tags).join(":");
  var isCacheEnabled = typeof cache !== "undefined";
  var tokens = isCacheEnabled ? cache.get(cacheKey) : void 0;
  if (tokens == void 0) {
    tokens = parseTemplate(template, tags);
    isCacheEnabled && cache.set(cacheKey, tokens);
  }
  return tokens;
};
Writer.prototype.render = function render(template, view, partials, config) {
  var tags = this.getConfigTags(config);
  var tokens = this.parse(template, tags);
  var context = view instanceof Context ? view : new Context(view, void 0);
  return this.renderTokens(tokens, context, partials, template, config);
};
Writer.prototype.renderTokens = function renderTokens(tokens, context, partials, originalTemplate, config) {
  var buffer = "";
  var token, symbol, value;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    value = void 0;
    token = tokens[i];
    symbol = token[0];
    if (symbol === "#")
      value = this.renderSection(token, context, partials, originalTemplate, config);
    else if (symbol === "^")
      value = this.renderInverted(token, context, partials, originalTemplate, config);
    else if (symbol === ">")
      value = this.renderPartial(token, context, partials, config);
    else if (symbol === "&")
      value = this.unescapedValue(token, context);
    else if (symbol === "name")
      value = this.escapedValue(token, context, config);
    else if (symbol === "text")
      value = this.rawValue(token);
    if (value !== void 0)
      buffer += value;
  }
  return buffer;
};
Writer.prototype.renderSection = function renderSection(token, context, partials, originalTemplate, config) {
  var self = this;
  var buffer = "";
  var value = context.lookup(token[1]);
  function subRender(template) {
    return self.render(template, context, partials, config);
  }
  if (!value)
    return;
  if (isArray(value)) {
    for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
      buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate, config);
    }
  } else if (typeof value === "object" || typeof value === "string" || typeof value === "number") {
    buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate, config);
  } else if (isFunction(value)) {
    if (typeof originalTemplate !== "string")
      throw new Error("Cannot use higher-order sections without the original template");
    value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);
    if (value != null)
      buffer += value;
  } else {
    buffer += this.renderTokens(token[4], context, partials, originalTemplate, config);
  }
  return buffer;
};
Writer.prototype.renderInverted = function renderInverted(token, context, partials, originalTemplate, config) {
  var value = context.lookup(token[1]);
  if (!value || isArray(value) && value.length === 0)
    return this.renderTokens(token[4], context, partials, originalTemplate, config);
};
Writer.prototype.indentPartial = function indentPartial(partial, indentation, lineHasNonSpace) {
  var filteredIndentation = indentation.replace(/[^ \t]/g, "");
  var partialByNl = partial.split("\n");
  for (var i = 0; i < partialByNl.length; i++) {
    if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
      partialByNl[i] = filteredIndentation + partialByNl[i];
    }
  }
  return partialByNl.join("\n");
};
Writer.prototype.renderPartial = function renderPartial(token, context, partials, config) {
  if (!partials)
    return;
  var tags = this.getConfigTags(config);
  var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
  if (value != null) {
    var lineHasNonSpace = token[6];
    var tagIndex = token[5];
    var indentation = token[4];
    var indentedValue = value;
    if (tagIndex == 0 && indentation) {
      indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
    }
    var tokens = this.parse(indentedValue, tags);
    return this.renderTokens(tokens, context, partials, indentedValue, config);
  }
};
Writer.prototype.unescapedValue = function unescapedValue(token, context) {
  var value = context.lookup(token[1]);
  if (value != null)
    return value;
};
Writer.prototype.escapedValue = function escapedValue(token, context, config) {
  var escape = this.getConfigEscape(config) || mustache.escape;
  var value = context.lookup(token[1]);
  if (value != null)
    return typeof value === "number" && escape === mustache.escape ? String(value) : escape(value);
};
Writer.prototype.rawValue = function rawValue(token) {
  return token[1];
};
Writer.prototype.getConfigTags = function getConfigTags(config) {
  if (isArray(config)) {
    return config;
  } else if (config && typeof config === "object") {
    return config.tags;
  } else {
    return void 0;
  }
};
Writer.prototype.getConfigEscape = function getConfigEscape(config) {
  if (config && typeof config === "object" && !isArray(config)) {
    return config.escape;
  } else {
    return void 0;
  }
};
var mustache = {
  name: "mustache.js",
  version: "4.2.0",
  tags: ["{{", "}}"],
  clearCache: void 0,
  escape: void 0,
  parse: void 0,
  render: void 0,
  Scanner: void 0,
  Context: void 0,
  Writer: void 0,
  set templateCache(cache) {
    defaultWriter.templateCache = cache;
  },
  get templateCache() {
    return defaultWriter.templateCache;
  }
};
var defaultWriter = new Writer();
mustache.clearCache = function clearCache2() {
  return defaultWriter.clearCache();
};
mustache.parse = function parse2(template, tags) {
  return defaultWriter.parse(template, tags);
};
mustache.render = function render2(template, view, partials, config) {
  if (typeof template !== "string") {
    throw new TypeError('Invalid template! Template should be a "string" but "' + typeStr(template) + '" was given as the first argument for mustache#render(template, view, partials)');
  }
  return defaultWriter.render(template, view, partials, config);
};
mustache.escape = escapeHtml;
mustache.Scanner = Scanner;
mustache.Context = Context;
mustache.Writer = Writer;
const name = "sak32009-gaxvyvrguokgtog";
const productName = "Get Data from Steam / SteamDB";
const version = "4.4.3";
const year = "2016 - 2022";
const author = {
  name: "Sak32009",
  url: "https://sak32009.github.io/"
};
var appIdAppIdName = "[dlcs]{dlcId} = {dlcName}\r\n[/dlcs]\r\n";
var appIdName = "[dlcs]{dlcName}\r\n[/dlcs]\r\n";
var codexDlcFiveZeroDlcName = '[dlcs prefix="5"]DLC{dlcIndex} = {dlcId}\r\nDLCName{dlcIndex} = {dlcName}\r\n[/dlcs]\r\n';
var creamApi3410 = `[steam]\r
; Application ID (http://store.steampowered.com/app/%appid%/)\r
appid = [data]appId[/data]\r
; Current game language.\r
; Uncomment this option to turn it on.\r
; Default is "english".\r
;language = german\r
; Enable/disable automatic DLC unlock. Default option is set to "false".\r
; Keep in mind that this option is highly experimental and won't\r
; work if the game wants to call each DLC by index.\r
unlockall = false\r
; Original Valve's steam_api.dll.\r
; Default is "steam_api_o.dll".\r
orgapi = steam_api_o.dll\r
; Original Valve's steam_api64.dll.\r
; Default is "steam_api64_o.dll".\r
orgapi64 = steam_api64_o.dll\r
; Enable/disable extra protection bypasser.\r
; Default is "false".\r
extraprotection = false\r
; The game will think that you're offline (supported by some games).\r
; Default is "false".\r
forceoffline = false\r
; Some games are checking for the low violence presence.\r
; Default is "false".\r
;lowviolence = true\r
; Installation path for the game.\r
; Note, that you can use ..\\\\ to set the parent directory (from where executable file is located).\r
; Maximum number of parent directories: 5 (..\\\\..\\\\..\\\\..\\\\..\\\\)\r
; Default is the path to current working directory.\r
;installdir = ..\\\\\r
; Use DLC id as the appended installation directory.\r
; e.g. <install_directory>\\\\480\r
; Default is "true".\r
;dlcasinstalldir = false\r
; Purchase timestamp for the DLC (http://www.onlineconversion.com/unix_time.htm).\r
; Default is "0" (1970/01/01).\r
;purchasetimestamp = 0\r
; Turn on the wrapper mode.\r
; Default is "false".\r
wrappermode = false\r
\r
[steam_misc]\r
; Disables the internal SteamUser interface handler.\r
; Does have an effect on the games that are using the license check for the DLC/application.\r
; Default is "false".\r
disableuserinterface = false\r
; Disables the internal SteamUtils interface handler.\r
; Does have an effect on the games that are checking for the actual AppId (only matters when "wrappermode" is set to "true").\r
; Default is "false".\r
disableutilsinterface = false\r
; Disable the internal reserve hook of the "Steam_RegisterInterfaceFuncs" function.\r
; Default is "false".\r
disableregisterinterfacefuncs = false\r
; Unlock/Lock Steam parental restrictions.\r
; Default is "true".\r
;unlockparentalrestrictions = false\r
; SteamId64 to override. Note that this action could be risky !\r
; This option can only work if "disableuserinterface = false".\r
;steamid = 0\r
; Bypass VAC signature check. Note that this action could be risky !\r
; Default is "false".\r
;signaturebypass = true\r
\r
[steam_wrapper]\r
; Application ID to override (used when the wrapper mode is on)\r
newappid = 0\r
; Use the internal storage system.\r
; Default is "false".\r
wrapperremotestorage = false\r
; Use the internal stats/achievements system.\r
; Default is "false".\r
wrapperuserstats = false\r
; Use the internal workshop (UGC) system.\r
; Default is "false".\r
wrapperugc = false\r
; Store the data in the current directory (incl. stats)\r
; By default the data is stored at: %appdata%/CreamAPI/%appid%/\r
; Default is "false".\r
saveindirectory = false\r
; Force the usage of a full save path instead of the relative one.\r
; Default is "false".\r
forcefullsavepath = false\r
; Disable internal callbacks system.\r
; Default is "false".\r
;disablecallbacks = true\r
; Disable/Enable a StoreStats callback. Takes effect only if "wrapperuserstats" is set to "true".\r
; Default is "true".\r
;storestatscallback = false\r
; Fixed achievements count.\r
; Some games can only work if this option is configured properly (e.g. Wolfenstein II).\r
; Default is "0".\r
achievementscount = 0\r
\r
[dlc]\r
; DLC handling.\r
; Format: <dlc_id> = <dlc_description>\r
; e.g. : 247295 = Saints Row IV - GAT V Pack\r
; If the DLC is not specified in this section\r
; then it won't be unlocked\r
[dlcs]{dlcId} = {dlcName}\r
[/dlcs]\r
\r
[dlc_installdirs]\r
; Installation path for the specific DLC (dependent from "installdir" option).\r
; This section works only if "dlcasinstalldir" option is set to "false".\r
; Format: <dlc_id> = <install_dir>\r
; e.g. : 556760 = DLCRoot0\r
\r
[steam_ugc]\r
; Subscribed workshop items.\r
; This section works only if "wrappermode" and "wrapperugc" options are set to "true".\r
; Format: <dlc_id> = <true/false>\r
; e.g. : 812713531 = true\r
; Please refer to __README_WORKSHOP_EN__.txt for more details.\r
`;
var creamApi4500 = `[steam]\r
; Application ID (http://store.steampowered.com/app/%appid%/)\r
appid = [data]appId[/data]\r
; Current game language.\r
; Uncomment this option to turn it on.\r
; Default is "english".\r
;language = german\r
; Enable/disable automatic DLC unlock. Default option is set to "false".\r
; Keep in mind that this option  WON'T work properly if the "[dlc]" section is NOT empty\r
unlockall = false\r
; Original Valve's steam_api.dll.\r
; Default is "steam_api_o.dll".\r
orgapi = steam_api_o.dll\r
; Original Valve's steam_api64.dll.\r
; Default is "steam_api64_o.dll".\r
orgapi64 = steam_api64_o.dll\r
; Enable/disable extra protection bypasser.\r
; Default is "false".\r
extraprotection = false\r
; The game will think that you're offline (supported by some games).\r
; Default is "false".\r
forceoffline = false\r
; Some games are checking for the low violence presence.\r
; Default is "false".\r
;lowviolence = true\r
; Purchase timestamp for the DLC (http://www.onlineconversion.com/unix_time.htm).\r
; Default is "0" (1970/01/01).\r
;purchasetimestamp = 0\r
\r
[steam_misc]\r
; Disables the internal SteamUser interface handler.\r
; Does have an effect on the games that are using the license check for the DLC/application.\r
; Default is "false".\r
disableuserinterface = false\r
\r
[dlc]\r
; DLC handling.\r
; Format: <dlc_id> = <dlc_description>\r
; e.g. : 247295 = Saints Row IV - GAT V Pack\r
; If the DLC is not specified in this section\r
; then it won't be unlocked\r
[dlcs]{dlcId} = {dlcName}\r
[/dlcs]\r
`;
var greenLumaTwoZeroTwoZeroBatchMode = '@ECHO OFF\r\n:: WINDOWS WORKING DIR BUG WORKAROUND\r\nCD /D "%~dp0"\r\n:: CHECK APPLIST DIR\r\nIF EXIST .\\\\AppList RMDIR /S /Q .\\\\AppList\r\n:: CREATE APPLIST DIR\r\nMKDIR .\\\\AppList\r\n:: CREATE DLCS FILES FOR __[data]name[/data]__\r\nECHO [data]appId[/data]> .\\\\AppList\\\\0.txt\r\n[dlcs]:: {dlcName}\r\nECHO {dlcId}> .\\\\AppList\\\\{dlcIndex}.txt\r\n[/dlcs]\r\n:: START GREENLUMA 2020\r\nIF EXIST .\\\\DLLInjector.exe GOTO :Q\r\nGOTO :EXIT\r\n:Q\r\nSET /P c=Do you want to start GreenLuma 2020 [Y/N]?\r\nIF /I "%c%" EQU "Y" GOTO :START\r\nIF /I "%c%" EQU "N" GOTO :EXIT\r\nGOTO :Q\r\n:START\r\nCLS\r\nECHO Launching Greenluma 2020 - APPID [data]appId[/data] - APPNAME [data]name[/data]\r\nTASKKILL /F /IM steam.exe\r\nTIMEOUT /T 2\r\nDLLInjector.exe -DisablePreferSystem32Images\r\n:EXIT\r\nEXIT\r\n';
var lumaEmuOnlyDlcsList = "[dlcs]; {dlcName}\r\nDLC_{dlcId} = 1\r\n[/dlcs]\r\n";
var skidrowOnlyDlcsList = "[dlcs]; {dlcName}\r\n{dlcId}\r\n[/dlcs]\r\n";
var threeDmGameOnlyDlcsList = '[dlcs fromZero prefix="3"]; {dlcName}\r\nDLC{dlcIndex} = {dlcId}\r\n[/dlcs]\r\n';
var greenLuma2020ManagerBlueAmulet = '[\r\n  [dlcs]{\r\n    "id": "{dlcId}",\r\n    "name": "{dlcName}",\r\n    "type": "DLC"\r\n  },\r\n[/dlcs]]\r\n';
const data = {
  creamApi4500: {
    name: "CreamAPI v4.5.0.0",
    file: {
      name: "cream_api.ini",
      text: creamApi4500
    }
  },
  creamApi3410: {
    name: "CreamAPI v3.4.1.0",
    file: {
      name: "cream_api.ini",
      text: creamApi3410
    }
  },
  greenLuma2020BatchMode: {
    name: "GreenLuma 2020 [BATCH MODE]",
    file: {
      name: "[data]appId[/data]_GreenLuma_2020.bat",
      text: greenLumaTwoZeroTwoZeroBatchMode
    }
  },
  greenLuma2020ManagerBlueAmulet: {
    name: "GreenLuma 2020 Manager [BlueAmulet]",
    file: {
      name: "[data]appId[/data]_GreenLuma_2020_Manager_BlueAmulet.json",
      text: greenLuma2020ManagerBlueAmulet
    }
  },
  lumaEmuOnlyDlcsList: {
    name: "LUMAEMU (ONLY DLCS LIST)",
    file: {
      name: "[data]appId[/data]_lumaemu.ini",
      text: lumaEmuOnlyDlcsList
    }
  },
  codexDlc00000DlcName: {
    name: "CODEX (DLC00000 = DLCName)",
    file: {
      name: "[data]appId[/data]_codex.ini",
      text: codexDlcFiveZeroDlcName
    }
  },
  threeDmGameOnlyDlcsList: {
    name: "3DMGAME (ONLY DLCS LIST)",
    file: {
      name: "[data]appId[/data]_3dmgame.ini",
      text: threeDmGameOnlyDlcsList
    }
  },
  skidrowOnlyDlcsList: {
    name: "SKIDROW (ONLY DLCS LIST)",
    file: {
      name: "[data]appId[/data]_skidrow.ini",
      text: skidrowOnlyDlcsList
    }
  },
  appIdAppIdName: {
    name: "APPID = APPIDNAME",
    file: {
      name: "[data]appId[/data]_appid_appidname.ini",
      text: appIdAppIdName
    }
  },
  appIdName: {
    name: "APPIDNAME",
    file: {
      name: "[data]appId[/data]_appidname.ini",
      text: appIdName
    }
  }
};
var skModalHtml = `<div class="sak32009">\r
  <div class="modal fade" id="{{packageName}}">\r
    <div class="modal-dialog modal-dialog-centered modal-lg">\r
      <div class="modal-content text-bg-dark">\r
        <div class="modal-header flex-column border-secondary">\r
          <div class="modal-header-logo">\r
            <img src="{{skAuthorIcon}}" alt="{{packageProductName}}" />\r
          </div>\r
          <h5 class="text-center">{{&titleScript}}</h5>\r
          <h6>\r
            <a target="_blank" href="https://github.com/Sak32009/SteamLauncher">\r
              check my new project, @SteamLauncher.\r
            </a>\r
          </h6>\r
        </div>\r
        <div class="modal-body p-0">\r
          {{^isAllowedUrls.steamdbDepot}}\r
          <div class="input-group p-2 border-bottom border-secondary">\r
            <select id="sake_select" class="form-select text-bg-dark border-secondary">\r
              {{#skSelect}}\r
              <option value="{{@key}}">{{@val.name}}</option>\r
              {{/skSelect}}\r
            </select>\r
            <button id="sake_convert" type="button" class="btn btn-dark border-secondary">Convert</button>\r
            <label\r
              class="btn btn-dark border-secondary {{^isAllowedUrls.steamdbApp}}d-none{{/isAllowedUrls.steamdbApp}}"\r
              for="sake_unknowns"\r
            >\r
              <input class="form-check-input" type="checkbox" id="sake_unknowns" />\r
              <span>With DLCS Unknowns</span>\r
            </label>\r
            <a id="sake_download" href="#" class="btn btn-dark border-secondary disabled">Download as file</a>\r
          </div>\r
          <div class="m-2 position-relative">\r
            <textarea\r
              id="sake_textarea"\r
              class="form-control resize-none text-bg-dark border-secondary"\r
              rows="14"\r
              placeholder="Select an option and click 'Convert'"\r
              readonly\r
            ></textarea>\r
            <div class="d-flex flex-row justify-content-end m-2 position-absolute bottom-0 end-0">\r
              <div class="me-1">DLCs: {{extractedData.countDlcs}}</div>\r
              <div class="me-1">|</div>\r
              {{#isAllowedUrls.steamdbApp}}\r
              <div class="me-1">DLCs Unknown: {{extractedData.countDlcsUnknowns}}</div>\r
              <div class="me-1">|</div>\r
              {{/isAllowedUrls.steamdbApp}}\r
              <div>Total DLCs: {{extractedData.countAll}}</div>\r
            </div>\r
          </div>\r
          {{/isAllowedUrls.steamdbDepot}} {{#isAllowedUrls.steamdbDepot}}\r
          <div class="d-flex flex-row justify-content-end m-2">\r
            <a id="sake_download" href="#" class="btn btn-dark border border-secondary">Download as file</a>\r
          </div>\r
          <div class="m-2">\r
            <textarea\r
              id="sake_textarea"\r
              class="form-control resize-none bg-dark text-white border-secondary"\r
              readonly\r
              rows="14"\r
            ></textarea>\r
          </div>\r
          {{/isAllowedUrls.steamdbDepot}}\r
        </div>\r
        <div class="modal-footer flex-column border-secondary">\r
          <h6><strong>Protect</strong> development and free things,<br />because their survival is in our hands.</h6>\r
          <p>\r
            You can donate by clicking on\r
            <a target="_blank" href="https://www.paypal.me/sak32009a">paypal.me</a>.\r
          </p>\r
        </div>\r
      </div>\r
    </div>\r
  </div>\r
</div>\r
`;
var skAuthorIcon = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUxMiA1MTIiIGhlaWdodD0iNTEycHgiIGlkPSJHcmltX3g1Rl9SZWFwZXIiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTJweCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGxpbmVhckdyYWRpZW50IGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBpZD0iU1ZHSURfMV8iIHgxPSIyNTYiIHgyPSIyNTYiIHkxPSI5NC4xODYiIHkyPSI3MTkuODA1NyI+PHN0b3Agb2Zmc2V0PSIwLjAxMDMiIHN0eWxlPSJzdG9wLWNvbG9yOiNCNzg1OEYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiM4RTU0NUMiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGQ9Ik0xNDAuNjgyLDIzOC4wNTRjMCwwLDEuOTA2LTk1LjI5Miw0Ljc2NS0xMjQuODMyYzIuODU4LTI5LjU0LDI1LjcyOS0xMDMuODY3LDEyNC44MzItMTAxLjk2MiAgYzAsMCw5Ni4wMywyLjc3MSwxMDIuNjY3LDEyMS4wMTljMC4yMTIsMy43NywwLjIxLDcuNTM3LDAuMTQyLDExLjMxMmMtMC4zMzcsMTguNTg1LTEuMzA1LDc4Ljc5Ny0wLjI5LDEwOC44MjQgIGMwLjE1NSw0LjYxNSwwLjk4Myw5LjE3OCwyLjY0NSwxMy40ODdjMS40NywzLjgxNSwzLjE2OSw5LjUwOSwzLjQ1MiwxNS45NmMwLjQxNSw5LjQ3LDIuMzEsMTguNzk2LDYuNDIyLDI3LjMzNiAgYzYuMDQ3LDEyLjU1OSwxNS41MzgsMjkuNzQsMjcuNDAyLDQyLjg3N2M3LjUyMSw4LjMyNiwxMS4yMDcsMTkuNjU4LDguOTE1LDMwLjY0MWMtMS4zMDgsNi4yNjgtNC4yNzUsMTIuNjMxLTEwLjMyMywxNy4zMzQgIGMwLDAsMzEuNDQ2LDM3LjE2NC03LjYyMyw3NC4zMjhjMCwwLTE1LjI0NiwxNS4yNDUtMzYuODY2LDIzLjU1OWMtNS44NzMsMi4yNTgtMTIuMTczLDMuMTU1LTE4LjQ1MywyLjc0MyAgYy0zNi45MTYtMi40MjItMTgyLjkxOC0yMC4yODgtMjUzLjIyNy0xNTEuODcyYy00Ljk2Mi05LjI4Ny03LjM2OS0xOS44NjYtNi4wNjMtMzAuMzE0YzEuNTc0LTEyLjU5Niw4LjI0Ny0yNi44NzEsMjkuNjg4LTI5LjkzNCAgYzAsMC01Ljk5My0yMC4yNTcsOS45MjEtMjkuNDg0QzEzNi4xMDUsMjU0Ljc3MSwxNDAuNDYzLDI0Ni42MjgsMTQwLjY4MiwyMzguMDU0TDE0MC42ODIsMjM4LjA1NHoiIGZpbGw9InVybCgjU1ZHSURfMV8pIi8+PHBhdGggZD0iTTQwMy42ODcsNDc0LjM3N2MzOS4wNjktMzcuMTY0LDcuNjIzLTc0LjMyOCw3LjYyMy03NC4zMjhjNi4wNS00LjcwNSw5LjAxNy0xMS4wNjksMTAuMzI0LTE3LjMzOCAgYzIuMjg4LTEwLjk2OS0xLjM3LTIyLjI5MS04Ljg4NS0zMC42MDRjLTExLjk4OC0xMy4yNi0yMS41NTYtMzAuNjU3LTI3LjYtNDMuMjU0Yy00LjAzNi04LjQxNC01Ljg1Ni0xNy42MTktNi4yNTQtMjYuOTQxICBjLTAuMjc0LTYuNDIyLTEuOTU0LTEyLjA5OC0zLjQyLTE1LjkyMmMtMS42OTItNC40MTYtMi41My05LjA5Ni0yLjY4OC0xMy44MjJjLTEuMDAxLTMwLjEwNy0wLjAzNy05MC4wNDMsMC4yOTktMTA4LjU3OCAgYzAuMDY4LTMuNzc1LDAuMDctNy41NDItMC4xNDItMTEuMzEyQzM2Ni4zMDksMTQuMDMsMjcwLjI3OCwxMS4yNiwyNzAuMjc4LDExLjI2Yy00LjEwOS0wLjA3OS04LjA0MSwwLjAxOS0xMS44OTIsMC4xOTMgIGM5LjgyNCw1LjMyLDIyLjIzLDE0Ljc1NCwyNy44NjYsMzAuMTU3YzIuOTA3LDcuOTQzLTAuODg0LDE2LjkzLTguNjAxLDIwLjM5MmMtMjAuNzQ5LDkuMzA3LTYxLjM2Myw0MC4zNTYtNTQuMywxMzkuODMxICBjMCwwLTExLjUzMiw4NC4zMzIsNjQuODcsMTM5LjcxYzguMjM5LDUuOTcyLDEzLjg4NSwxNC45NTUsMTUuODEzLDI0Ljk0NmMxLjU2Miw4LjA5NCwyLjQyNSwxOC4xNzgsMC42MzQsMjguNjIzICBjLTEuNzcxLDEwLjMyMi0xMi43NzgsMTYuNDAyLTIyLjM3OCwxMi4yMTNjLTQuNDU5LTEuOTQ3LTkuMzAyLTQuNDM5LTEzLjgwOS03LjU0M2MtMi4xNjUtMS40OS01LjA1Ny0xLjgxNi03LjI1Mi0wLjM3MSAgYy0zLjMxNywyLjE4Mi0zLjc5OSw2LjY1MS0xLjI1Niw5LjQzOWM1LjA0MSw1LjUyNywxNC40MSwxNS4wOTksMjUuMzc4LDIyLjkzMmMwLDAtMjMuMTM2LDM1LjMyOS04Ni44MzMsMjMuNDU3ICBjNjIuNTM2LDM2LjUwNiwxMjcuMDI4LDQzLjk0MSwxNDkuODQ3LDQ1LjQzOGM2LjI4LDAuNDEyLDEyLjU4LTAuNDg1LDE4LjQ1My0yLjc0M0MzODguNDQsNDg5LjYyMiw0MDMuNjg3LDQ3NC4zNzcsNDAzLjY4Nyw0NzQuMzc3ICB6IiBmaWxsPSIjOEU1NDVDIi8+PHBhdGggZD0iTTMwNi42NjIsODIuOTg2YzE1LjQ4Miw3LjM3NiwyOS41MTYsMjEuNDQzLDMzLjU2Niw0Ny43OThjMC40NDUsMi44OTUsMC42NCw1LjgyMywwLjc4OCw4Ljc0OSAgbDUuODkxLDExNi4zMzljMC43ODYsMTUuNTMyLDMuNzU2LDMwLjgyNCw3Ljk3Niw0NS43OTNjMy4zNTQsMTEuODk3LDQuMDQzLDI2LjkzNC0xMS4xNiwzMi4wNDkgIGMtMS40MjYsMC40OC0yLjkzMiwwLjY4Ni00LjQzNSwwLjczMWMtMTMuODc0LDAuNDI1LTgzLjQ2Mi0yLjc2Ny0xMzEuOTU5LTEwNC4xODFjLTMuNzEzLTcuNzY0LTYuMjk3LTE2LjAyMS03Ljc3MS0yNC41ICBjLTMuNjI1LTIwLjg3MS03LjE3My02MC43NjMsMTAuMjUtOTIuMDU4QzIyOC43ODQsNzkuNjIzLDI3MS40NDcsNjYuMjA3LDMwNi42NjIsODIuOTg2eiIgZmlsbD0iIzYwMkUzQSIvPjxsaW5lYXJHcmFkaWVudCBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgaWQ9IlNWR0lEXzJfIiB4MT0iMjYwLjc2NzYiIHgyPSIyNjAuNzY3NiIgeTE9IjIxMy4yMTc4IiB5Mj0iLTM1LjUzODkiPjxzdG9wIG9mZnNldD0iMC4wMDUxIiBzdHlsZT0ic3RvcC1jb2xvcjojRkZFMUZGIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRTVCNEY3Ii8+PC9saW5lYXJHcmFkaWVudD48cGF0aCBkPSJNMjkzLjA0NSw3OC4wNjVjLTMxLjk4My04LjE0LTY2LjY1NCw1Ljg1Ni04My4yMzYsMzUuNjRjLTE2LjEzMiwyOC45NzUtMTQuMjgzLDY1LjI5MS0xMS4wNDMsODcuMDg1ICBjOS4zMzYsOC4wMzcsMjAuNDI2LDkuNDA3LDI3LjgwMyw5LjE5MmM0Ljc1OC0wLjEzOCw4Ljg1LDMuMzA3LDkuNTk3LDguMDA3bDEuOTg0LDEyLjQ3NGMwLjU0MywzLjQxMywzLjQ4NSw1LjkyNCw2Ljk0MSw1LjkyNCAgaDguMTI4YzMuNjMsMCw2LjY2Mi0yLjc2NCw2Ljk5OS02LjM3N2wxLjM0NS0xNC40NTljMC4zMTMtMy4zNTQsMy4xMjYtNS45MTgsNi40OTQtNS45MThjMy4zNCwwLDYuMTQxLDIuNTI0LDYuNDg2LDUuODQ3ICBsMS41MjEsMTQuNjA3YzAuMzczLDMuNTgxLDMuMzkxLDYuMzAxLDYuOTkxLDYuMzAxaDYuODcyYzMuODgyLDAsNy4wMjktMy4xNDcsNy4wMjktNy4wMjl2LTEyLjI0NGMwLTMuNDg5LDIuNzQ1LTYuMzYsNi4yMy02LjUxNiAgbDAuODk3LTAuMDRjMy43MTMtMC4xNjYsNi44MTMsMi43OTksNi44MTMsNi41MTZ2OS43OTVjMCwzLjg4MiwzLjE0Niw3LjAyOSw3LjAyOCw3LjAyOXM3LjAyOC0zLjE0Nyw3LjAyOC03LjAyOXYtOTAuNjU1ICBDMzI0Ljk1NCwxMDYuMjUzLDMwNy4wNCw4Ny44NjgsMjkzLjA0NSw3OC4wNjV6IiBmaWxsPSJ1cmwoI1NWR0lEXzJfKSIvPjxwYXRoIGQ9Ik0yNjMuMzEzLDEzMS4xNjJjLTguMzI0LTAuMDYxLTI0LjYwNywxLjkwNi0zMS4zMjUsMTcuMjY4Yy0yLjM5Miw1LjQ2Ny0yLjk1NCwxMS42NjgtMS4yMjEsMTcuMzc4ICBjMC4wNCwwLjEzMSwwLjA4MSwwLjI2MywwLjEyMywwLjM5NmMzLjc3NCwxMS44MSwxOC4zMjgsMTYuMTE1LDI4LjE3Miw4LjU3NmMwLjM5Ni0wLjMwMywwLjc5OS0wLjYxNywxLjIwNi0wLjkzOCAgYzEwLjIyNi04LjA4NiwxNS4yOTctMjEuNDksMTEuOTc0LTM0LjA5N2MtMC4yODQtMS4wNzgtMC42MjgtMi4xNDQtMS4wNDEtMy4xODRDMjY5LjkxNiwxMzMuMzMsMjY2Ljc4OCwxMzEuMTg3LDI2My4zMTMsMTMxLjE2MnoiIGZpbGw9IiM2MDJFM0EiLz48cGF0aCBkPSJNMjk5LjY0MywxMzUuNzE1YzUuOTUyLDEuMjAyLDE2LjU4LDUuMTI2LDE3LjI0OSwxNy44NDhjMC4xMzMsMi41MjgtMC41NjMsNS4wMzYtMS43NCw3LjI3NmwtMC4xMjIsMC4yMzIgIGMtMy42OTgsNi45MTItMTMuMjQxLDcuOTI0LTE4LjUsMi4xMDljLTAuMTM2LTAuMTUxLTAuMjczLTAuMzA0LTAuNDEyLTAuNDZjLTUuNTktNi4zMDQtNy4zNTQtMTUuNDYtMy42NzYtMjMuMDQgIGMwLjE0Ny0wLjMwNCwwLjMwMy0wLjYwNCwwLjQ2OC0wLjlDMjk0LjIzOCwxMzYuMzkxLDI5Ni45NjMsMTM1LjE3NCwyOTkuNjQzLDEzNS43MTV6IiBmaWxsPSIjNjAyRTNBIi8+PHBhdGggZD0iTTI4OS43OTIsMTczLjUwOWMxLjQyMSwyLjIxNywyLjkyMiw0LjgyNiw0LjEyMyw3LjU0M2MxLjE4NywyLjY4NS0wLjg1NSw1LjctMy43OTEsNS43aC01Ljk0OCAgYy0yLjczLDAtNC42OTktMi42MDItMy45NDktNS4yMjdjMC41NzItMi4wMDMsMS4zMDctNC40NDgsMi4xNzgtNy4wOTJDMjgzLjQ5NiwxNzEuMTIsMjg3LjkwOSwxNzAuNTczLDI4OS43OTIsMTczLjUwOXoiIGZpbGw9IiM2MDJFM0EiLz48cGF0aCBkPSJNMTY4LjYxMSwzMTYuODA1YzEyLjg3OCwxMS44NjksMzIuNTMsMjguOTQzLDQ4Ljg5NSwzOC43MjFjNC4zMTQsMi41NzgsNS4wNTgsOC41MDIsMS40MTQsMTEuOTY0bDAsMCAgYy0yLjg0MywyLjctNy4yNjksMi43ODItMTAuMTg4LDAuMTY1Yy05LjQyNi04LjQ1MS0yOS42NTEtMjcuNTE0LTQzLjg5My00Ny41MzNDMTYzLjA5LDMxNy42NjIsMTY2LjM5MiwzMTQuNzYsMTY4LjYxMSwzMTYuODA1eiIgZmlsbD0iIzhFNTQ1QyIvPjxwYXRoIGQ9Ik0zMjIuMDIzLDExNi4xODhjLTUuNjQ2LTE4LjQ0NC0xOC40MjItMzAuNzMtMjguOTc5LTM4LjEyNGMtMjcuNzktNy4wNzItNTcuNTk0LDIuNTgzLTc1LjgxMywyNC43NzEgIEMyMzguNTU2LDkzLjcyNiwyODQuMzc3LDgwLjg2MiwzMjIuMDIzLDExNi4xODh6IiBmaWxsPSIjRTVCNEY3Ii8+PC9zdmc+DQo=";
var skStyles = /* @__PURE__ */ (() => `/*!
 * Bootstrap v5.2.0-beta1 (https://getbootstrap.com/)
 * Copyright 2011-2022 The Bootstrap Authors
 * Copyright 2011-2022 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */
:root {
  --bs-blue: #0d6efd;
  --bs-indigo: #6610f2;
  --bs-purple: #6f42c1;
  --bs-pink: #d63384;
  --bs-red: #dc3545;
  --bs-orange: #fd7e14;
  --bs-yellow: #ffc107;
  --bs-green: #198754;
  --bs-teal: #20c997;
  --bs-cyan: #0dcaf0;
  --bs-black: #000;
  --bs-white: #fff;
  --bs-gray: #6c757d;
  --bs-gray-dark: #343a40;
  --bs-gray-100: #f8f9fa;
  --bs-gray-200: #e9ecef;
  --bs-gray-300: #dee2e6;
  --bs-gray-400: #ced4da;
  --bs-gray-500: #adb5bd;
  --bs-gray-600: #6c757d;
  --bs-gray-700: #495057;
  --bs-gray-800: #343a40;
  --bs-gray-900: #212529;
  --bs-primary: #0d6efd;
  --bs-secondary: #6c757d;
  --bs-success: #198754;
  --bs-info: #0dcaf0;
  --bs-warning: #ffc107;
  --bs-danger: #dc3545;
  --bs-light: #f8f9fa;
  --bs-dark: #212529;
  --bs-sake: #4b2e52;
  --bs-primary-rgb: 13, 110, 253;
  --bs-secondary-rgb: 108, 117, 125;
  --bs-success-rgb: 25, 135, 84;
  --bs-info-rgb: 13, 202, 240;
  --bs-warning-rgb: 255, 193, 7;
  --bs-danger-rgb: 220, 53, 69;
  --bs-light-rgb: 248, 249, 250;
  --bs-dark-rgb: 33, 37, 41;
  --bs-sake-rgb: 75, 46, 82;
  --bs-white-rgb: 255, 255, 255;
  --bs-black-rgb: 0, 0, 0;
  --bs-body-color-rgb: 33, 37, 41;
  --bs-body-bg-rgb: 255, 255, 255;
  --bs-font-sans-serif: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --bs-font-monospace: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --bs-gradient: linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0));
  --bs-body-font-family: var(--bs-font-sans-serif);
  --bs-body-font-size: 1rem;
  --bs-body-font-weight: 400;
  --bs-body-line-height: 1.5;
  --bs-body-color: #212529;
  --bs-body-bg: #fff;
  --bs-border-width: 1px;
  --bs-border-style: solid;
  --bs-border-color: #dee2e6;
  --bs-border-color-translucent: rgba(0, 0, 0, 0.175);
  --bs-border-radius: 0.375rem;
  --bs-border-radius-sm: 0.25rem;
  --bs-border-radius-lg: 0.5rem;
  --bs-border-radius-xl: 1rem;
  --bs-border-radius-2xl: 2rem;
  --bs-border-radius-pill: 50rem;
  --bs-heading-color: ;
  --bs-link-color: #0d6efd;
  --bs-link-hover-color: #0a58ca;
  --bs-code-color: #d63384;
  --bs-highlight-bg: #fff3cd;
}
.sak32009 * {
  all: revert;
}
.sak32009 *,
.sak32009 *::before,
.sak32009 *::after {
  box-sizing: border-box;
}
@media (prefers-reduced-motion: no-preference) {
  :root {
    scroll-behavior: smooth;
  }
}
.sak32009 {
  margin: 0;
  font-family: var(--bs-body-font-family);
  font-size: var(--bs-body-font-size);
  font-weight: var(--bs-body-font-weight);
  line-height: var(--bs-body-line-height);
  color: var(--bs-body-color);
  text-align: var(--bs-body-text-align);
  background-color: var(--bs-body-bg);
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
.sak32009 hr {
  margin: 1rem 0;
  color: inherit;
  border: 0;
  border-top: 1px solid;
  opacity: 0.25;
}
.sak32009 h6, .sak32009 h5, .sak32009 h4, .sak32009 h3, .sak32009 h2, .sak32009 h1 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-weight: 500;
  line-height: 1.2;
  color: var(--bs-heading-color);
}
.sak32009 h1 {
  font-size: calc(1.375rem + 1.5vw);
}
@media (min-width: 1200px) {
  .sak32009 h1 {
    font-size: 2.5rem;
  }
}
.sak32009 h2 {
  font-size: calc(1.325rem + 0.9vw);
}
@media (min-width: 1200px) {
  .sak32009 h2 {
    font-size: 2rem;
  }
}
.sak32009 h3 {
  font-size: calc(1.3rem + 0.6vw);
}
@media (min-width: 1200px) {
  .sak32009 h3 {
    font-size: 1.75rem;
  }
}
.sak32009 h4 {
  font-size: calc(1.275rem + 0.3vw);
}
@media (min-width: 1200px) {
  .sak32009 h4 {
    font-size: 1.5rem;
  }
}
.sak32009 h5 {
  font-size: 1.25rem;
}
.sak32009 h6 {
  font-size: 1rem;
}
.sak32009 p {
  margin-top: 0;
  margin-bottom: 1rem;
}
.sak32009 abbr[title] {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
  cursor: help;
  -webkit-text-decoration-skip-ink: none;
          text-decoration-skip-ink: none;
}
.sak32009 address {
  margin-bottom: 1rem;
  font-style: normal;
  line-height: inherit;
}
.sak32009 ol,
.sak32009 ul {
  padding-left: 2rem;
}
.sak32009 ol,
.sak32009 ul,
.sak32009 dl {
  margin-top: 0;
  margin-bottom: 1rem;
}
.sak32009 ol ol,
.sak32009 ul ul,
.sak32009 ol ul,
.sak32009 ul ol {
  margin-bottom: 0;
}
.sak32009 dt {
  font-weight: 700;
}
.sak32009 dd {
  margin-bottom: 0.5rem;
  margin-left: 0;
}
.sak32009 blockquote {
  margin: 0 0 1rem;
}
.sak32009 b,
.sak32009 strong {
  font-weight: bolder;
}
.sak32009 small {
  font-size: 0.875em;
}
.sak32009 mark {
  padding: 0.1875em;
  background-color: var(--bs-highlight-bg);
}
.sak32009 sub,
.sak32009 sup {
  position: relative;
  font-size: 0.75em;
  line-height: 0;
  vertical-align: baseline;
}
.sak32009 sub {
  bottom: -0.25em;
}
.sak32009 sup {
  top: -0.5em;
}
.sak32009 a {
  color: var(--bs-link-color);
  text-decoration: underline;
}
.sak32009 a:hover {
  color: var(--bs-link-hover-color);
}
.sak32009 a:not([href]):not([class]), .sak32009 a:not([href]):not([class]):hover {
  color: inherit;
  text-decoration: none;
}
.sak32009 pre,
.sak32009 code,
.sak32009 kbd,
.sak32009 samp {
  font-family: var(--bs-font-monospace);
  font-size: 1em;
}
.sak32009 pre {
  display: block;
  margin-top: 0;
  margin-bottom: 1rem;
  overflow: auto;
  font-size: 0.875em;
}
.sak32009 pre code {
  font-size: inherit;
  color: inherit;
  word-break: normal;
}
.sak32009 code {
  font-size: 0.875em;
  color: var(--bs-code-color);
  word-wrap: break-word;
}
.sak32009 a > code {
  color: inherit;
}
.sak32009 kbd {
  padding: 0.1875rem 0.375rem;
  font-size: 0.875em;
  color: var(--bs-body-bg);
  background-color: var(--bs-body-color);
  border-radius: 0.25rem;
}
.sak32009 kbd kbd {
  padding: 0;
  font-size: 1em;
}
.sak32009 figure {
  margin: 0 0 1rem;
}
.sak32009 img,
.sak32009 svg {
  vertical-align: middle;
}
.sak32009 table {
  caption-side: bottom;
  border-collapse: collapse;
}
.sak32009 caption {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  color: rgba(var(--bs-body-color-rgb), 0.75);
  text-align: left;
}
.sak32009 th {
  text-align: inherit;
  text-align: -webkit-match-parent;
}
.sak32009 thead,
.sak32009 tbody,
.sak32009 tfoot,
.sak32009 tr,
.sak32009 td,
.sak32009 th {
  border-color: inherit;
  border-style: solid;
  border-width: 0;
}
.sak32009 label {
  display: inline-block;
}
.sak32009 button {
  border-radius: 0;
}
.sak32009 button:focus:not(:focus-visible) {
  outline: 0;
}
.sak32009 input,
.sak32009 button,
.sak32009 select,
.sak32009 optgroup,
.sak32009 textarea {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}
.sak32009 button,
.sak32009 select {
  text-transform: none;
}
.sak32009 [role=button] {
  cursor: pointer;
}
.sak32009 select {
  word-wrap: normal;
}
.sak32009 select:disabled {
  opacity: 1;
}
.sak32009 [list]:not([type=date]):not([type=datetime-local]):not([type=month]):not([type=week]):not([type=time])::-webkit-calendar-picker-indicator {
  display: none !important;
}
.sak32009 button,
.sak32009 [type=button],
.sak32009 [type=reset],
.sak32009 [type=submit] {
  -webkit-appearance: button;
}
.sak32009 button:not(:disabled),
.sak32009 [type=button]:not(:disabled),
.sak32009 [type=reset]:not(:disabled),
.sak32009 [type=submit]:not(:disabled) {
  cursor: pointer;
}
.sak32009 *::-moz-focus-inner {
  padding: 0;
  border-style: none;
}
.sak32009 textarea {
  resize: vertical;
}
.sak32009 fieldset {
  min-width: 0;
  padding: 0;
  margin: 0;
  border: 0;
}
.sak32009 legend {
  float: left;
  width: 100%;
  padding: 0;
  margin-bottom: 0.5rem;
  font-size: calc(1.275rem + 0.3vw);
  line-height: inherit;
}
@media (min-width: 1200px) {
  .sak32009 legend {
    font-size: 1.5rem;
  }
}
.sak32009 legend + * {
  clear: left;
}
.sak32009 *::-webkit-datetime-edit-fields-wrapper,
.sak32009 *::-webkit-datetime-edit-text,
.sak32009 *::-webkit-datetime-edit-minute,
.sak32009 *::-webkit-datetime-edit-hour-field,
.sak32009 *::-webkit-datetime-edit-day-field,
.sak32009 *::-webkit-datetime-edit-month-field,
.sak32009 *::-webkit-datetime-edit-year-field {
  padding: 0;
}
.sak32009 *::-webkit-inner-spin-button {
  height: auto;
}
.sak32009 [type=search] {
  outline-offset: -2px;
  -webkit-appearance: textfield;
}
/* rtl:raw:
[type="tel"],
[type="url"],
[type="email"],
[type="number"] {
  direction: ltr;
}
*/
.sak32009 *::-webkit-search-decoration {
  -webkit-appearance: none;
}
.sak32009 *::-webkit-color-swatch-wrapper {
  padding: 0;
}
.sak32009 *::-webkit-file-upload-button {
  font: inherit;
  -webkit-appearance: button;
}
.sak32009 *::file-selector-button {
  font: inherit;
  -webkit-appearance: button;
}
.sak32009 output {
  display: inline-block;
}
.sak32009 iframe {
  border: 0;
}
.sak32009 summary {
  display: list-item;
  cursor: pointer;
}
.sak32009 progress {
  vertical-align: baseline;
}
.sak32009 [hidden] {
  display: none !important;
}
.sak32009 .form-label {
  margin-bottom: 0.5rem;
}
.sak32009 .col-form-label {
  padding-top: calc(0.375rem + 1px);
  padding-bottom: calc(0.375rem + 1px);
  margin-bottom: 0;
  font-size: inherit;
  line-height: 1.5;
}
.sak32009 .col-form-label-lg {
  padding-top: calc(0.5rem + 1px);
  padding-bottom: calc(0.5rem + 1px);
  font-size: 1.25rem;
}
.sak32009 .col-form-label-sm {
  padding-top: calc(0.25rem + 1px);
  padding-bottom: calc(0.25rem + 1px);
  font-size: 0.875rem;
}
.sak32009 .form-text {
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: rgba(var(--bs-body-color-rgb), 0.75);
}
.sak32009 .form-control {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
  border-radius: 0.375rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
@media (prefers-reduced-motion: reduce) {
  .sak32009 .form-control {
    transition: none;
  }
}
.sak32009 .form-control[type=file] {
  overflow: hidden;
}
.sak32009 .form-control[type=file]:not(:disabled):not([readonly]) {
  cursor: pointer;
}
.sak32009 .form-control:focus {
  color: #212529;
  background-color: #fff;
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
.sak32009 .form-control::-webkit-date-and-time-value {
  height: 1.5em;
}
.sak32009 .form-control::-moz-placeholder {
  color: #6c757d;
  opacity: 1;
}
.sak32009 .form-control:-ms-input-placeholder {
  color: #6c757d;
  opacity: 1;
}
.sak32009 .form-control::placeholder {
  color: #6c757d;
  opacity: 1;
}
.sak32009 .form-control:disabled, .sak32009 .form-control[readonly] {
  background-color: #e9ecef;
  opacity: 1;
}
.sak32009 .form-control::-webkit-file-upload-button {
  padding: 0.375rem 0.75rem;
  margin: -0.375rem -0.75rem;
  -webkit-margin-end: 0.75rem;
          margin-inline-end: 0.75rem;
  color: #212529;
  background-color: #e9ecef;
  pointer-events: none;
  border-color: inherit;
  border-style: solid;
  border-width: 0;
  border-inline-end-width: 1px;
  border-radius: 0;
  -webkit-transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
.sak32009 .form-control::file-selector-button {
  padding: 0.375rem 0.75rem;
  margin: -0.375rem -0.75rem;
  -webkit-margin-end: 0.75rem;
          margin-inline-end: 0.75rem;
  color: #212529;
  background-color: #e9ecef;
  pointer-events: none;
  border-color: inherit;
  border-style: solid;
  border-width: 0;
  border-inline-end-width: 1px;
  border-radius: 0;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
@media (prefers-reduced-motion: reduce) {
  .sak32009 .form-control::-webkit-file-upload-button {
    -webkit-transition: none;
    transition: none;
  }
  .sak32009 .form-control::file-selector-button {
    transition: none;
  }
}
.sak32009 .form-control:hover:not(:disabled):not([readonly])::-webkit-file-upload-button {
  background-color: #dde0e3;
}
.sak32009 .form-control:hover:not(:disabled):not([readonly])::file-selector-button {
  background-color: #dde0e3;
}
.sak32009 .form-control-plaintext {
  display: block;
  width: 100%;
  padding: 0.375rem 0;
  margin-bottom: 0;
  line-height: 1.5;
  color: #212529;
  background-color: transparent;
  border: solid transparent;
  border-width: 1px 0;
}
.sak32009 .form-control-plaintext.form-control-sm, .sak32009 .form-control-plaintext.form-control-lg {
  padding-right: 0;
  padding-left: 0;
}
.sak32009 .form-control-sm {
  min-height: calc(1.5em + 0.5rem + 2px);
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
}
.sak32009 .form-control-sm::-webkit-file-upload-button {
  padding: 0.25rem 0.5rem;
  margin: -0.25rem -0.5rem;
  -webkit-margin-end: 0.5rem;
          margin-inline-end: 0.5rem;
}
.sak32009 .form-control-sm::file-selector-button {
  padding: 0.25rem 0.5rem;
  margin: -0.25rem -0.5rem;
  -webkit-margin-end: 0.5rem;
          margin-inline-end: 0.5rem;
}
.sak32009 .form-control-lg {
  min-height: calc(1.5em + 1rem + 2px);
  padding: 0.5rem 1rem;
  font-size: 1.25rem;
  border-radius: 0.5rem;
}
.sak32009 .form-control-lg::-webkit-file-upload-button {
  padding: 0.5rem 1rem;
  margin: -0.5rem -1rem;
  -webkit-margin-end: 1rem;
          margin-inline-end: 1rem;
}
.sak32009 .form-control-lg::file-selector-button {
  padding: 0.5rem 1rem;
  margin: -0.5rem -1rem;
  -webkit-margin-end: 1rem;
          margin-inline-end: 1rem;
}
.sak32009 textarea.form-control {
  min-height: calc(1.5em + 0.75rem + 2px);
}
.sak32009 textarea.form-control-sm {
  min-height: calc(1.5em + 0.5rem + 2px);
}
.sak32009 textarea.form-control-lg {
  min-height: calc(1.5em + 1rem + 2px);
}
.sak32009 .form-control-color {
  width: 3rem;
  height: auto;
  padding: 0.375rem;
}
.sak32009 .form-control-color:not(:disabled):not([readonly]) {
  cursor: pointer;
}
.sak32009 .form-control-color::-moz-color-swatch {
  height: 1.5em;
  border-radius: 0.375rem;
}
.sak32009 .form-control-color::-webkit-color-swatch {
  height: 1.5em;
  border-radius: 0.375rem;
}
.sak32009 .form-select {
  display: block;
  width: 100%;
  padding: 0.375rem 2.25rem 0.375rem 0.75rem;
  -moz-padding-start: calc(0.75rem - 3px);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
}
@media (prefers-reduced-motion: reduce) {
  .sak32009 .form-select {
    transition: none;
  }
}
.sak32009 .form-select:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
.sak32009 .form-select[multiple], .sak32009 .form-select[size]:not([size="1"]) {
  padding-right: 0.75rem;
  background-image: none;
}
.sak32009 .form-select:disabled {
  background-color: #e9ecef;
}
.sak32009 .form-select:-moz-focusring {
  color: transparent;
  text-shadow: 0 0 0 #212529;
}
.sak32009 .form-select-sm {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
}
.sak32009 .form-select-lg {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  font-size: 1.25rem;
  border-radius: 0.5rem;
}
.sak32009 .form-check {
  display: block;
  min-height: 1.5rem;
  padding-left: 1.5em;
  margin-bottom: 0.125rem;
}
.sak32009 .form-check .form-check-input {
  float: left;
  margin-left: -1.5em;
}
.sak32009 .form-check-reverse {
  padding-right: 1.5em;
  padding-left: 0;
  text-align: right;
}
.sak32009 .form-check-reverse .form-check-input {
  float: right;
  margin-right: -1.5em;
  margin-left: 0;
}
.sak32009 .form-check-input {
  width: 1em;
  height: 1em;
  margin-top: 0.25em;
  vertical-align: top;
  background-color: #fff;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  border: 1px solid rgba(0, 0, 0, 0.25);
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
  -webkit-print-color-adjust: exact;
     color-adjust: exact;
          print-color-adjust: exact;
}
.sak32009 .form-check-input[type=checkbox] {
  border-radius: 0.25em;
}
.sak32009 .form-check-input[type=radio] {
  border-radius: 50%;
}
.sak32009 .form-check-input:active {
  filter: brightness(90%);
}
.sak32009 .form-check-input:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
.sak32009 .form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
.sak32009 .form-check-input:checked[type=checkbox] {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e");
}
.sak32009 .form-check-input:checked[type=radio] {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='2' fill='%23fff'/%3e%3c/svg%3e");
}
.sak32009 .form-check-input[type=checkbox]:indeterminate {
  background-color: #0d6efd;
  border-color: #0d6efd;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 10h8'/%3e%3c/svg%3e");
}
.sak32009 .form-check-input:disabled {
  pointer-events: none;
  filter: none;
  opacity: 0.5;
}
.sak32009 .form-check-input[disabled] ~ .form-check-label, .sak32009 .form-check-input:disabled ~ .form-check-label {
  cursor: default;
  opacity: 0.5;
}
.sak32009 .form-switch {
  padding-left: 2.5em;
}
.sak32009 .form-switch .form-check-input {
  width: 2em;
  margin-left: -2.5em;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='rgba%280, 0, 0, 0.25%29'/%3e%3c/svg%3e");
  background-position: left center;
  border-radius: 2em;
  transition: background-position 0.15s ease-in-out;
}
@media (prefers-reduced-motion: reduce) {
  .sak32009 .form-switch .form-check-input {
    transition: none;
  }
}
.sak32009 .form-switch .form-check-input:focus {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%2386b7fe'/%3e%3c/svg%3e");
}
.sak32009 .form-switch .form-check-input:checked {
  background-position: right center;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
}
.sak32009 .form-switch.form-check-reverse {
  padding-right: 2.5em;
  padding-left: 0;
}
.sak32009 .form-switch.form-check-reverse .form-check-input {
  margin-right: -2.5em;
  margin-left: 0;
}
.sak32009 .form-check-inline {
  display: inline-block;
  margin-right: 1rem;
}
.sak32009 .btn-check {
  position: absolute;
  clip: rect(0, 0, 0, 0);
  pointer-events: none;
}
.sak32009 .btn-check[disabled] + .btn, .sak32009 .btn-check:disabled + .btn {
  pointer-events: none;
  filter: none;
  opacity: 0.65;
}
.sak32009 .form-range {
  width: 100%;
  height: 1.5rem;
  padding: 0;
  background-color: transparent;
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
}
.sak32009 .form-range:focus {
  outline: 0;
}
.sak32009 .form-range:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 1px #fff, 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
.sak32009 .form-range:focus::-moz-range-thumb {
  box-shadow: 0 0 0 1px #fff, 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
.sak32009 .form-range::-moz-focus-outer {
  border: 0;
}
.sak32009 .form-range::-webkit-slider-thumb {
  width: 1rem;
  height: 1rem;
  margin-top: -0.25rem;
  background-color: #0d6efd;
  border: 0;
  border-radius: 1rem;
  -webkit-transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  -webkit-appearance: none;
          appearance: none;
}
@media (prefers-reduced-motion: reduce) {
  .sak32009 .form-range::-webkit-slider-thumb {
    -webkit-transition: none;
    transition: none;
  }
}
.sak32009 .form-range::-webkit-slider-thumb:active {
  background-color: #b6d4fe;
}
.sak32009 .form-range::-webkit-slider-runnable-track {
  width: 100%;
  height: 0.5rem;
  color: transparent;
  cursor: pointer;
  background-color: #dee2e6;
  border-color: transparent;
  border-radius: 1rem;
}
.sak32009 .form-range::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  background-color: #0d6efd;
  border: 0;
  border-radius: 1rem;
  -moz-transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  -moz-appearance: none;
       appearance: none;
}
@media (prefers-reduced-motion: reduce) {
  .sak32009 .form-range::-moz-range-thumb {
    -moz-transition: none;
    transition: none;
  }
}
.sak32009 .form-range::-moz-range-thumb:active {
  background-color: #b6d4fe;
}
.sak32009 .form-range::-moz-range-track {
  width: 100%;
  height: 0.5rem;
  color: transparent;
  cursor: pointer;
  background-color: #dee2e6;
  border-color: transparent;
  border-radius: 1rem;
}
.sak32009 .form-range:disabled {
  pointer-events: none;
}
.sak32009 .form-range:disabled::-webkit-slider-thumb {
  background-color: #adb5bd;
}
.sak32009 .form-range:disabled::-moz-range-thumb {
  background-color: #adb5bd;
}
.sak32009 .form-floating {
  position: relative;
}
.sak32009 .form-floating > .form-control,
.sak32009 .form-floating > .form-control-plaintext,
.sak32009 .form-floating > .form-select {
  height: calc(3.5rem + 2px);
  line-height: 1.25;
}
.sak32009 .form-floating > label {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  padding: 1rem 0.75rem;
  pointer-events: none;
  border: 1px solid transparent;
  transform-origin: 0 0;
  transition: opacity 0.1s ease-in-out, transform 0.1s ease-in-out;
}
@media (prefers-reduced-motion: reduce) {
  .sak32009 .form-floating > label {
    transition: none;
  }
}
.sak32009 .form-floating > .form-control,
.sak32009 .form-floating > .form-control-plaintext {
  padding: 1rem 0.75rem;
}
.sak32009 .form-floating > .form-control::-moz-placeholder, .sak32009 .form-floating > .form-control-plaintext::-moz-placeholder {
  color: transparent;
}
.sak32009 .form-floating > .form-control:-ms-input-placeholder, .sak32009 .form-floating > .form-control-plaintext:-ms-input-placeholder {
  color: transparent;
}
.sak32009 .form-floating > .form-control::placeholder,
.sak32009 .form-floating > .form-control-plaintext::placeholder {
  color: transparent;
}
.sak32009 .form-floating > .form-control:not(:-moz-placeholder-shown), .sak32009 .form-floating > .form-control-plaintext:not(:-moz-placeholder-shown) {
  padding-top: 1.625rem;
  padding-bottom: 0.625rem;
}
.sak32009 .form-floating > .form-control:not(:-ms-input-placeholder), .sak32009 .form-floating > .form-control-plaintext:not(:-ms-input-placeholder) {
  padding-top: 1.625rem;
  padding-bottom: 0.625rem;
}
.sak32009 .form-floating > .form-control:focus, .sak32009 .form-floating > .form-control:not(:placeholder-shown), .sak32009 .form-floating > .form-control-plaintext:focus, .sak32009 .form-floating > .form-control-plaintext:not(:placeholder-shown) {
  padding-top: 1.625rem;
  padding-bottom: 0.625rem;
}
.sak32009 .form-floating > .form-control:-webkit-autofill,
.sak32009 .form-floating > .form-control-plaintext:-webkit-autofill {
  padding-top: 1.625rem;
  padding-bottom: 0.625rem;
}
.sak32009 .form-floating > .form-select {
  padding-top: 1.625rem;
  padding-bottom: 0.625rem;
}
.sak32009 .form-floating > .form-control:not(:-moz-placeholder-shown) ~ label {
  opacity: 0.65;
  transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
}
.sak32009 .form-floating > .form-control:not(:-ms-input-placeholder) ~ label {
  opacity: 0.65;
  transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
}
.sak32009 .form-floating > .form-control:focus ~ label,
.sak32009 .form-floating > .form-control:not(:placeholder-shown) ~ label,
.sak32009 .form-floating > .form-control-plaintext ~ label,
.sak32009 .form-floating > .form-select ~ label {
  opacity: 0.65;
  transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
}
.sak32009 .form-floating > .form-control:-webkit-autofill ~ label {
  opacity: 0.65;
  transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
}
.sak32009 .form-floating > .form-control-plaintext ~ label {
  border-width: 1px 0;
}
.sak32009 .input-group {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  width: 100%;
}
.sak32009 .input-group > .form-control,
.sak32009 .input-group > .form-select {
  position: relative;
  flex: 1 1 auto;
  width: 1%;
  min-width: 0;
}
.sak32009 .input-group > .form-control:focus,
.sak32009 .input-group > .form-select:focus {
  z-index: 3;
}
.sak32009 .input-group .btn {
  position: relative;
  z-index: 2;
}
.sak32009 .input-group .btn:focus {
  z-index: 3;
}
.sak32009 .input-group-text {
  display: flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  text-align: center;
  white-space: nowrap;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
}
.sak32009 .input-group-lg > .form-control,
.sak32009 .input-group-lg > .form-select,
.sak32009 .input-group-lg > .input-group-text,
.sak32009 .input-group-lg > .btn {
  padding: 0.5rem 1rem;
  font-size: 1.25rem;
  border-radius: 0.5rem;
}
.sak32009 .input-group-sm > .form-control,
.sak32009 .input-group-sm > .form-select,
.sak32009 .input-group-sm > .input-group-text,
.sak32009 .input-group-sm > .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
}
.sak32009 .input-group-lg > .form-select,
.sak32009 .input-group-sm > .form-select {
  padding-right: 3rem;
}
.sak32009 .input-group:not(.has-validation) > :not(:last-child):not(.dropdown-toggle):not(.dropdown-menu),
.sak32009 .input-group:not(.has-validation) > .dropdown-toggle:nth-last-child(n+3) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.sak32009 .input-group.has-validation > :nth-last-child(n+3):not(.dropdown-toggle):not(.dropdown-menu),
.sak32009 .input-group.has-validation > .dropdown-toggle:nth-last-child(n+4) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.sak32009 .input-group > :not(:first-child):not(.dropdown-menu):not(.valid-tooltip):not(.valid-feedback):not(.invalid-tooltip):not(.invalid-feedback) {
  margin-left: -1px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.sak32009 .valid-feedback {
  display: none;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #198754;
}
.sak32009 .valid-tooltip {
  position: absolute;
  top: 100%;
  z-index: 5;
  display: none;
  max-width: 100%;
  padding: 0.25rem 0.5rem;
  margin-top: 0.1rem;
  font-size: 0.875rem;
  color: #fff;
  background-color: rgba(25, 135, 84, 0.9);
  border-radius: 0.375rem;
}
.sak32009 .was-validated :valid ~ .valid-feedback,
.sak32009 .was-validated :valid ~ .valid-tooltip,
.sak32009 .is-valid ~ .valid-feedback,
.sak32009 .is-valid ~ .valid-tooltip {
  display: block;
}
.sak32009 .was-validated .form-control:valid, .sak32009 .form-control.is-valid {
  border-color: #198754;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23198754' d='M2.3 6.73.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}
.sak32009 .was-validated .form-control:valid:focus, .sak32009 .form-control.is-valid:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}
.sak32009 .was-validated textarea.form-control:valid, .sak32009 textarea.form-control.is-valid {
  padding-right: calc(1.5em + 0.75rem);
  background-position: top calc(0.375em + 0.1875rem) right calc(0.375em + 0.1875rem);
}
.sak32009 .was-validated .form-select:valid, .sak32009 .form-select.is-valid {
  border-color: #198754;
}
.sak32009 .was-validated .form-select:valid:not([multiple]):not([size]), .sak32009 .was-validated .form-select:valid:not([multiple])[size="1"], .sak32009 .form-select.is-valid:not([multiple]):not([size]), .sak32009 .form-select.is-valid:not([multiple])[size="1"] {
  padding-right: 4.125rem;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e"), url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23198754' d='M2.3 6.73.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
  background-position: right 0.75rem center, center right 2.25rem;
  background-size: 16px 12px, calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}
.sak32009 .was-validated .form-select:valid:focus, .sak32009 .form-select.is-valid:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}
.sak32009 .was-validated .form-control-color:valid, .sak32009 .form-control-color.is-valid {
  width: calc(3rem + calc(1.5em + 0.75rem));
}
.sak32009 .was-validated .form-check-input:valid, .sak32009 .form-check-input.is-valid {
  border-color: #198754;
}
.sak32009 .was-validated .form-check-input:valid:checked, .sak32009 .form-check-input.is-valid:checked {
  background-color: #198754;
}
.sak32009 .was-validated .form-check-input:valid:focus, .sak32009 .form-check-input.is-valid:focus {
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}
.sak32009 .was-validated .form-check-input:valid ~ .form-check-label, .sak32009 .form-check-input.is-valid ~ .form-check-label {
  color: #198754;
}
.sak32009 .form-check-inline .form-check-input ~ .valid-feedback {
  margin-left: 0.5em;
}
.sak32009 .was-validated .input-group .form-control:valid, .sak32009 .input-group .form-control.is-valid, .sak32009 .was-validated .input-group .form-select:valid, .sak32009 .input-group .form-select.is-valid {
  z-index: 1;
}
.sak32009 .was-validated .input-group .form-control:valid:focus, .sak32009 .input-group .form-control.is-valid:focus, .sak32009 .was-validated .input-group .form-select:valid:focus, .sak32009 .input-group .form-select.is-valid:focus {
  z-index: 3;
}
.sak32009 .invalid-feedback {
  display: none;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}
.sak32009 .invalid-tooltip {
  position: absolute;
  top: 100%;
  z-index: 5;
  display: none;
  max-width: 100%;
  padding: 0.25rem 0.5rem;
  margin-top: 0.1rem;
  font-size: 0.875rem;
  color: #fff;
  background-color: rgba(220, 53, 69, 0.9);
  border-radius: 0.375rem;
}
.sak32009 .was-validated :invalid ~ .invalid-feedback,
.sak32009 .was-validated :invalid ~ .invalid-tooltip,
.sak32009 .is-invalid ~ .invalid-feedback,
.sak32009 .is-invalid ~ .invalid-tooltip {
  display: block;
}
.sak32009 .was-validated .form-control:invalid, .sak32009 .form-control.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}
.sak32009 .was-validated .form-control:invalid:focus, .sak32009 .form-control.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}
.sak32009 .was-validated textarea.form-control:invalid, .sak32009 textarea.form-control.is-invalid {
  padding-right: calc(1.5em + 0.75rem);
  background-position: top calc(0.375em + 0.1875rem) right calc(0.375em + 0.1875rem);
}
.sak32009 .was-validated .form-select:invalid, .sak32009 .form-select.is-invalid {
  border-color: #dc3545;
}
.sak32009 .was-validated .form-select:invalid:not([multiple]):not([size]), .sak32009 .was-validated .form-select:invalid:not([multiple])[size="1"], .sak32009 .form-select.is-invalid:not([multiple]):not([size]), .sak32009 .form-select.is-invalid:not([multiple])[size="1"] {
  padding-right: 4.125rem;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e"), url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-position: right 0.75rem center, center right 2.25rem;
  background-size: 16px 12px, calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}
.sak32009 .was-validated .form-select:invalid:focus, .sak32009 .form-select.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}
.sak32009 .was-validated .form-control-color:invalid, .sak32009 .form-control-color.is-invalid {
  width: calc(3rem + calc(1.5em + 0.75rem));
}
.sak32009 .was-validated .form-check-input:invalid, .sak32009 .form-check-input.is-invalid {
  border-color: #dc3545;
}
.sak32009 .was-validated .form-check-input:invalid:checked, .sak32009 .form-check-input.is-invalid:checked {
  background-color: #dc3545;
}
.sak32009 .was-validated .form-check-input:invalid:focus, .sak32009 .form-check-input.is-invalid:focus {
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}
.sak32009 .was-validated .form-check-input:invalid ~ .form-check-label, .sak32009 .form-check-input.is-invalid ~ .form-check-label {
  color: #dc3545;
}
.sak32009 .form-check-inline .form-check-input ~ .invalid-feedback {
  margin-left: 0.5em;
}
.sak32009 .was-validated .input-group .form-control:invalid, .sak32009 .input-group .form-control.is-invalid, .sak32009 .was-validated .input-group .form-select:invalid, .sak32009 .input-group .form-select.is-invalid {
  z-index: 2;
}
.sak32009 .was-validated .input-group .form-control:invalid:focus, .sak32009 .input-group .form-control.is-invalid:focus, .sak32009 .was-validated .input-group .form-select:invalid:focus, .sak32009 .input-group .form-select.is-invalid:focus {
  z-index: 3;
}
.sak32009 .btn {
  --bs-btn-padding-x: 0.75rem;
  --bs-btn-padding-y: 0.375rem;
  --bs-btn-font-family: ;
  --bs-btn-font-size: 1rem;
  --bs-btn-font-weight: 400;
  --bs-btn-line-height: 1.5;
  --bs-btn-color: #212529;
  --bs-btn-bg: transparent;
  --bs-btn-border-width: 1px;
  --bs-btn-border-color: transparent;
  --bs-btn-border-radius: 0.375rem;
  --bs-btn-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 1px 1px rgba(0, 0, 0, 0.075);
  --bs-btn-disabled-opacity: 0.65;
  --bs-btn-focus-box-shadow: 0 0 0 0.25rem rgba(var(--bs-btn-focus-shadow-rgb), .5);
  display: inline-block;
  padding: var(--bs-btn-padding-y) var(--bs-btn-padding-x);
  font-family: var(--bs-btn-font-family);
  font-size: var(--bs-btn-font-size);
  font-weight: var(--bs-btn-font-weight);
  line-height: var(--bs-btn-line-height);
  color: var(--bs-btn-color);
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  border: var(--bs-btn-border-width) solid var(--bs-btn-border-color);
  border-radius: var(--bs-btn-border-radius);
  background-color: var(--bs-btn-bg);
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
@media (prefers-reduced-motion: reduce) {
  .sak32009 .btn {
    transition: none;
  }
}
.sak32009 .btn:hover {
  color: var(--bs-btn-hover-color);
  background-color: var(--bs-btn-hover-bg);
  border-color: var(--bs-btn-hover-border-color);
}
.sak32009 .btn-check:focus + .btn, .sak32009 .btn:focus {
  color: var(--bs-btn-hover-color);
  background-color: var(--bs-btn-hover-bg);
  border-color: var(--bs-btn-hover-border-color);
  outline: 0;
  box-shadow: var(--bs-btn-focus-box-shadow);
}
.sak32009 .btn-check:checked + .btn, .sak32009 .btn-check:active + .btn, .sak32009 .btn:active, .sak32009 .btn.active, .sak32009 .btn.show {
  color: var(--bs-btn-active-color);
  background-color: var(--bs-btn-active-bg);
  border-color: var(--bs-btn-active-border-color);
}
.sak32009 .btn-check:checked + .btn:focus, .sak32009 .btn-check:active + .btn:focus, .sak32009 .btn:active:focus, .sak32009 .btn.active:focus, .sak32009 .btn.show:focus {
  box-shadow: var(--bs-btn-focus-box-shadow);
}
.sak32009 .btn:disabled, .sak32009 .btn.disabled, .sak32009 fieldset:disabled .btn {
  color: var(--bs-btn-disabled-color);
  pointer-events: none;
  background-color: var(--bs-btn-disabled-bg);
  border-color: var(--bs-btn-disabled-border-color);
  opacity: var(--bs-btn-disabled-opacity);
}
.sak32009 .btn-primary {
  --bs-btn-color: #fff;
  --bs-btn-bg: #0d6efd;
  --bs-btn-border-color: #0d6efd;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #0b5ed7;
  --bs-btn-hover-border-color: #0a58ca;
  --bs-btn-focus-shadow-rgb: 49, 132, 253;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #0a58ca;
  --bs-btn-active-border-color: #0a53be;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #0d6efd;
  --bs-btn-disabled-border-color: #0d6efd;
}
.sak32009 .btn-secondary {
  --bs-btn-color: #fff;
  --bs-btn-bg: #6c757d;
  --bs-btn-border-color: #6c757d;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #5c636a;
  --bs-btn-hover-border-color: #565e64;
  --bs-btn-focus-shadow-rgb: 130, 138, 145;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #565e64;
  --bs-btn-active-border-color: #51585e;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #6c757d;
  --bs-btn-disabled-border-color: #6c757d;
}
.sak32009 .btn-success {
  --bs-btn-color: #fff;
  --bs-btn-bg: #198754;
  --bs-btn-border-color: #198754;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #157347;
  --bs-btn-hover-border-color: #146c43;
  --bs-btn-focus-shadow-rgb: 60, 153, 110;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #146c43;
  --bs-btn-active-border-color: #13653f;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #198754;
  --bs-btn-disabled-border-color: #198754;
}
.sak32009 .btn-info {
  --bs-btn-color: #000;
  --bs-btn-bg: #0dcaf0;
  --bs-btn-border-color: #0dcaf0;
  --bs-btn-hover-color: #000;
  --bs-btn-hover-bg: #31d2f2;
  --bs-btn-hover-border-color: #25cff2;
  --bs-btn-focus-shadow-rgb: 11, 172, 204;
  --bs-btn-active-color: #000;
  --bs-btn-active-bg: #3dd5f3;
  --bs-btn-active-border-color: #25cff2;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #000;
  --bs-btn-disabled-bg: #0dcaf0;
  --bs-btn-disabled-border-color: #0dcaf0;
}
.sak32009 .btn-warning {
  --bs-btn-color: #000;
  --bs-btn-bg: #ffc107;
  --bs-btn-border-color: #ffc107;
  --bs-btn-hover-color: #000;
  --bs-btn-hover-bg: #ffca2c;
  --bs-btn-hover-border-color: #ffc720;
  --bs-btn-focus-shadow-rgb: 217, 164, 6;
  --bs-btn-active-color: #000;
  --bs-btn-active-bg: #ffcd39;
  --bs-btn-active-border-color: #ffc720;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #000;
  --bs-btn-disabled-bg: #ffc107;
  --bs-btn-disabled-border-color: #ffc107;
}
.sak32009 .btn-danger {
  --bs-btn-color: #fff;
  --bs-btn-bg: #dc3545;
  --bs-btn-border-color: #dc3545;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #bb2d3b;
  --bs-btn-hover-border-color: #b02a37;
  --bs-btn-focus-shadow-rgb: 225, 83, 97;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #b02a37;
  --bs-btn-active-border-color: #a52834;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #dc3545;
  --bs-btn-disabled-border-color: #dc3545;
}
.sak32009 .btn-light {
  --bs-btn-color: #000;
  --bs-btn-bg: #f8f9fa;
  --bs-btn-border-color: #f8f9fa;
  --bs-btn-hover-color: #000;
  --bs-btn-hover-bg: #f9fafb;
  --bs-btn-hover-border-color: #f9fafb;
  --bs-btn-focus-shadow-rgb: 211, 212, 213;
  --bs-btn-active-color: #000;
  --bs-btn-active-bg: #f9fafb;
  --bs-btn-active-border-color: #f9fafb;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #000;
  --bs-btn-disabled-bg: #f8f9fa;
  --bs-btn-disabled-border-color: #f8f9fa;
}
.sak32009 .btn-dark {
  --bs-btn-color: #fff;
  --bs-btn-bg: #212529;
  --bs-btn-border-color: #212529;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #1c1f23;
  --bs-btn-hover-border-color: #1a1e21;
  --bs-btn-focus-shadow-rgb: 66, 70, 73;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #1a1e21;
  --bs-btn-active-border-color: #191c1f;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #212529;
  --bs-btn-disabled-border-color: #212529;
}
.sak32009 .btn-sake {
  --bs-btn-color: #fff;
  --bs-btn-bg: #4b2e52;
  --bs-btn-border-color: #4b2e52;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #402746;
  --bs-btn-hover-border-color: #3c2542;
  --bs-btn-focus-shadow-rgb: 102, 77, 108;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #3c2542;
  --bs-btn-active-border-color: #38233e;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #4b2e52;
  --bs-btn-disabled-border-color: #4b2e52;
}
.sak32009 .btn-outline-primary {
  --bs-btn-color: #0d6efd;
  --bs-btn-border-color: #0d6efd;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #0d6efd;
  --bs-btn-hover-border-color: #0d6efd;
  --bs-btn-focus-shadow-rgb: 13, 110, 253;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #0d6efd;
  --bs-btn-active-border-color: #0d6efd;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #0d6efd;
  --bs-btn-disabled-bg: transparent;
  --bs-gradient: none;
}
.sak32009 .btn-outline-secondary {
  --bs-btn-color: #6c757d;
  --bs-btn-border-color: #6c757d;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #6c757d;
  --bs-btn-hover-border-color: #6c757d;
  --bs-btn-focus-shadow-rgb: 108, 117, 125;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #6c757d;
  --bs-btn-active-border-color: #6c757d;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #6c757d;
  --bs-btn-disabled-bg: transparent;
  --bs-gradient: none;
}
.sak32009 .btn-outline-success {
  --bs-btn-color: #198754;
  --bs-btn-border-color: #198754;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #198754;
  --bs-btn-hover-border-color: #198754;
  --bs-btn-focus-shadow-rgb: 25, 135, 84;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #198754;
  --bs-btn-active-border-color: #198754;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #198754;
  --bs-btn-disabled-bg: transparent;
  --bs-gradient: none;
}
.sak32009 .btn-outline-info {
  --bs-btn-color: #0dcaf0;
  --bs-btn-border-color: #0dcaf0;
  --bs-btn-hover-color: #000;
  --bs-btn-hover-bg: #0dcaf0;
  --bs-btn-hover-border-color: #0dcaf0;
  --bs-btn-focus-shadow-rgb: 13, 202, 240;
  --bs-btn-active-color: #000;
  --bs-btn-active-bg: #0dcaf0;
  --bs-btn-active-border-color: #0dcaf0;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #0dcaf0;
  --bs-btn-disabled-bg: transparent;
  --bs-gradient: none;
}
.sak32009 .btn-outline-warning {
  --bs-btn-color: #ffc107;
  --bs-btn-border-color: #ffc107;
  --bs-btn-hover-color: #000;
  --bs-btn-hover-bg: #ffc107;
  --bs-btn-hover-border-color: #ffc107;
  --bs-btn-focus-shadow-rgb: 255, 193, 7;
  --bs-btn-active-color: #000;
  --bs-btn-active-bg: #ffc107;
  --bs-btn-active-border-color: #ffc107;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #ffc107;
  --bs-btn-disabled-bg: transparent;
  --bs-gradient: none;
}
.sak32009 .btn-outline-danger {
  --bs-btn-color: #dc3545;
  --bs-btn-border-color: #dc3545;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #dc3545;
  --bs-btn-hover-border-color: #dc3545;
  --bs-btn-focus-shadow-rgb: 220, 53, 69;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #dc3545;
  --bs-btn-active-border-color: #dc3545;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #dc3545;
  --bs-btn-disabled-bg: transparent;
  --bs-gradient: none;
}
.sak32009 .btn-outline-light {
  --bs-btn-color: #f8f9fa;
  --bs-btn-border-color: #f8f9fa;
  --bs-btn-hover-color: #000;
  --bs-btn-hover-bg: #f8f9fa;
  --bs-btn-hover-border-color: #f8f9fa;
  --bs-btn-focus-shadow-rgb: 248, 249, 250;
  --bs-btn-active-color: #000;
  --bs-btn-active-bg: #f8f9fa;
  --bs-btn-active-border-color: #f8f9fa;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #f8f9fa;
  --bs-btn-disabled-bg: transparent;
  --bs-gradient: none;
}
.sak32009 .btn-outline-dark {
  --bs-btn-color: #212529;
  --bs-btn-border-color: #212529;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #212529;
  --bs-btn-hover-border-color: #212529;
  --bs-btn-focus-shadow-rgb: 33, 37, 41;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #212529;
  --bs-btn-active-border-color: #212529;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #212529;
  --bs-btn-disabled-bg: transparent;
  --bs-gradient: none;
}
.sak32009 .btn-outline-sake {
  --bs-btn-color: #4b2e52;
  --bs-btn-border-color: #4b2e52;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #4b2e52;
  --bs-btn-hover-border-color: #4b2e52;
  --bs-btn-focus-shadow-rgb: 75, 46, 82;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #4b2e52;
  --bs-btn-active-border-color: #4b2e52;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #4b2e52;
  --bs-btn-disabled-bg: transparent;
  --bs-gradient: none;
}
.sak32009 .btn-link {
  --bs-btn-font-weight: 400;
  --bs-btn-color: var(--bs-link-color);
  --bs-btn-bg: transparent;
  --bs-btn-border-color: transparent;
  --bs-btn-hover-color: var(--bs-link-hover-color);
  --bs-btn-hover-border-color: transparent;
  --bs-btn-active-border-color: transparent;
  --bs-btn-disabled-color: #6c757d;
  --bs-btn-disabled-border-color: transparent;
  --bs-btn-box-shadow: none;
  text-decoration: underline;
}
.sak32009 .btn-lg {
  --bs-btn-padding-y: 0.5rem;
  --bs-btn-padding-x: 1rem;
  --bs-btn-font-size: 1.25rem;
  --bs-btn-border-radius: 0.5rem;
}
.sak32009 .btn-sm {
  --bs-btn-padding-y: 0.25rem;
  --bs-btn-padding-x: 0.5rem;
  --bs-btn-font-size: 0.875rem;
  --bs-btn-border-radius: 0.25rem;
}
.sak32009 .fade {
  transition: opacity 0.15s linear;
}
@media (prefers-reduced-motion: reduce) {
  .sak32009 .fade {
    transition: none;
  }
}
.sak32009 .fade:not(.show) {
  opacity: 0;
}
.sak32009 .collapse:not(.show) {
  display: none;
}
.sak32009 .collapsing {
  height: 0;
  overflow: hidden;
  transition: height 0.35s ease;
}
@media (prefers-reduced-motion: reduce) {
  .sak32009 .collapsing {
    transition: none;
  }
}
.sak32009 .collapsing.collapse-horizontal {
  width: 0;
  height: auto;
  transition: width 0.35s ease;
}
@media (prefers-reduced-motion: reduce) {
  .sak32009 .collapsing.collapse-horizontal {
    transition: none;
  }
}
.sak32009 .modal {
  --bs-modal-zindex: 1055;
  --bs-modal-width: 500px;
  --bs-modal-padding: 1rem;
  --bs-modal-margin: 0.5rem;
  --bs-modal-color: ;
  --bs-modal-bg: #fff;
  --bs-modal-border-color: var(--bs-border-color-translucent);
  --bs-modal-border-width: 1px;
  --bs-modal-border-radius: 0.5rem;
  --bs-modal-box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  --bs-modal-inner-border-radius: calc(0.5rem - 1px);
  --bs-modal-header-padding-x: 1rem;
  --bs-modal-header-padding-y: 1rem;
  --bs-modal-header-padding: 1rem 1rem;
  --bs-modal-header-border-color: var(--bs-border-color);
  --bs-modal-header-border-width: 1px;
  --bs-modal-title-line-height: 1.5;
  --bs-modal-footer-gap: 0.5rem;
  --bs-modal-footer-bg: ;
  --bs-modal-footer-border-color: var(--bs-border-color);
  --bs-modal-footer-border-width: 1px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--bs-modal-zindex);
  display: none;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  outline: 0;
}
.sak32009 .modal-dialog {
  position: relative;
  width: auto;
  margin: var(--bs-modal-margin);
  pointer-events: none;
}
.sak32009 .modal.fade .modal-dialog {
  transition: transform 0.3s ease-out;
  transform: translate(0, -50px);
}
@media (prefers-reduced-motion: reduce) {
  .sak32009 .modal.fade .modal-dialog {
    transition: none;
  }
}
.sak32009 .modal.show .modal-dialog {
  transform: none;
}
.sak32009 .modal.modal-static .modal-dialog {
  transform: scale(1.02);
}
.sak32009 .modal-dialog-scrollable {
  height: calc(100% - var(--bs-modal-margin) * 2);
}
.sak32009 .modal-dialog-scrollable .modal-content {
  max-height: 100%;
  overflow: hidden;
}
.sak32009 .modal-dialog-scrollable .modal-body {
  overflow-y: auto;
}
.sak32009 .modal-dialog-centered {
  display: flex;
  align-items: center;
  min-height: calc(100% - var(--bs-modal-margin) * 2);
}
.sak32009 .modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  color: var(--bs-modal-color);
  pointer-events: auto;
  background-color: var(--bs-modal-bg);
  background-clip: padding-box;
  border: var(--bs-modal-border-width) solid var(--bs-modal-border-color);
  border-radius: var(--bs-modal-border-radius);
  outline: 0;
}
.modal-backdrop {
  --bs-backdrop-zindex: 1050;
  --bs-backdrop-bg: #000;
  --bs-backdrop-opacity: 0.5;
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--bs-backdrop-zindex);
  width: 100vw;
  height: 100vh;
  background-color: var(--bs-backdrop-bg);
}
.modal-backdrop.fade {
  opacity: 0;
}
.modal-backdrop.show {
  opacity: var(--bs-backdrop-opacity);
}
.sak32009 .modal-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: var(--bs-modal-header-padding);
  border-bottom: var(--bs-modal-header-border-width) solid var(--bs-modal-header-border-color);
  border-top-left-radius: var(--bs-modal-inner-border-radius);
  border-top-right-radius: var(--bs-modal-inner-border-radius);
}
.sak32009 .modal-header .btn-close {
  padding: calc(var(--bs-modal-header-padding-y) * 0.5) calc(var(--bs-modal-header-padding-x) * 0.5);
  margin: calc(var(--bs-modal-header-padding-y) * -0.5) calc(var(--bs-modal-header-padding-x) * -0.5) calc(var(--bs-modal-header-padding-y) * -0.5) auto;
}
.sak32009 .modal-title {
  margin-bottom: 0;
  line-height: var(--bs-modal-title-line-height);
}
.sak32009 .modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: var(--bs-modal-padding);
}
.sak32009 .modal-footer {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  padding: calc(var(--bs-modal-padding) - var(--bs-modal-footer-gap) * 0.5);
  background-color: var(--bs-modal-footer-bg);
  border-top: var(--bs-modal-footer-border-width) solid var(--bs-modal-footer-border-color);
  border-bottom-right-radius: var(--bs-modal-inner-border-radius);
  border-bottom-left-radius: var(--bs-modal-inner-border-radius);
}
.sak32009 .modal-footer > * {
  margin: calc(var(--bs-modal-footer-gap) * 0.5);
}
@media (min-width: 576px) {
  .sak32009 .modal {
    --bs-modal-margin: 1.75rem;
    --bs-modal-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }
  .sak32009 .modal-dialog {
    max-width: var(--bs-modal-width);
    margin-right: auto;
    margin-left: auto;
  }
  .sak32009 .modal-sm {
    --bs-modal-width: 300px;
  }
}
@media (min-width: 992px) {
  .sak32009 .modal-lg,
.sak32009 .modal-xl {
    --bs-modal-width: 800px;
  }
}
@media (min-width: 1200px) {
  .sak32009 .modal-xl {
    --bs-modal-width: 1140px;
  }
}
.sak32009 .modal-fullscreen {
  width: 100vw;
  max-width: none;
  height: 100%;
  margin: 0;
}
.sak32009 .modal-fullscreen .modal-content {
  height: 100%;
  border: 0;
  border-radius: 0;
}
.sak32009 .modal-fullscreen .modal-header,
.sak32009 .modal-fullscreen .modal-footer {
  border-radius: 0;
}
.sak32009 .modal-fullscreen .modal-body {
  overflow-y: auto;
}
@media (max-width: 575.98px) {
  .sak32009 .modal-fullscreen-sm-down {
    width: 100vw;
    max-width: none;
    height: 100%;
    margin: 0;
  }
  .sak32009 .modal-fullscreen-sm-down .modal-content {
    height: 100%;
    border: 0;
    border-radius: 0;
  }
  .sak32009 .modal-fullscreen-sm-down .modal-header,
.sak32009 .modal-fullscreen-sm-down .modal-footer {
    border-radius: 0;
  }
  .sak32009 .modal-fullscreen-sm-down .modal-body {
    overflow-y: auto;
  }
}
@media (max-width: 767.98px) {
  .sak32009 .modal-fullscreen-md-down {
    width: 100vw;
    max-width: none;
    height: 100%;
    margin: 0;
  }
  .sak32009 .modal-fullscreen-md-down .modal-content {
    height: 100%;
    border: 0;
    border-radius: 0;
  }
  .sak32009 .modal-fullscreen-md-down .modal-header,
.sak32009 .modal-fullscreen-md-down .modal-footer {
    border-radius: 0;
  }
  .sak32009 .modal-fullscreen-md-down .modal-body {
    overflow-y: auto;
  }
}
@media (max-width: 991.98px) {
  .sak32009 .modal-fullscreen-lg-down {
    width: 100vw;
    max-width: none;
    height: 100%;
    margin: 0;
  }
  .sak32009 .modal-fullscreen-lg-down .modal-content {
    height: 100%;
    border: 0;
    border-radius: 0;
  }
  .sak32009 .modal-fullscreen-lg-down .modal-header,
.sak32009 .modal-fullscreen-lg-down .modal-footer {
    border-radius: 0;
  }
  .sak32009 .modal-fullscreen-lg-down .modal-body {
    overflow-y: auto;
  }
}
@media (max-width: 1199.98px) {
  .sak32009 .modal-fullscreen-xl-down {
    width: 100vw;
    max-width: none;
    height: 100%;
    margin: 0;
  }
  .sak32009 .modal-fullscreen-xl-down .modal-content {
    height: 100%;
    border: 0;
    border-radius: 0;
  }
  .sak32009 .modal-fullscreen-xl-down .modal-header,
.sak32009 .modal-fullscreen-xl-down .modal-footer {
    border-radius: 0;
  }
  .sak32009 .modal-fullscreen-xl-down .modal-body {
    overflow-y: auto;
  }
}
@media (max-width: 1399.98px) {
  .sak32009 .modal-fullscreen-xxl-down {
    width: 100vw;
    max-width: none;
    height: 100%;
    margin: 0;
  }
  .sak32009 .modal-fullscreen-xxl-down .modal-content {
    height: 100%;
    border: 0;
    border-radius: 0;
  }
  .sak32009 .modal-fullscreen-xxl-down .modal-header,
.sak32009 .modal-fullscreen-xxl-down .modal-footer {
    border-radius: 0;
  }
  .sak32009 .modal-fullscreen-xxl-down .modal-body {
    overflow-y: auto;
  }
}
.sak32009 .clearfix::after {
  display: block;
  clear: both;
  content: "";
}
.sak32009 .text-bg-primary {
  color: #fff !important;
  background-color: RGBA(13, 110, 253, var(--bs-bg-opacity, 1)) !important;
}
.sak32009 .text-bg-secondary {
  color: #fff !important;
  background-color: RGBA(108, 117, 125, var(--bs-bg-opacity, 1)) !important;
}
.sak32009 .text-bg-success {
  color: #fff !important;
  background-color: RGBA(25, 135, 84, var(--bs-bg-opacity, 1)) !important;
}
.sak32009 .text-bg-info {
  color: #000 !important;
  background-color: RGBA(13, 202, 240, var(--bs-bg-opacity, 1)) !important;
}
.sak32009 .text-bg-warning {
  color: #000 !important;
  background-color: RGBA(255, 193, 7, var(--bs-bg-opacity, 1)) !important;
}
.sak32009 .text-bg-danger {
  color: #fff !important;
  background-color: RGBA(220, 53, 69, var(--bs-bg-opacity, 1)) !important;
}
.sak32009 .text-bg-light {
  color: #000 !important;
  background-color: RGBA(248, 249, 250, var(--bs-bg-opacity, 1)) !important;
}
.sak32009 .text-bg-dark {
  color: #fff !important;
  background-color: RGBA(33, 37, 41, var(--bs-bg-opacity, 1)) !important;
}
.sak32009 .text-bg-sake {
  color: #fff !important;
  background-color: RGBA(75, 46, 82, var(--bs-bg-opacity, 1)) !important;
}
.sak32009 .link-primary {
  color: #0d6efd !important;
}
.sak32009 .link-primary:hover, .sak32009 .link-primary:focus {
  color: #0a58ca !important;
}
.sak32009 .link-secondary {
  color: #6c757d !important;
}
.sak32009 .link-secondary:hover, .sak32009 .link-secondary:focus {
  color: #565e64 !important;
}
.sak32009 .link-success {
  color: #198754 !important;
}
.sak32009 .link-success:hover, .sak32009 .link-success:focus {
  color: #146c43 !important;
}
.sak32009 .link-info {
  color: #0dcaf0 !important;
}
.sak32009 .link-info:hover, .sak32009 .link-info:focus {
  color: #3dd5f3 !important;
}
.sak32009 .link-warning {
  color: #ffc107 !important;
}
.sak32009 .link-warning:hover, .sak32009 .link-warning:focus {
  color: #ffcd39 !important;
}
.sak32009 .link-danger {
  color: #dc3545 !important;
}
.sak32009 .link-danger:hover, .sak32009 .link-danger:focus {
  color: #b02a37 !important;
}
.sak32009 .link-light {
  color: #f8f9fa !important;
}
.sak32009 .link-light:hover, .sak32009 .link-light:focus {
  color: #f9fafb !important;
}
.sak32009 .link-dark {
  color: #212529 !important;
}
.sak32009 .link-dark:hover, .sak32009 .link-dark:focus {
  color: #1a1e21 !important;
}
.sak32009 .link-sake {
  color: #4b2e52 !important;
}
.sak32009 .link-sake:hover, .sak32009 .link-sake:focus {
  color: #3c2542 !important;
}
.sak32009 .ratio {
  position: relative;
  width: 100%;
}
.sak32009 .ratio::before {
  display: block;
  padding-top: var(--bs-aspect-ratio);
  content: "";
}
.sak32009 .ratio > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.sak32009 .ratio-1x1 {
  --bs-aspect-ratio: 100%;
}
.sak32009 .ratio-4x3 {
  --bs-aspect-ratio: 75%;
}
.sak32009 .ratio-16x9 {
  --bs-aspect-ratio: 56.25%;
}
.sak32009 .ratio-21x9 {
  --bs-aspect-ratio: 42.8571428571%;
}
.sak32009 .fixed-top {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1030;
}
.sak32009 .fixed-bottom {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1030;
}
.sak32009 .sticky-top {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 1020;
}
.sak32009 .sticky-bottom {
  position: -webkit-sticky;
  position: sticky;
  bottom: 0;
  z-index: 1020;
}
@media (min-width: 576px) {
  .sak32009 .sticky-sm-top {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1020;
  }
  .sak32009 .sticky-sm-bottom {
    position: -webkit-sticky;
    position: sticky;
    bottom: 0;
    z-index: 1020;
  }
}
@media (min-width: 768px) {
  .sak32009 .sticky-md-top {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1020;
  }
  .sak32009 .sticky-md-bottom {
    position: -webkit-sticky;
    position: sticky;
    bottom: 0;
    z-index: 1020;
  }
}
@media (min-width: 992px) {
  .sak32009 .sticky-lg-top {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1020;
  }
  .sak32009 .sticky-lg-bottom {
    position: -webkit-sticky;
    position: sticky;
    bottom: 0;
    z-index: 1020;
  }
}
@media (min-width: 1200px) {
  .sak32009 .sticky-xl-top {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1020;
  }
  .sak32009 .sticky-xl-bottom {
    position: -webkit-sticky;
    position: sticky;
    bottom: 0;
    z-index: 1020;
  }
}
@media (min-width: 1400px) {
  .sak32009 .sticky-xxl-top {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1020;
  }
  .sak32009 .sticky-xxl-bottom {
    position: -webkit-sticky;
    position: sticky;
    bottom: 0;
    z-index: 1020;
  }
}
.sak32009 .hstack {
  display: flex;
  flex-direction: row;
  align-items: center;
  align-self: stretch;
}
.sak32009 .vstack {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-self: stretch;
}
.sak32009 .visually-hidden,
.sak32009 .visually-hidden-focusable:not(:focus):not(:focus-within) {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
.sak32009 .stretched-link::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  content: "";
}
.sak32009 .text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sak32009 .vr {
  display: inline-block;
  align-self: stretch;
  width: 1px;
  min-height: 1em;
  background-color: currentcolor;
  opacity: 0.25;
}
.sak32009 .align-baseline {
  vertical-align: baseline !important;
}
.sak32009 .align-top {
  vertical-align: top !important;
}
.sak32009 .align-middle {
  vertical-align: middle !important;
}
.sak32009 .align-bottom {
  vertical-align: bottom !important;
}
.sak32009 .align-text-bottom {
  vertical-align: text-bottom !important;
}
.sak32009 .align-text-top {
  vertical-align: text-top !important;
}
.sak32009 .float-start {
  float: left !important;
}
.sak32009 .float-end {
  float: right !important;
}
.sak32009 .float-none {
  float: none !important;
}
.sak32009 .opacity-0 {
  opacity: 0 !important;
}
.sak32009 .opacity-25 {
  opacity: 0.25 !important;
}
.sak32009 .opacity-50 {
  opacity: 0.5 !important;
}
.sak32009 .opacity-75 {
  opacity: 0.75 !important;
}
.sak32009 .opacity-100 {
  opacity: 1 !important;
}
.sak32009 .overflow-auto {
  overflow: auto !important;
}
.sak32009 .overflow-hidden {
  overflow: hidden !important;
}
.sak32009 .overflow-visible {
  overflow: visible !important;
}
.sak32009 .overflow-scroll {
  overflow: scroll !important;
}
.sak32009 .d-inline {
  display: inline !important;
}
.sak32009 .d-inline-block {
  display: inline-block !important;
}
.sak32009 .d-block {
  display: block !important;
}
.sak32009 .d-grid {
  display: grid !important;
}
.sak32009 .d-table {
  display: table !important;
}
.sak32009 .d-table-row {
  display: table-row !important;
}
.sak32009 .d-table-cell {
  display: table-cell !important;
}
.sak32009 .d-flex {
  display: flex !important;
}
.sak32009 .d-inline-flex {
  display: inline-flex !important;
}
.sak32009 .d-none {
  display: none !important;
}
.sak32009 .shadow {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
.sak32009 .shadow-sm {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}
.sak32009 .shadow-lg {
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
}
.sak32009 .shadow-none {
  box-shadow: none !important;
}
.sak32009 .position-static {
  position: static !important;
}
.sak32009 .position-relative {
  position: relative !important;
}
.sak32009 .position-absolute {
  position: absolute !important;
}
.sak32009 .position-fixed {
  position: fixed !important;
}
.sak32009 .position-sticky {
  position: -webkit-sticky !important;
  position: sticky !important;
}
.sak32009 .top-0 {
  top: 0 !important;
}
.sak32009 .top-50 {
  top: 50% !important;
}
.sak32009 .top-100 {
  top: 100% !important;
}
.sak32009 .bottom-0 {
  bottom: 0 !important;
}
.sak32009 .bottom-50 {
  bottom: 50% !important;
}
.sak32009 .bottom-100 {
  bottom: 100% !important;
}
.sak32009 .start-0 {
  left: 0 !important;
}
.sak32009 .start-50 {
  left: 50% !important;
}
.sak32009 .start-100 {
  left: 100% !important;
}
.sak32009 .end-0 {
  right: 0 !important;
}
.sak32009 .end-50 {
  right: 50% !important;
}
.sak32009 .end-100 {
  right: 100% !important;
}
.sak32009 .translate-middle {
  transform: translate(-50%, -50%) !important;
}
.sak32009 .translate-middle-x {
  transform: translateX(-50%) !important;
}
.sak32009 .translate-middle-y {
  transform: translateY(-50%) !important;
}
.sak32009 .border {
  border: var(--bs-border-width) var(--bs-border-style) var(--bs-border-color) !important;
}
.sak32009 .border-0 {
  border: 0 !important;
}
.sak32009 .border-top {
  border-top: var(--bs-border-width) var(--bs-border-style) var(--bs-border-color) !important;
}
.sak32009 .border-top-0 {
  border-top: 0 !important;
}
.sak32009 .border-end {
  border-right: var(--bs-border-width) var(--bs-border-style) var(--bs-border-color) !important;
}
.sak32009 .border-end-0 {
  border-right: 0 !important;
}
.sak32009 .border-bottom {
  border-bottom: var(--bs-border-width) var(--bs-border-style) var(--bs-border-color) !important;
}
.sak32009 .border-bottom-0 {
  border-bottom: 0 !important;
}
.sak32009 .border-start {
  border-left: var(--bs-border-width) var(--bs-border-style) var(--bs-border-color) !important;
}
.sak32009 .border-start-0 {
  border-left: 0 !important;
}
.sak32009 .border-primary {
  --bs-border-opacity: 1;
  border-color: rgba(var(--bs-primary-rgb), var(--bs-border-opacity)) !important;
}
.sak32009 .border-secondary {
  --bs-border-opacity: 1;
  border-color: rgba(var(--bs-secondary-rgb), var(--bs-border-opacity)) !important;
}
.sak32009 .border-success {
  --bs-border-opacity: 1;
  border-color: rgba(var(--bs-success-rgb), var(--bs-border-opacity)) !important;
}
.sak32009 .border-info {
  --bs-border-opacity: 1;
  border-color: rgba(var(--bs-info-rgb), var(--bs-border-opacity)) !important;
}
.sak32009 .border-warning {
  --bs-border-opacity: 1;
  border-color: rgba(var(--bs-warning-rgb), var(--bs-border-opacity)) !important;
}
.sak32009 .border-danger {
  --bs-border-opacity: 1;
  border-color: rgba(var(--bs-danger-rgb), var(--bs-border-opacity)) !important;
}
.sak32009 .border-light {
  --bs-border-opacity: 1;
  border-color: rgba(var(--bs-light-rgb), var(--bs-border-opacity)) !important;
}
.sak32009 .border-dark {
  --bs-border-opacity: 1;
  border-color: rgba(var(--bs-dark-rgb), var(--bs-border-opacity)) !important;
}
.sak32009 .border-sake {
  --bs-border-opacity: 1;
  border-color: rgba(var(--bs-sake-rgb), var(--bs-border-opacity)) !important;
}
.sak32009 .border-white {
  --bs-border-opacity: 1;
  border-color: rgba(var(--bs-white-rgb), var(--bs-border-opacity)) !important;
}
.sak32009 .border-1 {
  --bs-border-width: 1px;
}
.sak32009 .border-2 {
  --bs-border-width: 2px;
}
.sak32009 .border-3 {
  --bs-border-width: 3px;
}
.sak32009 .border-4 {
  --bs-border-width: 4px;
}
.sak32009 .border-5 {
  --bs-border-width: 5px;
}
.sak32009 .border-opacity-10 {
  --bs-border-opacity: 0.1;
}
.sak32009 .border-opacity-25 {
  --bs-border-opacity: 0.25;
}
.sak32009 .border-opacity-50 {
  --bs-border-opacity: 0.5;
}
.sak32009 .border-opacity-75 {
  --bs-border-opacity: 0.75;
}
.sak32009 .border-opacity-100 {
  --bs-border-opacity: 1;
}
.sak32009 .w-25 {
  width: 25% !important;
}
.sak32009 .w-50 {
  width: 50% !important;
}
.sak32009 .w-75 {
  width: 75% !important;
}
.sak32009 .w-100 {
  width: 100% !important;
}
.sak32009 .w-auto {
  width: auto !important;
}
.sak32009 .mw-100 {
  max-width: 100% !important;
}
.sak32009 .vw-100 {
  width: 100vw !important;
}
.sak32009 .min-vw-100 {
  min-width: 100vw !important;
}
.sak32009 .h-25 {
  height: 25% !important;
}
.sak32009 .h-50 {
  height: 50% !important;
}
.sak32009 .h-75 {
  height: 75% !important;
}
.sak32009 .h-100 {
  height: 100% !important;
}
.sak32009 .h-auto {
  height: auto !important;
}
.sak32009 .mh-100 {
  max-height: 100% !important;
}
.sak32009 .vh-100 {
  height: 100vh !important;
}
.sak32009 .min-vh-100 {
  min-height: 100vh !important;
}
.sak32009 .flex-fill {
  flex: 1 1 auto !important;
}
.sak32009 .flex-row {
  flex-direction: row !important;
}
.sak32009 .flex-column {
  flex-direction: column !important;
}
.sak32009 .flex-row-reverse {
  flex-direction: row-reverse !important;
}
.sak32009 .flex-column-reverse {
  flex-direction: column-reverse !important;
}
.sak32009 .flex-grow-0 {
  flex-grow: 0 !important;
}
.sak32009 .flex-grow-1 {
  flex-grow: 1 !important;
}
.sak32009 .flex-shrink-0 {
  flex-shrink: 0 !important;
}
.sak32009 .flex-shrink-1 {
  flex-shrink: 1 !important;
}
.sak32009 .flex-wrap {
  flex-wrap: wrap !important;
}
.sak32009 .flex-nowrap {
  flex-wrap: nowrap !important;
}
.sak32009 .flex-wrap-reverse {
  flex-wrap: wrap-reverse !important;
}
.sak32009 .justify-content-start {
  justify-content: flex-start !important;
}
.sak32009 .justify-content-end {
  justify-content: flex-end !important;
}
.sak32009 .justify-content-center {
  justify-content: center !important;
}
.sak32009 .justify-content-between {
  justify-content: space-between !important;
}
.sak32009 .justify-content-around {
  justify-content: space-around !important;
}
.sak32009 .justify-content-evenly {
  justify-content: space-evenly !important;
}
.sak32009 .align-items-start {
  align-items: flex-start !important;
}
.sak32009 .align-items-end {
  align-items: flex-end !important;
}
.sak32009 .align-items-center {
  align-items: center !important;
}
.sak32009 .align-items-baseline {
  align-items: baseline !important;
}
.sak32009 .align-items-stretch {
  align-items: stretch !important;
}
.sak32009 .align-content-start {
  align-content: flex-start !important;
}
.sak32009 .align-content-end {
  align-content: flex-end !important;
}
.sak32009 .align-content-center {
  align-content: center !important;
}
.sak32009 .align-content-between {
  align-content: space-between !important;
}
.sak32009 .align-content-around {
  align-content: space-around !important;
}
.sak32009 .align-content-stretch {
  align-content: stretch !important;
}
.sak32009 .align-self-auto {
  align-self: auto !important;
}
.sak32009 .align-self-start {
  align-self: flex-start !important;
}
.sak32009 .align-self-end {
  align-self: flex-end !important;
}
.sak32009 .align-self-center {
  align-self: center !important;
}
.sak32009 .align-self-baseline {
  align-self: baseline !important;
}
.sak32009 .align-self-stretch {
  align-self: stretch !important;
}
.sak32009 .order-first {
  order: -1 !important;
}
.sak32009 .order-0 {
  order: 0 !important;
}
.sak32009 .order-1 {
  order: 1 !important;
}
.sak32009 .order-2 {
  order: 2 !important;
}
.sak32009 .order-3 {
  order: 3 !important;
}
.sak32009 .order-4 {
  order: 4 !important;
}
.sak32009 .order-5 {
  order: 5 !important;
}
.sak32009 .order-last {
  order: 6 !important;
}
.sak32009 .m-0 {
  margin: 0 !important;
}
.sak32009 .m-1 {
  margin: 0.25rem !important;
}
.sak32009 .m-2 {
  margin: 0.5rem !important;
}
.sak32009 .m-3 {
  margin: 1rem !important;
}
.sak32009 .m-4 {
  margin: 1.5rem !important;
}
.sak32009 .m-5 {
  margin: 3rem !important;
}
.sak32009 .m-auto {
  margin: auto !important;
}
.sak32009 .mx-0 {
  margin-right: 0 !important;
  margin-left: 0 !important;
}
.sak32009 .mx-1 {
  margin-right: 0.25rem !important;
  margin-left: 0.25rem !important;
}
.sak32009 .mx-2 {
  margin-right: 0.5rem !important;
  margin-left: 0.5rem !important;
}
.sak32009 .mx-3 {
  margin-right: 1rem !important;
  margin-left: 1rem !important;
}
.sak32009 .mx-4 {
  margin-right: 1.5rem !important;
  margin-left: 1.5rem !important;
}
.sak32009 .mx-5 {
  margin-right: 3rem !important;
  margin-left: 3rem !important;
}
.sak32009 .mx-auto {
  margin-right: auto !important;
  margin-left: auto !important;
}
.sak32009 .my-0 {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
.sak32009 .my-1 {
  margin-top: 0.25rem !important;
  margin-bottom: 0.25rem !important;
}
.sak32009 .my-2 {
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
}
.sak32009 .my-3 {
  margin-top: 1rem !important;
  margin-bottom: 1rem !important;
}
.sak32009 .my-4 {
  margin-top: 1.5rem !important;
  margin-bottom: 1.5rem !important;
}
.sak32009 .my-5 {
  margin-top: 3rem !important;
  margin-bottom: 3rem !important;
}
.sak32009 .my-auto {
  margin-top: auto !important;
  margin-bottom: auto !important;
}
.sak32009 .mt-0 {
  margin-top: 0 !important;
}
.sak32009 .mt-1 {
  margin-top: 0.25rem !important;
}
.sak32009 .mt-2 {
  margin-top: 0.5rem !important;
}
.sak32009 .mt-3 {
  margin-top: 1rem !important;
}
.sak32009 .mt-4 {
  margin-top: 1.5rem !important;
}
.sak32009 .mt-5 {
  margin-top: 3rem !important;
}
.sak32009 .mt-auto {
  margin-top: auto !important;
}
.sak32009 .me-0 {
  margin-right: 0 !important;
}
.sak32009 .me-1 {
  margin-right: 0.25rem !important;
}
.sak32009 .me-2 {
  margin-right: 0.5rem !important;
}
.sak32009 .me-3 {
  margin-right: 1rem !important;
}
.sak32009 .me-4 {
  margin-right: 1.5rem !important;
}
.sak32009 .me-5 {
  margin-right: 3rem !important;
}
.sak32009 .me-auto {
  margin-right: auto !important;
}
.sak32009 .mb-0 {
  margin-bottom: 0 !important;
}
.sak32009 .mb-1 {
  margin-bottom: 0.25rem !important;
}
.sak32009 .mb-2 {
  margin-bottom: 0.5rem !important;
}
.sak32009 .mb-3 {
  margin-bottom: 1rem !important;
}
.sak32009 .mb-4 {
  margin-bottom: 1.5rem !important;
}
.sak32009 .mb-5 {
  margin-bottom: 3rem !important;
}
.sak32009 .mb-auto {
  margin-bottom: auto !important;
}
.sak32009 .ms-0 {
  margin-left: 0 !important;
}
.sak32009 .ms-1 {
  margin-left: 0.25rem !important;
}
.sak32009 .ms-2 {
  margin-left: 0.5rem !important;
}
.sak32009 .ms-3 {
  margin-left: 1rem !important;
}
.sak32009 .ms-4 {
  margin-left: 1.5rem !important;
}
.sak32009 .ms-5 {
  margin-left: 3rem !important;
}
.sak32009 .ms-auto {
  margin-left: auto !important;
}
.sak32009 .p-0 {
  padding: 0 !important;
}
.sak32009 .p-1 {
  padding: 0.25rem !important;
}
.sak32009 .p-2 {
  padding: 0.5rem !important;
}
.sak32009 .p-3 {
  padding: 1rem !important;
}
.sak32009 .p-4 {
  padding: 1.5rem !important;
}
.sak32009 .p-5 {
  padding: 3rem !important;
}
.sak32009 .px-0 {
  padding-right: 0 !important;
  padding-left: 0 !important;
}
.sak32009 .px-1 {
  padding-right: 0.25rem !important;
  padding-left: 0.25rem !important;
}
.sak32009 .px-2 {
  padding-right: 0.5rem !important;
  padding-left: 0.5rem !important;
}
.sak32009 .px-3 {
  padding-right: 1rem !important;
  padding-left: 1rem !important;
}
.sak32009 .px-4 {
  padding-right: 1.5rem !important;
  padding-left: 1.5rem !important;
}
.sak32009 .px-5 {
  padding-right: 3rem !important;
  padding-left: 3rem !important;
}
.sak32009 .py-0 {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
.sak32009 .py-1 {
  padding-top: 0.25rem !important;
  padding-bottom: 0.25rem !important;
}
.sak32009 .py-2 {
  padding-top: 0.5rem !important;
  padding-bottom: 0.5rem !important;
}
.sak32009 .py-3 {
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
}
.sak32009 .py-4 {
  padding-top: 1.5rem !important;
  padding-bottom: 1.5rem !important;
}
.sak32009 .py-5 {
  padding-top: 3rem !important;
  padding-bottom: 3rem !important;
}
.sak32009 .pt-0 {
  padding-top: 0 !important;
}
.sak32009 .pt-1 {
  padding-top: 0.25rem !important;
}
.sak32009 .pt-2 {
  padding-top: 0.5rem !important;
}
.sak32009 .pt-3 {
  padding-top: 1rem !important;
}
.sak32009 .pt-4 {
  padding-top: 1.5rem !important;
}
.sak32009 .pt-5 {
  padding-top: 3rem !important;
}
.sak32009 .pe-0 {
  padding-right: 0 !important;
}
.sak32009 .pe-1 {
  padding-right: 0.25rem !important;
}
.sak32009 .pe-2 {
  padding-right: 0.5rem !important;
}
.sak32009 .pe-3 {
  padding-right: 1rem !important;
}
.sak32009 .pe-4 {
  padding-right: 1.5rem !important;
}
.sak32009 .pe-5 {
  padding-right: 3rem !important;
}
.sak32009 .pb-0 {
  padding-bottom: 0 !important;
}
.sak32009 .pb-1 {
  padding-bottom: 0.25rem !important;
}
.sak32009 .pb-2 {
  padding-bottom: 0.5rem !important;
}
.sak32009 .pb-3 {
  padding-bottom: 1rem !important;
}
.sak32009 .pb-4 {
  padding-bottom: 1.5rem !important;
}
.sak32009 .pb-5 {
  padding-bottom: 3rem !important;
}
.sak32009 .ps-0 {
  padding-left: 0 !important;
}
.sak32009 .ps-1 {
  padding-left: 0.25rem !important;
}
.sak32009 .ps-2 {
  padding-left: 0.5rem !important;
}
.sak32009 .ps-3 {
  padding-left: 1rem !important;
}
.sak32009 .ps-4 {
  padding-left: 1.5rem !important;
}
.sak32009 .ps-5 {
  padding-left: 3rem !important;
}
.sak32009 .gap-0 {
  gap: 0 !important;
}
.sak32009 .gap-1 {
  gap: 0.25rem !important;
}
.sak32009 .gap-2 {
  gap: 0.5rem !important;
}
.sak32009 .gap-3 {
  gap: 1rem !important;
}
.sak32009 .gap-4 {
  gap: 1.5rem !important;
}
.sak32009 .gap-5 {
  gap: 3rem !important;
}
.sak32009 .font-monospace {
  font-family: var(--bs-font-monospace) !important;
}
.sak32009 .fs-1 {
  font-size: calc(1.375rem + 1.5vw) !important;
}
.sak32009 .fs-2 {
  font-size: calc(1.325rem + 0.9vw) !important;
}
.sak32009 .fs-3 {
  font-size: calc(1.3rem + 0.6vw) !important;
}
.sak32009 .fs-4 {
  font-size: calc(1.275rem + 0.3vw) !important;
}
.sak32009 .fs-5 {
  font-size: 1.25rem !important;
}
.sak32009 .fs-6 {
  font-size: 1rem !important;
}
.sak32009 .fst-italic {
  font-style: italic !important;
}
.sak32009 .fst-normal {
  font-style: normal !important;
}
.sak32009 .fw-light {
  font-weight: 300 !important;
}
.sak32009 .fw-lighter {
  font-weight: lighter !important;
}
.sak32009 .fw-normal {
  font-weight: 400 !important;
}
.sak32009 .fw-bold {
  font-weight: 700 !important;
}
.sak32009 .fw-semibold {
  font-weight: 600 !important;
}
.sak32009 .fw-bolder {
  font-weight: bolder !important;
}
.sak32009 .lh-1 {
  line-height: 1 !important;
}
.sak32009 .lh-sm {
  line-height: 1.25 !important;
}
.sak32009 .lh-base {
  line-height: 1.5 !important;
}
.sak32009 .lh-lg {
  line-height: 2 !important;
}
.sak32009 .text-start {
  text-align: left !important;
}
.sak32009 .text-end {
  text-align: right !important;
}
.sak32009 .text-center {
  text-align: center !important;
}
.sak32009 .text-decoration-none {
  text-decoration: none !important;
}
.sak32009 .text-decoration-underline {
  text-decoration: underline !important;
}
.sak32009 .text-decoration-line-through {
  text-decoration: line-through !important;
}
.sak32009 .text-lowercase {
  text-transform: lowercase !important;
}
.sak32009 .text-uppercase {
  text-transform: uppercase !important;
}
.sak32009 .text-capitalize {
  text-transform: capitalize !important;
}
.sak32009 .text-wrap {
  white-space: normal !important;
}
.sak32009 .text-nowrap {
  white-space: nowrap !important;
}
/* rtl:begin:remove */
.sak32009 .text-break {
  word-wrap: break-word !important;
  word-break: break-word !important;
}
/* rtl:end:remove */
.sak32009 .text-primary {
  --bs-text-opacity: 1;
  color: rgba(var(--bs-primary-rgb), var(--bs-text-opacity)) !important;
}
.sak32009 .text-secondary {
  --bs-text-opacity: 1;
  color: rgba(var(--bs-secondary-rgb), var(--bs-text-opacity)) !important;
}
.sak32009 .text-success {
  --bs-text-opacity: 1;
  color: rgba(var(--bs-success-rgb), var(--bs-text-opacity)) !important;
}
.sak32009 .text-info {
  --bs-text-opacity: 1;
  color: rgba(var(--bs-info-rgb), var(--bs-text-opacity)) !important;
}
.sak32009 .text-warning {
  --bs-text-opacity: 1;
  color: rgba(var(--bs-warning-rgb), var(--bs-text-opacity)) !important;
}
.sak32009 .text-danger {
  --bs-text-opacity: 1;
  color: rgba(var(--bs-danger-rgb), var(--bs-text-opacity)) !important;
}
.sak32009 .text-light {
  --bs-text-opacity: 1;
  color: rgba(var(--bs-light-rgb), var(--bs-text-opacity)) !important;
}
.sak32009 .text-dark {
  --bs-text-opacity: 1;
  color: rgba(var(--bs-dark-rgb), var(--bs-text-opacity)) !important;
}
.sak32009 .text-sake {
  --bs-text-opacity: 1;
  color: rgba(var(--bs-sake-rgb), var(--bs-text-opacity)) !important;
}
.sak32009 .text-black {
  --bs-text-opacity: 1;
  color: rgba(var(--bs-black-rgb), var(--bs-text-opacity)) !important;
}
.sak32009 .text-white {
  --bs-text-opacity: 1;
  color: rgba(var(--bs-white-rgb), var(--bs-text-opacity)) !important;
}
.sak32009 .text-body {
  --bs-text-opacity: 1;
  color: rgba(var(--bs-body-color-rgb), var(--bs-text-opacity)) !important;
}
.sak32009 .text-muted {
  --bs-text-opacity: 1;
  color: rgba(var(--bs-body-color-rgb), 0.75) !important;
}
.sak32009 .text-black-50 {
  --bs-text-opacity: 1;
  color: rgba(0, 0, 0, 0.5) !important;
}
.sak32009 .text-white-50 {
  --bs-text-opacity: 1;
  color: rgba(255, 255, 255, 0.5) !important;
}
.sak32009 .text-reset {
  --bs-text-opacity: 1;
  color: inherit !important;
}
.sak32009 .text-opacity-25 {
  --bs-text-opacity: 0.25;
}
.sak32009 .text-opacity-50 {
  --bs-text-opacity: 0.5;
}
.sak32009 .text-opacity-75 {
  --bs-text-opacity: 0.75;
}
.sak32009 .text-opacity-100 {
  --bs-text-opacity: 1;
}
.sak32009 .bg-primary {
  --bs-bg-opacity: 1;
  background-color: rgba(var(--bs-primary-rgb), var(--bs-bg-opacity)) !important;
}
.sak32009 .bg-secondary {
  --bs-bg-opacity: 1;
  background-color: rgba(var(--bs-secondary-rgb), var(--bs-bg-opacity)) !important;
}
.sak32009 .bg-success {
  --bs-bg-opacity: 1;
  background-color: rgba(var(--bs-success-rgb), var(--bs-bg-opacity)) !important;
}
.sak32009 .bg-info {
  --bs-bg-opacity: 1;
  background-color: rgba(var(--bs-info-rgb), var(--bs-bg-opacity)) !important;
}
.sak32009 .bg-warning {
  --bs-bg-opacity: 1;
  background-color: rgba(var(--bs-warning-rgb), var(--bs-bg-opacity)) !important;
}
.sak32009 .bg-danger {
  --bs-bg-opacity: 1;
  background-color: rgba(var(--bs-danger-rgb), var(--bs-bg-opacity)) !important;
}
.sak32009 .bg-light {
  --bs-bg-opacity: 1;
  background-color: rgba(var(--bs-light-rgb), var(--bs-bg-opacity)) !important;
}
.sak32009 .bg-dark {
  --bs-bg-opacity: 1;
  background-color: rgba(var(--bs-dark-rgb), var(--bs-bg-opacity)) !important;
}
.sak32009 .bg-sake {
  --bs-bg-opacity: 1;
  background-color: rgba(var(--bs-sake-rgb), var(--bs-bg-opacity)) !important;
}
.sak32009 .bg-black {
  --bs-bg-opacity: 1;
  background-color: rgba(var(--bs-black-rgb), var(--bs-bg-opacity)) !important;
}
.sak32009 .bg-white {
  --bs-bg-opacity: 1;
  background-color: rgba(var(--bs-white-rgb), var(--bs-bg-opacity)) !important;
}
.sak32009 .bg-body {
  --bs-bg-opacity: 1;
  background-color: rgba(var(--bs-body-bg-rgb), var(--bs-bg-opacity)) !important;
}
.sak32009 .bg-transparent {
  --bs-bg-opacity: 1;
  background-color: transparent !important;
}
.sak32009 .bg-opacity-10 {
  --bs-bg-opacity: 0.1;
}
.sak32009 .bg-opacity-25 {
  --bs-bg-opacity: 0.25;
}
.sak32009 .bg-opacity-50 {
  --bs-bg-opacity: 0.5;
}
.sak32009 .bg-opacity-75 {
  --bs-bg-opacity: 0.75;
}
.sak32009 .bg-opacity-100 {
  --bs-bg-opacity: 1;
}
.sak32009 .bg-gradient {
  background-image: var(--bs-gradient) !important;
}
.sak32009 .user-select-all {
  -webkit-user-select: all !important;
     -moz-user-select: all !important;
          user-select: all !important;
}
.sak32009 .user-select-auto {
  -webkit-user-select: auto !important;
     -moz-user-select: auto !important;
      -ms-user-select: auto !important;
          user-select: auto !important;
}
.sak32009 .user-select-none {
  -webkit-user-select: none !important;
     -moz-user-select: none !important;
      -ms-user-select: none !important;
          user-select: none !important;
}
.sak32009 .pe-none {
  pointer-events: none !important;
}
.sak32009 .pe-auto {
  pointer-events: auto !important;
}
.sak32009 .rounded {
  border-radius: var(--bs-border-radius) !important;
}
.sak32009 .rounded-0 {
  border-radius: 0 !important;
}
.sak32009 .rounded-1 {
  border-radius: var(--bs-border-radius-sm) !important;
}
.sak32009 .rounded-2 {
  border-radius: var(--bs-border-radius) !important;
}
.sak32009 .rounded-3 {
  border-radius: var(--bs-border-radius-lg) !important;
}
.sak32009 .rounded-4 {
  border-radius: var(--bs-border-radius-xl) !important;
}
.sak32009 .rounded-5 {
  border-radius: var(--bs-border-radius-2xl) !important;
}
.sak32009 .rounded-circle {
  border-radius: 50% !important;
}
.sak32009 .rounded-pill {
  border-radius: var(--bs-border-radius-pill) !important;
}
.sak32009 .rounded-top {
  border-top-left-radius: var(--bs-border-radius) !important;
  border-top-right-radius: var(--bs-border-radius) !important;
}
.sak32009 .rounded-end {
  border-top-right-radius: var(--bs-border-radius) !important;
  border-bottom-right-radius: var(--bs-border-radius) !important;
}
.sak32009 .rounded-bottom {
  border-bottom-right-radius: var(--bs-border-radius) !important;
  border-bottom-left-radius: var(--bs-border-radius) !important;
}
.sak32009 .rounded-start {
  border-bottom-left-radius: var(--bs-border-radius) !important;
  border-top-left-radius: var(--bs-border-radius) !important;
}
.sak32009 .visible {
  visibility: visible !important;
}
.sak32009 .invisible {
  visibility: hidden !important;
}
@media (min-width: 576px) {
  .sak32009 .float-sm-start {
    float: left !important;
  }
  .sak32009 .float-sm-end {
    float: right !important;
  }
  .sak32009 .float-sm-none {
    float: none !important;
  }
  .sak32009 .d-sm-inline {
    display: inline !important;
  }
  .sak32009 .d-sm-inline-block {
    display: inline-block !important;
  }
  .sak32009 .d-sm-block {
    display: block !important;
  }
  .sak32009 .d-sm-grid {
    display: grid !important;
  }
  .sak32009 .d-sm-table {
    display: table !important;
  }
  .sak32009 .d-sm-table-row {
    display: table-row !important;
  }
  .sak32009 .d-sm-table-cell {
    display: table-cell !important;
  }
  .sak32009 .d-sm-flex {
    display: flex !important;
  }
  .sak32009 .d-sm-inline-flex {
    display: inline-flex !important;
  }
  .sak32009 .d-sm-none {
    display: none !important;
  }
  .sak32009 .flex-sm-fill {
    flex: 1 1 auto !important;
  }
  .sak32009 .flex-sm-row {
    flex-direction: row !important;
  }
  .sak32009 .flex-sm-column {
    flex-direction: column !important;
  }
  .sak32009 .flex-sm-row-reverse {
    flex-direction: row-reverse !important;
  }
  .sak32009 .flex-sm-column-reverse {
    flex-direction: column-reverse !important;
  }
  .sak32009 .flex-sm-grow-0 {
    flex-grow: 0 !important;
  }
  .sak32009 .flex-sm-grow-1 {
    flex-grow: 1 !important;
  }
  .sak32009 .flex-sm-shrink-0 {
    flex-shrink: 0 !important;
  }
  .sak32009 .flex-sm-shrink-1 {
    flex-shrink: 1 !important;
  }
  .sak32009 .flex-sm-wrap {
    flex-wrap: wrap !important;
  }
  .sak32009 .flex-sm-nowrap {
    flex-wrap: nowrap !important;
  }
  .sak32009 .flex-sm-wrap-reverse {
    flex-wrap: wrap-reverse !important;
  }
  .sak32009 .justify-content-sm-start {
    justify-content: flex-start !important;
  }
  .sak32009 .justify-content-sm-end {
    justify-content: flex-end !important;
  }
  .sak32009 .justify-content-sm-center {
    justify-content: center !important;
  }
  .sak32009 .justify-content-sm-between {
    justify-content: space-between !important;
  }
  .sak32009 .justify-content-sm-around {
    justify-content: space-around !important;
  }
  .sak32009 .justify-content-sm-evenly {
    justify-content: space-evenly !important;
  }
  .sak32009 .align-items-sm-start {
    align-items: flex-start !important;
  }
  .sak32009 .align-items-sm-end {
    align-items: flex-end !important;
  }
  .sak32009 .align-items-sm-center {
    align-items: center !important;
  }
  .sak32009 .align-items-sm-baseline {
    align-items: baseline !important;
  }
  .sak32009 .align-items-sm-stretch {
    align-items: stretch !important;
  }
  .sak32009 .align-content-sm-start {
    align-content: flex-start !important;
  }
  .sak32009 .align-content-sm-end {
    align-content: flex-end !important;
  }
  .sak32009 .align-content-sm-center {
    align-content: center !important;
  }
  .sak32009 .align-content-sm-between {
    align-content: space-between !important;
  }
  .sak32009 .align-content-sm-around {
    align-content: space-around !important;
  }
  .sak32009 .align-content-sm-stretch {
    align-content: stretch !important;
  }
  .sak32009 .align-self-sm-auto {
    align-self: auto !important;
  }
  .sak32009 .align-self-sm-start {
    align-self: flex-start !important;
  }
  .sak32009 .align-self-sm-end {
    align-self: flex-end !important;
  }
  .sak32009 .align-self-sm-center {
    align-self: center !important;
  }
  .sak32009 .align-self-sm-baseline {
    align-self: baseline !important;
  }
  .sak32009 .align-self-sm-stretch {
    align-self: stretch !important;
  }
  .sak32009 .order-sm-first {
    order: -1 !important;
  }
  .sak32009 .order-sm-0 {
    order: 0 !important;
  }
  .sak32009 .order-sm-1 {
    order: 1 !important;
  }
  .sak32009 .order-sm-2 {
    order: 2 !important;
  }
  .sak32009 .order-sm-3 {
    order: 3 !important;
  }
  .sak32009 .order-sm-4 {
    order: 4 !important;
  }
  .sak32009 .order-sm-5 {
    order: 5 !important;
  }
  .sak32009 .order-sm-last {
    order: 6 !important;
  }
  .sak32009 .m-sm-0 {
    margin: 0 !important;
  }
  .sak32009 .m-sm-1 {
    margin: 0.25rem !important;
  }
  .sak32009 .m-sm-2 {
    margin: 0.5rem !important;
  }
  .sak32009 .m-sm-3 {
    margin: 1rem !important;
  }
  .sak32009 .m-sm-4 {
    margin: 1.5rem !important;
  }
  .sak32009 .m-sm-5 {
    margin: 3rem !important;
  }
  .sak32009 .m-sm-auto {
    margin: auto !important;
  }
  .sak32009 .mx-sm-0 {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }
  .sak32009 .mx-sm-1 {
    margin-right: 0.25rem !important;
    margin-left: 0.25rem !important;
  }
  .sak32009 .mx-sm-2 {
    margin-right: 0.5rem !important;
    margin-left: 0.5rem !important;
  }
  .sak32009 .mx-sm-3 {
    margin-right: 1rem !important;
    margin-left: 1rem !important;
  }
  .sak32009 .mx-sm-4 {
    margin-right: 1.5rem !important;
    margin-left: 1.5rem !important;
  }
  .sak32009 .mx-sm-5 {
    margin-right: 3rem !important;
    margin-left: 3rem !important;
  }
  .sak32009 .mx-sm-auto {
    margin-right: auto !important;
    margin-left: auto !important;
  }
  .sak32009 .my-sm-0 {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
  .sak32009 .my-sm-1 {
    margin-top: 0.25rem !important;
    margin-bottom: 0.25rem !important;
  }
  .sak32009 .my-sm-2 {
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }
  .sak32009 .my-sm-3 {
    margin-top: 1rem !important;
    margin-bottom: 1rem !important;
  }
  .sak32009 .my-sm-4 {
    margin-top: 1.5rem !important;
    margin-bottom: 1.5rem !important;
  }
  .sak32009 .my-sm-5 {
    margin-top: 3rem !important;
    margin-bottom: 3rem !important;
  }
  .sak32009 .my-sm-auto {
    margin-top: auto !important;
    margin-bottom: auto !important;
  }
  .sak32009 .mt-sm-0 {
    margin-top: 0 !important;
  }
  .sak32009 .mt-sm-1 {
    margin-top: 0.25rem !important;
  }
  .sak32009 .mt-sm-2 {
    margin-top: 0.5rem !important;
  }
  .sak32009 .mt-sm-3 {
    margin-top: 1rem !important;
  }
  .sak32009 .mt-sm-4 {
    margin-top: 1.5rem !important;
  }
  .sak32009 .mt-sm-5 {
    margin-top: 3rem !important;
  }
  .sak32009 .mt-sm-auto {
    margin-top: auto !important;
  }
  .sak32009 .me-sm-0 {
    margin-right: 0 !important;
  }
  .sak32009 .me-sm-1 {
    margin-right: 0.25rem !important;
  }
  .sak32009 .me-sm-2 {
    margin-right: 0.5rem !important;
  }
  .sak32009 .me-sm-3 {
    margin-right: 1rem !important;
  }
  .sak32009 .me-sm-4 {
    margin-right: 1.5rem !important;
  }
  .sak32009 .me-sm-5 {
    margin-right: 3rem !important;
  }
  .sak32009 .me-sm-auto {
    margin-right: auto !important;
  }
  .sak32009 .mb-sm-0 {
    margin-bottom: 0 !important;
  }
  .sak32009 .mb-sm-1 {
    margin-bottom: 0.25rem !important;
  }
  .sak32009 .mb-sm-2 {
    margin-bottom: 0.5rem !important;
  }
  .sak32009 .mb-sm-3 {
    margin-bottom: 1rem !important;
  }
  .sak32009 .mb-sm-4 {
    margin-bottom: 1.5rem !important;
  }
  .sak32009 .mb-sm-5 {
    margin-bottom: 3rem !important;
  }
  .sak32009 .mb-sm-auto {
    margin-bottom: auto !important;
  }
  .sak32009 .ms-sm-0 {
    margin-left: 0 !important;
  }
  .sak32009 .ms-sm-1 {
    margin-left: 0.25rem !important;
  }
  .sak32009 .ms-sm-2 {
    margin-left: 0.5rem !important;
  }
  .sak32009 .ms-sm-3 {
    margin-left: 1rem !important;
  }
  .sak32009 .ms-sm-4 {
    margin-left: 1.5rem !important;
  }
  .sak32009 .ms-sm-5 {
    margin-left: 3rem !important;
  }
  .sak32009 .ms-sm-auto {
    margin-left: auto !important;
  }
  .sak32009 .p-sm-0 {
    padding: 0 !important;
  }
  .sak32009 .p-sm-1 {
    padding: 0.25rem !important;
  }
  .sak32009 .p-sm-2 {
    padding: 0.5rem !important;
  }
  .sak32009 .p-sm-3 {
    padding: 1rem !important;
  }
  .sak32009 .p-sm-4 {
    padding: 1.5rem !important;
  }
  .sak32009 .p-sm-5 {
    padding: 3rem !important;
  }
  .sak32009 .px-sm-0 {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
  .sak32009 .px-sm-1 {
    padding-right: 0.25rem !important;
    padding-left: 0.25rem !important;
  }
  .sak32009 .px-sm-2 {
    padding-right: 0.5rem !important;
    padding-left: 0.5rem !important;
  }
  .sak32009 .px-sm-3 {
    padding-right: 1rem !important;
    padding-left: 1rem !important;
  }
  .sak32009 .px-sm-4 {
    padding-right: 1.5rem !important;
    padding-left: 1.5rem !important;
  }
  .sak32009 .px-sm-5 {
    padding-right: 3rem !important;
    padding-left: 3rem !important;
  }
  .sak32009 .py-sm-0 {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
  .sak32009 .py-sm-1 {
    padding-top: 0.25rem !important;
    padding-bottom: 0.25rem !important;
  }
  .sak32009 .py-sm-2 {
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
  }
  .sak32009 .py-sm-3 {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
  }
  .sak32009 .py-sm-4 {
    padding-top: 1.5rem !important;
    padding-bottom: 1.5rem !important;
  }
  .sak32009 .py-sm-5 {
    padding-top: 3rem !important;
    padding-bottom: 3rem !important;
  }
  .sak32009 .pt-sm-0 {
    padding-top: 0 !important;
  }
  .sak32009 .pt-sm-1 {
    padding-top: 0.25rem !important;
  }
  .sak32009 .pt-sm-2 {
    padding-top: 0.5rem !important;
  }
  .sak32009 .pt-sm-3 {
    padding-top: 1rem !important;
  }
  .sak32009 .pt-sm-4 {
    padding-top: 1.5rem !important;
  }
  .sak32009 .pt-sm-5 {
    padding-top: 3rem !important;
  }
  .sak32009 .pe-sm-0 {
    padding-right: 0 !important;
  }
  .sak32009 .pe-sm-1 {
    padding-right: 0.25rem !important;
  }
  .sak32009 .pe-sm-2 {
    padding-right: 0.5rem !important;
  }
  .sak32009 .pe-sm-3 {
    padding-right: 1rem !important;
  }
  .sak32009 .pe-sm-4 {
    padding-right: 1.5rem !important;
  }
  .sak32009 .pe-sm-5 {
    padding-right: 3rem !important;
  }
  .sak32009 .pb-sm-0 {
    padding-bottom: 0 !important;
  }
  .sak32009 .pb-sm-1 {
    padding-bottom: 0.25rem !important;
  }
  .sak32009 .pb-sm-2 {
    padding-bottom: 0.5rem !important;
  }
  .sak32009 .pb-sm-3 {
    padding-bottom: 1rem !important;
  }
  .sak32009 .pb-sm-4 {
    padding-bottom: 1.5rem !important;
  }
  .sak32009 .pb-sm-5 {
    padding-bottom: 3rem !important;
  }
  .sak32009 .ps-sm-0 {
    padding-left: 0 !important;
  }
  .sak32009 .ps-sm-1 {
    padding-left: 0.25rem !important;
  }
  .sak32009 .ps-sm-2 {
    padding-left: 0.5rem !important;
  }
  .sak32009 .ps-sm-3 {
    padding-left: 1rem !important;
  }
  .sak32009 .ps-sm-4 {
    padding-left: 1.5rem !important;
  }
  .sak32009 .ps-sm-5 {
    padding-left: 3rem !important;
  }
  .sak32009 .gap-sm-0 {
    gap: 0 !important;
  }
  .sak32009 .gap-sm-1 {
    gap: 0.25rem !important;
  }
  .sak32009 .gap-sm-2 {
    gap: 0.5rem !important;
  }
  .sak32009 .gap-sm-3 {
    gap: 1rem !important;
  }
  .sak32009 .gap-sm-4 {
    gap: 1.5rem !important;
  }
  .sak32009 .gap-sm-5 {
    gap: 3rem !important;
  }
  .sak32009 .text-sm-start {
    text-align: left !important;
  }
  .sak32009 .text-sm-end {
    text-align: right !important;
  }
  .sak32009 .text-sm-center {
    text-align: center !important;
  }
}
@media (min-width: 768px) {
  .sak32009 .float-md-start {
    float: left !important;
  }
  .sak32009 .float-md-end {
    float: right !important;
  }
  .sak32009 .float-md-none {
    float: none !important;
  }
  .sak32009 .d-md-inline {
    display: inline !important;
  }
  .sak32009 .d-md-inline-block {
    display: inline-block !important;
  }
  .sak32009 .d-md-block {
    display: block !important;
  }
  .sak32009 .d-md-grid {
    display: grid !important;
  }
  .sak32009 .d-md-table {
    display: table !important;
  }
  .sak32009 .d-md-table-row {
    display: table-row !important;
  }
  .sak32009 .d-md-table-cell {
    display: table-cell !important;
  }
  .sak32009 .d-md-flex {
    display: flex !important;
  }
  .sak32009 .d-md-inline-flex {
    display: inline-flex !important;
  }
  .sak32009 .d-md-none {
    display: none !important;
  }
  .sak32009 .flex-md-fill {
    flex: 1 1 auto !important;
  }
  .sak32009 .flex-md-row {
    flex-direction: row !important;
  }
  .sak32009 .flex-md-column {
    flex-direction: column !important;
  }
  .sak32009 .flex-md-row-reverse {
    flex-direction: row-reverse !important;
  }
  .sak32009 .flex-md-column-reverse {
    flex-direction: column-reverse !important;
  }
  .sak32009 .flex-md-grow-0 {
    flex-grow: 0 !important;
  }
  .sak32009 .flex-md-grow-1 {
    flex-grow: 1 !important;
  }
  .sak32009 .flex-md-shrink-0 {
    flex-shrink: 0 !important;
  }
  .sak32009 .flex-md-shrink-1 {
    flex-shrink: 1 !important;
  }
  .sak32009 .flex-md-wrap {
    flex-wrap: wrap !important;
  }
  .sak32009 .flex-md-nowrap {
    flex-wrap: nowrap !important;
  }
  .sak32009 .flex-md-wrap-reverse {
    flex-wrap: wrap-reverse !important;
  }
  .sak32009 .justify-content-md-start {
    justify-content: flex-start !important;
  }
  .sak32009 .justify-content-md-end {
    justify-content: flex-end !important;
  }
  .sak32009 .justify-content-md-center {
    justify-content: center !important;
  }
  .sak32009 .justify-content-md-between {
    justify-content: space-between !important;
  }
  .sak32009 .justify-content-md-around {
    justify-content: space-around !important;
  }
  .sak32009 .justify-content-md-evenly {
    justify-content: space-evenly !important;
  }
  .sak32009 .align-items-md-start {
    align-items: flex-start !important;
  }
  .sak32009 .align-items-md-end {
    align-items: flex-end !important;
  }
  .sak32009 .align-items-md-center {
    align-items: center !important;
  }
  .sak32009 .align-items-md-baseline {
    align-items: baseline !important;
  }
  .sak32009 .align-items-md-stretch {
    align-items: stretch !important;
  }
  .sak32009 .align-content-md-start {
    align-content: flex-start !important;
  }
  .sak32009 .align-content-md-end {
    align-content: flex-end !important;
  }
  .sak32009 .align-content-md-center {
    align-content: center !important;
  }
  .sak32009 .align-content-md-between {
    align-content: space-between !important;
  }
  .sak32009 .align-content-md-around {
    align-content: space-around !important;
  }
  .sak32009 .align-content-md-stretch {
    align-content: stretch !important;
  }
  .sak32009 .align-self-md-auto {
    align-self: auto !important;
  }
  .sak32009 .align-self-md-start {
    align-self: flex-start !important;
  }
  .sak32009 .align-self-md-end {
    align-self: flex-end !important;
  }
  .sak32009 .align-self-md-center {
    align-self: center !important;
  }
  .sak32009 .align-self-md-baseline {
    align-self: baseline !important;
  }
  .sak32009 .align-self-md-stretch {
    align-self: stretch !important;
  }
  .sak32009 .order-md-first {
    order: -1 !important;
  }
  .sak32009 .order-md-0 {
    order: 0 !important;
  }
  .sak32009 .order-md-1 {
    order: 1 !important;
  }
  .sak32009 .order-md-2 {
    order: 2 !important;
  }
  .sak32009 .order-md-3 {
    order: 3 !important;
  }
  .sak32009 .order-md-4 {
    order: 4 !important;
  }
  .sak32009 .order-md-5 {
    order: 5 !important;
  }
  .sak32009 .order-md-last {
    order: 6 !important;
  }
  .sak32009 .m-md-0 {
    margin: 0 !important;
  }
  .sak32009 .m-md-1 {
    margin: 0.25rem !important;
  }
  .sak32009 .m-md-2 {
    margin: 0.5rem !important;
  }
  .sak32009 .m-md-3 {
    margin: 1rem !important;
  }
  .sak32009 .m-md-4 {
    margin: 1.5rem !important;
  }
  .sak32009 .m-md-5 {
    margin: 3rem !important;
  }
  .sak32009 .m-md-auto {
    margin: auto !important;
  }
  .sak32009 .mx-md-0 {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }
  .sak32009 .mx-md-1 {
    margin-right: 0.25rem !important;
    margin-left: 0.25rem !important;
  }
  .sak32009 .mx-md-2 {
    margin-right: 0.5rem !important;
    margin-left: 0.5rem !important;
  }
  .sak32009 .mx-md-3 {
    margin-right: 1rem !important;
    margin-left: 1rem !important;
  }
  .sak32009 .mx-md-4 {
    margin-right: 1.5rem !important;
    margin-left: 1.5rem !important;
  }
  .sak32009 .mx-md-5 {
    margin-right: 3rem !important;
    margin-left: 3rem !important;
  }
  .sak32009 .mx-md-auto {
    margin-right: auto !important;
    margin-left: auto !important;
  }
  .sak32009 .my-md-0 {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
  .sak32009 .my-md-1 {
    margin-top: 0.25rem !important;
    margin-bottom: 0.25rem !important;
  }
  .sak32009 .my-md-2 {
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }
  .sak32009 .my-md-3 {
    margin-top: 1rem !important;
    margin-bottom: 1rem !important;
  }
  .sak32009 .my-md-4 {
    margin-top: 1.5rem !important;
    margin-bottom: 1.5rem !important;
  }
  .sak32009 .my-md-5 {
    margin-top: 3rem !important;
    margin-bottom: 3rem !important;
  }
  .sak32009 .my-md-auto {
    margin-top: auto !important;
    margin-bottom: auto !important;
  }
  .sak32009 .mt-md-0 {
    margin-top: 0 !important;
  }
  .sak32009 .mt-md-1 {
    margin-top: 0.25rem !important;
  }
  .sak32009 .mt-md-2 {
    margin-top: 0.5rem !important;
  }
  .sak32009 .mt-md-3 {
    margin-top: 1rem !important;
  }
  .sak32009 .mt-md-4 {
    margin-top: 1.5rem !important;
  }
  .sak32009 .mt-md-5 {
    margin-top: 3rem !important;
  }
  .sak32009 .mt-md-auto {
    margin-top: auto !important;
  }
  .sak32009 .me-md-0 {
    margin-right: 0 !important;
  }
  .sak32009 .me-md-1 {
    margin-right: 0.25rem !important;
  }
  .sak32009 .me-md-2 {
    margin-right: 0.5rem !important;
  }
  .sak32009 .me-md-3 {
    margin-right: 1rem !important;
  }
  .sak32009 .me-md-4 {
    margin-right: 1.5rem !important;
  }
  .sak32009 .me-md-5 {
    margin-right: 3rem !important;
  }
  .sak32009 .me-md-auto {
    margin-right: auto !important;
  }
  .sak32009 .mb-md-0 {
    margin-bottom: 0 !important;
  }
  .sak32009 .mb-md-1 {
    margin-bottom: 0.25rem !important;
  }
  .sak32009 .mb-md-2 {
    margin-bottom: 0.5rem !important;
  }
  .sak32009 .mb-md-3 {
    margin-bottom: 1rem !important;
  }
  .sak32009 .mb-md-4 {
    margin-bottom: 1.5rem !important;
  }
  .sak32009 .mb-md-5 {
    margin-bottom: 3rem !important;
  }
  .sak32009 .mb-md-auto {
    margin-bottom: auto !important;
  }
  .sak32009 .ms-md-0 {
    margin-left: 0 !important;
  }
  .sak32009 .ms-md-1 {
    margin-left: 0.25rem !important;
  }
  .sak32009 .ms-md-2 {
    margin-left: 0.5rem !important;
  }
  .sak32009 .ms-md-3 {
    margin-left: 1rem !important;
  }
  .sak32009 .ms-md-4 {
    margin-left: 1.5rem !important;
  }
  .sak32009 .ms-md-5 {
    margin-left: 3rem !important;
  }
  .sak32009 .ms-md-auto {
    margin-left: auto !important;
  }
  .sak32009 .p-md-0 {
    padding: 0 !important;
  }
  .sak32009 .p-md-1 {
    padding: 0.25rem !important;
  }
  .sak32009 .p-md-2 {
    padding: 0.5rem !important;
  }
  .sak32009 .p-md-3 {
    padding: 1rem !important;
  }
  .sak32009 .p-md-4 {
    padding: 1.5rem !important;
  }
  .sak32009 .p-md-5 {
    padding: 3rem !important;
  }
  .sak32009 .px-md-0 {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
  .sak32009 .px-md-1 {
    padding-right: 0.25rem !important;
    padding-left: 0.25rem !important;
  }
  .sak32009 .px-md-2 {
    padding-right: 0.5rem !important;
    padding-left: 0.5rem !important;
  }
  .sak32009 .px-md-3 {
    padding-right: 1rem !important;
    padding-left: 1rem !important;
  }
  .sak32009 .px-md-4 {
    padding-right: 1.5rem !important;
    padding-left: 1.5rem !important;
  }
  .sak32009 .px-md-5 {
    padding-right: 3rem !important;
    padding-left: 3rem !important;
  }
  .sak32009 .py-md-0 {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
  .sak32009 .py-md-1 {
    padding-top: 0.25rem !important;
    padding-bottom: 0.25rem !important;
  }
  .sak32009 .py-md-2 {
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
  }
  .sak32009 .py-md-3 {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
  }
  .sak32009 .py-md-4 {
    padding-top: 1.5rem !important;
    padding-bottom: 1.5rem !important;
  }
  .sak32009 .py-md-5 {
    padding-top: 3rem !important;
    padding-bottom: 3rem !important;
  }
  .sak32009 .pt-md-0 {
    padding-top: 0 !important;
  }
  .sak32009 .pt-md-1 {
    padding-top: 0.25rem !important;
  }
  .sak32009 .pt-md-2 {
    padding-top: 0.5rem !important;
  }
  .sak32009 .pt-md-3 {
    padding-top: 1rem !important;
  }
  .sak32009 .pt-md-4 {
    padding-top: 1.5rem !important;
  }
  .sak32009 .pt-md-5 {
    padding-top: 3rem !important;
  }
  .sak32009 .pe-md-0 {
    padding-right: 0 !important;
  }
  .sak32009 .pe-md-1 {
    padding-right: 0.25rem !important;
  }
  .sak32009 .pe-md-2 {
    padding-right: 0.5rem !important;
  }
  .sak32009 .pe-md-3 {
    padding-right: 1rem !important;
  }
  .sak32009 .pe-md-4 {
    padding-right: 1.5rem !important;
  }
  .sak32009 .pe-md-5 {
    padding-right: 3rem !important;
  }
  .sak32009 .pb-md-0 {
    padding-bottom: 0 !important;
  }
  .sak32009 .pb-md-1 {
    padding-bottom: 0.25rem !important;
  }
  .sak32009 .pb-md-2 {
    padding-bottom: 0.5rem !important;
  }
  .sak32009 .pb-md-3 {
    padding-bottom: 1rem !important;
  }
  .sak32009 .pb-md-4 {
    padding-bottom: 1.5rem !important;
  }
  .sak32009 .pb-md-5 {
    padding-bottom: 3rem !important;
  }
  .sak32009 .ps-md-0 {
    padding-left: 0 !important;
  }
  .sak32009 .ps-md-1 {
    padding-left: 0.25rem !important;
  }
  .sak32009 .ps-md-2 {
    padding-left: 0.5rem !important;
  }
  .sak32009 .ps-md-3 {
    padding-left: 1rem !important;
  }
  .sak32009 .ps-md-4 {
    padding-left: 1.5rem !important;
  }
  .sak32009 .ps-md-5 {
    padding-left: 3rem !important;
  }
  .sak32009 .gap-md-0 {
    gap: 0 !important;
  }
  .sak32009 .gap-md-1 {
    gap: 0.25rem !important;
  }
  .sak32009 .gap-md-2 {
    gap: 0.5rem !important;
  }
  .sak32009 .gap-md-3 {
    gap: 1rem !important;
  }
  .sak32009 .gap-md-4 {
    gap: 1.5rem !important;
  }
  .sak32009 .gap-md-5 {
    gap: 3rem !important;
  }
  .sak32009 .text-md-start {
    text-align: left !important;
  }
  .sak32009 .text-md-end {
    text-align: right !important;
  }
  .sak32009 .text-md-center {
    text-align: center !important;
  }
}
@media (min-width: 992px) {
  .sak32009 .float-lg-start {
    float: left !important;
  }
  .sak32009 .float-lg-end {
    float: right !important;
  }
  .sak32009 .float-lg-none {
    float: none !important;
  }
  .sak32009 .d-lg-inline {
    display: inline !important;
  }
  .sak32009 .d-lg-inline-block {
    display: inline-block !important;
  }
  .sak32009 .d-lg-block {
    display: block !important;
  }
  .sak32009 .d-lg-grid {
    display: grid !important;
  }
  .sak32009 .d-lg-table {
    display: table !important;
  }
  .sak32009 .d-lg-table-row {
    display: table-row !important;
  }
  .sak32009 .d-lg-table-cell {
    display: table-cell !important;
  }
  .sak32009 .d-lg-flex {
    display: flex !important;
  }
  .sak32009 .d-lg-inline-flex {
    display: inline-flex !important;
  }
  .sak32009 .d-lg-none {
    display: none !important;
  }
  .sak32009 .flex-lg-fill {
    flex: 1 1 auto !important;
  }
  .sak32009 .flex-lg-row {
    flex-direction: row !important;
  }
  .sak32009 .flex-lg-column {
    flex-direction: column !important;
  }
  .sak32009 .flex-lg-row-reverse {
    flex-direction: row-reverse !important;
  }
  .sak32009 .flex-lg-column-reverse {
    flex-direction: column-reverse !important;
  }
  .sak32009 .flex-lg-grow-0 {
    flex-grow: 0 !important;
  }
  .sak32009 .flex-lg-grow-1 {
    flex-grow: 1 !important;
  }
  .sak32009 .flex-lg-shrink-0 {
    flex-shrink: 0 !important;
  }
  .sak32009 .flex-lg-shrink-1 {
    flex-shrink: 1 !important;
  }
  .sak32009 .flex-lg-wrap {
    flex-wrap: wrap !important;
  }
  .sak32009 .flex-lg-nowrap {
    flex-wrap: nowrap !important;
  }
  .sak32009 .flex-lg-wrap-reverse {
    flex-wrap: wrap-reverse !important;
  }
  .sak32009 .justify-content-lg-start {
    justify-content: flex-start !important;
  }
  .sak32009 .justify-content-lg-end {
    justify-content: flex-end !important;
  }
  .sak32009 .justify-content-lg-center {
    justify-content: center !important;
  }
  .sak32009 .justify-content-lg-between {
    justify-content: space-between !important;
  }
  .sak32009 .justify-content-lg-around {
    justify-content: space-around !important;
  }
  .sak32009 .justify-content-lg-evenly {
    justify-content: space-evenly !important;
  }
  .sak32009 .align-items-lg-start {
    align-items: flex-start !important;
  }
  .sak32009 .align-items-lg-end {
    align-items: flex-end !important;
  }
  .sak32009 .align-items-lg-center {
    align-items: center !important;
  }
  .sak32009 .align-items-lg-baseline {
    align-items: baseline !important;
  }
  .sak32009 .align-items-lg-stretch {
    align-items: stretch !important;
  }
  .sak32009 .align-content-lg-start {
    align-content: flex-start !important;
  }
  .sak32009 .align-content-lg-end {
    align-content: flex-end !important;
  }
  .sak32009 .align-content-lg-center {
    align-content: center !important;
  }
  .sak32009 .align-content-lg-between {
    align-content: space-between !important;
  }
  .sak32009 .align-content-lg-around {
    align-content: space-around !important;
  }
  .sak32009 .align-content-lg-stretch {
    align-content: stretch !important;
  }
  .sak32009 .align-self-lg-auto {
    align-self: auto !important;
  }
  .sak32009 .align-self-lg-start {
    align-self: flex-start !important;
  }
  .sak32009 .align-self-lg-end {
    align-self: flex-end !important;
  }
  .sak32009 .align-self-lg-center {
    align-self: center !important;
  }
  .sak32009 .align-self-lg-baseline {
    align-self: baseline !important;
  }
  .sak32009 .align-self-lg-stretch {
    align-self: stretch !important;
  }
  .sak32009 .order-lg-first {
    order: -1 !important;
  }
  .sak32009 .order-lg-0 {
    order: 0 !important;
  }
  .sak32009 .order-lg-1 {
    order: 1 !important;
  }
  .sak32009 .order-lg-2 {
    order: 2 !important;
  }
  .sak32009 .order-lg-3 {
    order: 3 !important;
  }
  .sak32009 .order-lg-4 {
    order: 4 !important;
  }
  .sak32009 .order-lg-5 {
    order: 5 !important;
  }
  .sak32009 .order-lg-last {
    order: 6 !important;
  }
  .sak32009 .m-lg-0 {
    margin: 0 !important;
  }
  .sak32009 .m-lg-1 {
    margin: 0.25rem !important;
  }
  .sak32009 .m-lg-2 {
    margin: 0.5rem !important;
  }
  .sak32009 .m-lg-3 {
    margin: 1rem !important;
  }
  .sak32009 .m-lg-4 {
    margin: 1.5rem !important;
  }
  .sak32009 .m-lg-5 {
    margin: 3rem !important;
  }
  .sak32009 .m-lg-auto {
    margin: auto !important;
  }
  .sak32009 .mx-lg-0 {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }
  .sak32009 .mx-lg-1 {
    margin-right: 0.25rem !important;
    margin-left: 0.25rem !important;
  }
  .sak32009 .mx-lg-2 {
    margin-right: 0.5rem !important;
    margin-left: 0.5rem !important;
  }
  .sak32009 .mx-lg-3 {
    margin-right: 1rem !important;
    margin-left: 1rem !important;
  }
  .sak32009 .mx-lg-4 {
    margin-right: 1.5rem !important;
    margin-left: 1.5rem !important;
  }
  .sak32009 .mx-lg-5 {
    margin-right: 3rem !important;
    margin-left: 3rem !important;
  }
  .sak32009 .mx-lg-auto {
    margin-right: auto !important;
    margin-left: auto !important;
  }
  .sak32009 .my-lg-0 {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
  .sak32009 .my-lg-1 {
    margin-top: 0.25rem !important;
    margin-bottom: 0.25rem !important;
  }
  .sak32009 .my-lg-2 {
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }
  .sak32009 .my-lg-3 {
    margin-top: 1rem !important;
    margin-bottom: 1rem !important;
  }
  .sak32009 .my-lg-4 {
    margin-top: 1.5rem !important;
    margin-bottom: 1.5rem !important;
  }
  .sak32009 .my-lg-5 {
    margin-top: 3rem !important;
    margin-bottom: 3rem !important;
  }
  .sak32009 .my-lg-auto {
    margin-top: auto !important;
    margin-bottom: auto !important;
  }
  .sak32009 .mt-lg-0 {
    margin-top: 0 !important;
  }
  .sak32009 .mt-lg-1 {
    margin-top: 0.25rem !important;
  }
  .sak32009 .mt-lg-2 {
    margin-top: 0.5rem !important;
  }
  .sak32009 .mt-lg-3 {
    margin-top: 1rem !important;
  }
  .sak32009 .mt-lg-4 {
    margin-top: 1.5rem !important;
  }
  .sak32009 .mt-lg-5 {
    margin-top: 3rem !important;
  }
  .sak32009 .mt-lg-auto {
    margin-top: auto !important;
  }
  .sak32009 .me-lg-0 {
    margin-right: 0 !important;
  }
  .sak32009 .me-lg-1 {
    margin-right: 0.25rem !important;
  }
  .sak32009 .me-lg-2 {
    margin-right: 0.5rem !important;
  }
  .sak32009 .me-lg-3 {
    margin-right: 1rem !important;
  }
  .sak32009 .me-lg-4 {
    margin-right: 1.5rem !important;
  }
  .sak32009 .me-lg-5 {
    margin-right: 3rem !important;
  }
  .sak32009 .me-lg-auto {
    margin-right: auto !important;
  }
  .sak32009 .mb-lg-0 {
    margin-bottom: 0 !important;
  }
  .sak32009 .mb-lg-1 {
    margin-bottom: 0.25rem !important;
  }
  .sak32009 .mb-lg-2 {
    margin-bottom: 0.5rem !important;
  }
  .sak32009 .mb-lg-3 {
    margin-bottom: 1rem !important;
  }
  .sak32009 .mb-lg-4 {
    margin-bottom: 1.5rem !important;
  }
  .sak32009 .mb-lg-5 {
    margin-bottom: 3rem !important;
  }
  .sak32009 .mb-lg-auto {
    margin-bottom: auto !important;
  }
  .sak32009 .ms-lg-0 {
    margin-left: 0 !important;
  }
  .sak32009 .ms-lg-1 {
    margin-left: 0.25rem !important;
  }
  .sak32009 .ms-lg-2 {
    margin-left: 0.5rem !important;
  }
  .sak32009 .ms-lg-3 {
    margin-left: 1rem !important;
  }
  .sak32009 .ms-lg-4 {
    margin-left: 1.5rem !important;
  }
  .sak32009 .ms-lg-5 {
    margin-left: 3rem !important;
  }
  .sak32009 .ms-lg-auto {
    margin-left: auto !important;
  }
  .sak32009 .p-lg-0 {
    padding: 0 !important;
  }
  .sak32009 .p-lg-1 {
    padding: 0.25rem !important;
  }
  .sak32009 .p-lg-2 {
    padding: 0.5rem !important;
  }
  .sak32009 .p-lg-3 {
    padding: 1rem !important;
  }
  .sak32009 .p-lg-4 {
    padding: 1.5rem !important;
  }
  .sak32009 .p-lg-5 {
    padding: 3rem !important;
  }
  .sak32009 .px-lg-0 {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
  .sak32009 .px-lg-1 {
    padding-right: 0.25rem !important;
    padding-left: 0.25rem !important;
  }
  .sak32009 .px-lg-2 {
    padding-right: 0.5rem !important;
    padding-left: 0.5rem !important;
  }
  .sak32009 .px-lg-3 {
    padding-right: 1rem !important;
    padding-left: 1rem !important;
  }
  .sak32009 .px-lg-4 {
    padding-right: 1.5rem !important;
    padding-left: 1.5rem !important;
  }
  .sak32009 .px-lg-5 {
    padding-right: 3rem !important;
    padding-left: 3rem !important;
  }
  .sak32009 .py-lg-0 {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
  .sak32009 .py-lg-1 {
    padding-top: 0.25rem !important;
    padding-bottom: 0.25rem !important;
  }
  .sak32009 .py-lg-2 {
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
  }
  .sak32009 .py-lg-3 {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
  }
  .sak32009 .py-lg-4 {
    padding-top: 1.5rem !important;
    padding-bottom: 1.5rem !important;
  }
  .sak32009 .py-lg-5 {
    padding-top: 3rem !important;
    padding-bottom: 3rem !important;
  }
  .sak32009 .pt-lg-0 {
    padding-top: 0 !important;
  }
  .sak32009 .pt-lg-1 {
    padding-top: 0.25rem !important;
  }
  .sak32009 .pt-lg-2 {
    padding-top: 0.5rem !important;
  }
  .sak32009 .pt-lg-3 {
    padding-top: 1rem !important;
  }
  .sak32009 .pt-lg-4 {
    padding-top: 1.5rem !important;
  }
  .sak32009 .pt-lg-5 {
    padding-top: 3rem !important;
  }
  .sak32009 .pe-lg-0 {
    padding-right: 0 !important;
  }
  .sak32009 .pe-lg-1 {
    padding-right: 0.25rem !important;
  }
  .sak32009 .pe-lg-2 {
    padding-right: 0.5rem !important;
  }
  .sak32009 .pe-lg-3 {
    padding-right: 1rem !important;
  }
  .sak32009 .pe-lg-4 {
    padding-right: 1.5rem !important;
  }
  .sak32009 .pe-lg-5 {
    padding-right: 3rem !important;
  }
  .sak32009 .pb-lg-0 {
    padding-bottom: 0 !important;
  }
  .sak32009 .pb-lg-1 {
    padding-bottom: 0.25rem !important;
  }
  .sak32009 .pb-lg-2 {
    padding-bottom: 0.5rem !important;
  }
  .sak32009 .pb-lg-3 {
    padding-bottom: 1rem !important;
  }
  .sak32009 .pb-lg-4 {
    padding-bottom: 1.5rem !important;
  }
  .sak32009 .pb-lg-5 {
    padding-bottom: 3rem !important;
  }
  .sak32009 .ps-lg-0 {
    padding-left: 0 !important;
  }
  .sak32009 .ps-lg-1 {
    padding-left: 0.25rem !important;
  }
  .sak32009 .ps-lg-2 {
    padding-left: 0.5rem !important;
  }
  .sak32009 .ps-lg-3 {
    padding-left: 1rem !important;
  }
  .sak32009 .ps-lg-4 {
    padding-left: 1.5rem !important;
  }
  .sak32009 .ps-lg-5 {
    padding-left: 3rem !important;
  }
  .sak32009 .gap-lg-0 {
    gap: 0 !important;
  }
  .sak32009 .gap-lg-1 {
    gap: 0.25rem !important;
  }
  .sak32009 .gap-lg-2 {
    gap: 0.5rem !important;
  }
  .sak32009 .gap-lg-3 {
    gap: 1rem !important;
  }
  .sak32009 .gap-lg-4 {
    gap: 1.5rem !important;
  }
  .sak32009 .gap-lg-5 {
    gap: 3rem !important;
  }
  .sak32009 .text-lg-start {
    text-align: left !important;
  }
  .sak32009 .text-lg-end {
    text-align: right !important;
  }
  .sak32009 .text-lg-center {
    text-align: center !important;
  }
}
@media (min-width: 1200px) {
  .sak32009 .float-xl-start {
    float: left !important;
  }
  .sak32009 .float-xl-end {
    float: right !important;
  }
  .sak32009 .float-xl-none {
    float: none !important;
  }
  .sak32009 .d-xl-inline {
    display: inline !important;
  }
  .sak32009 .d-xl-inline-block {
    display: inline-block !important;
  }
  .sak32009 .d-xl-block {
    display: block !important;
  }
  .sak32009 .d-xl-grid {
    display: grid !important;
  }
  .sak32009 .d-xl-table {
    display: table !important;
  }
  .sak32009 .d-xl-table-row {
    display: table-row !important;
  }
  .sak32009 .d-xl-table-cell {
    display: table-cell !important;
  }
  .sak32009 .d-xl-flex {
    display: flex !important;
  }
  .sak32009 .d-xl-inline-flex {
    display: inline-flex !important;
  }
  .sak32009 .d-xl-none {
    display: none !important;
  }
  .sak32009 .flex-xl-fill {
    flex: 1 1 auto !important;
  }
  .sak32009 .flex-xl-row {
    flex-direction: row !important;
  }
  .sak32009 .flex-xl-column {
    flex-direction: column !important;
  }
  .sak32009 .flex-xl-row-reverse {
    flex-direction: row-reverse !important;
  }
  .sak32009 .flex-xl-column-reverse {
    flex-direction: column-reverse !important;
  }
  .sak32009 .flex-xl-grow-0 {
    flex-grow: 0 !important;
  }
  .sak32009 .flex-xl-grow-1 {
    flex-grow: 1 !important;
  }
  .sak32009 .flex-xl-shrink-0 {
    flex-shrink: 0 !important;
  }
  .sak32009 .flex-xl-shrink-1 {
    flex-shrink: 1 !important;
  }
  .sak32009 .flex-xl-wrap {
    flex-wrap: wrap !important;
  }
  .sak32009 .flex-xl-nowrap {
    flex-wrap: nowrap !important;
  }
  .sak32009 .flex-xl-wrap-reverse {
    flex-wrap: wrap-reverse !important;
  }
  .sak32009 .justify-content-xl-start {
    justify-content: flex-start !important;
  }
  .sak32009 .justify-content-xl-end {
    justify-content: flex-end !important;
  }
  .sak32009 .justify-content-xl-center {
    justify-content: center !important;
  }
  .sak32009 .justify-content-xl-between {
    justify-content: space-between !important;
  }
  .sak32009 .justify-content-xl-around {
    justify-content: space-around !important;
  }
  .sak32009 .justify-content-xl-evenly {
    justify-content: space-evenly !important;
  }
  .sak32009 .align-items-xl-start {
    align-items: flex-start !important;
  }
  .sak32009 .align-items-xl-end {
    align-items: flex-end !important;
  }
  .sak32009 .align-items-xl-center {
    align-items: center !important;
  }
  .sak32009 .align-items-xl-baseline {
    align-items: baseline !important;
  }
  .sak32009 .align-items-xl-stretch {
    align-items: stretch !important;
  }
  .sak32009 .align-content-xl-start {
    align-content: flex-start !important;
  }
  .sak32009 .align-content-xl-end {
    align-content: flex-end !important;
  }
  .sak32009 .align-content-xl-center {
    align-content: center !important;
  }
  .sak32009 .align-content-xl-between {
    align-content: space-between !important;
  }
  .sak32009 .align-content-xl-around {
    align-content: space-around !important;
  }
  .sak32009 .align-content-xl-stretch {
    align-content: stretch !important;
  }
  .sak32009 .align-self-xl-auto {
    align-self: auto !important;
  }
  .sak32009 .align-self-xl-start {
    align-self: flex-start !important;
  }
  .sak32009 .align-self-xl-end {
    align-self: flex-end !important;
  }
  .sak32009 .align-self-xl-center {
    align-self: center !important;
  }
  .sak32009 .align-self-xl-baseline {
    align-self: baseline !important;
  }
  .sak32009 .align-self-xl-stretch {
    align-self: stretch !important;
  }
  .sak32009 .order-xl-first {
    order: -1 !important;
  }
  .sak32009 .order-xl-0 {
    order: 0 !important;
  }
  .sak32009 .order-xl-1 {
    order: 1 !important;
  }
  .sak32009 .order-xl-2 {
    order: 2 !important;
  }
  .sak32009 .order-xl-3 {
    order: 3 !important;
  }
  .sak32009 .order-xl-4 {
    order: 4 !important;
  }
  .sak32009 .order-xl-5 {
    order: 5 !important;
  }
  .sak32009 .order-xl-last {
    order: 6 !important;
  }
  .sak32009 .m-xl-0 {
    margin: 0 !important;
  }
  .sak32009 .m-xl-1 {
    margin: 0.25rem !important;
  }
  .sak32009 .m-xl-2 {
    margin: 0.5rem !important;
  }
  .sak32009 .m-xl-3 {
    margin: 1rem !important;
  }
  .sak32009 .m-xl-4 {
    margin: 1.5rem !important;
  }
  .sak32009 .m-xl-5 {
    margin: 3rem !important;
  }
  .sak32009 .m-xl-auto {
    margin: auto !important;
  }
  .sak32009 .mx-xl-0 {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }
  .sak32009 .mx-xl-1 {
    margin-right: 0.25rem !important;
    margin-left: 0.25rem !important;
  }
  .sak32009 .mx-xl-2 {
    margin-right: 0.5rem !important;
    margin-left: 0.5rem !important;
  }
  .sak32009 .mx-xl-3 {
    margin-right: 1rem !important;
    margin-left: 1rem !important;
  }
  .sak32009 .mx-xl-4 {
    margin-right: 1.5rem !important;
    margin-left: 1.5rem !important;
  }
  .sak32009 .mx-xl-5 {
    margin-right: 3rem !important;
    margin-left: 3rem !important;
  }
  .sak32009 .mx-xl-auto {
    margin-right: auto !important;
    margin-left: auto !important;
  }
  .sak32009 .my-xl-0 {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
  .sak32009 .my-xl-1 {
    margin-top: 0.25rem !important;
    margin-bottom: 0.25rem !important;
  }
  .sak32009 .my-xl-2 {
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }
  .sak32009 .my-xl-3 {
    margin-top: 1rem !important;
    margin-bottom: 1rem !important;
  }
  .sak32009 .my-xl-4 {
    margin-top: 1.5rem !important;
    margin-bottom: 1.5rem !important;
  }
  .sak32009 .my-xl-5 {
    margin-top: 3rem !important;
    margin-bottom: 3rem !important;
  }
  .sak32009 .my-xl-auto {
    margin-top: auto !important;
    margin-bottom: auto !important;
  }
  .sak32009 .mt-xl-0 {
    margin-top: 0 !important;
  }
  .sak32009 .mt-xl-1 {
    margin-top: 0.25rem !important;
  }
  .sak32009 .mt-xl-2 {
    margin-top: 0.5rem !important;
  }
  .sak32009 .mt-xl-3 {
    margin-top: 1rem !important;
  }
  .sak32009 .mt-xl-4 {
    margin-top: 1.5rem !important;
  }
  .sak32009 .mt-xl-5 {
    margin-top: 3rem !important;
  }
  .sak32009 .mt-xl-auto {
    margin-top: auto !important;
  }
  .sak32009 .me-xl-0 {
    margin-right: 0 !important;
  }
  .sak32009 .me-xl-1 {
    margin-right: 0.25rem !important;
  }
  .sak32009 .me-xl-2 {
    margin-right: 0.5rem !important;
  }
  .sak32009 .me-xl-3 {
    margin-right: 1rem !important;
  }
  .sak32009 .me-xl-4 {
    margin-right: 1.5rem !important;
  }
  .sak32009 .me-xl-5 {
    margin-right: 3rem !important;
  }
  .sak32009 .me-xl-auto {
    margin-right: auto !important;
  }
  .sak32009 .mb-xl-0 {
    margin-bottom: 0 !important;
  }
  .sak32009 .mb-xl-1 {
    margin-bottom: 0.25rem !important;
  }
  .sak32009 .mb-xl-2 {
    margin-bottom: 0.5rem !important;
  }
  .sak32009 .mb-xl-3 {
    margin-bottom: 1rem !important;
  }
  .sak32009 .mb-xl-4 {
    margin-bottom: 1.5rem !important;
  }
  .sak32009 .mb-xl-5 {
    margin-bottom: 3rem !important;
  }
  .sak32009 .mb-xl-auto {
    margin-bottom: auto !important;
  }
  .sak32009 .ms-xl-0 {
    margin-left: 0 !important;
  }
  .sak32009 .ms-xl-1 {
    margin-left: 0.25rem !important;
  }
  .sak32009 .ms-xl-2 {
    margin-left: 0.5rem !important;
  }
  .sak32009 .ms-xl-3 {
    margin-left: 1rem !important;
  }
  .sak32009 .ms-xl-4 {
    margin-left: 1.5rem !important;
  }
  .sak32009 .ms-xl-5 {
    margin-left: 3rem !important;
  }
  .sak32009 .ms-xl-auto {
    margin-left: auto !important;
  }
  .sak32009 .p-xl-0 {
    padding: 0 !important;
  }
  .sak32009 .p-xl-1 {
    padding: 0.25rem !important;
  }
  .sak32009 .p-xl-2 {
    padding: 0.5rem !important;
  }
  .sak32009 .p-xl-3 {
    padding: 1rem !important;
  }
  .sak32009 .p-xl-4 {
    padding: 1.5rem !important;
  }
  .sak32009 .p-xl-5 {
    padding: 3rem !important;
  }
  .sak32009 .px-xl-0 {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
  .sak32009 .px-xl-1 {
    padding-right: 0.25rem !important;
    padding-left: 0.25rem !important;
  }
  .sak32009 .px-xl-2 {
    padding-right: 0.5rem !important;
    padding-left: 0.5rem !important;
  }
  .sak32009 .px-xl-3 {
    padding-right: 1rem !important;
    padding-left: 1rem !important;
  }
  .sak32009 .px-xl-4 {
    padding-right: 1.5rem !important;
    padding-left: 1.5rem !important;
  }
  .sak32009 .px-xl-5 {
    padding-right: 3rem !important;
    padding-left: 3rem !important;
  }
  .sak32009 .py-xl-0 {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
  .sak32009 .py-xl-1 {
    padding-top: 0.25rem !important;
    padding-bottom: 0.25rem !important;
  }
  .sak32009 .py-xl-2 {
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
  }
  .sak32009 .py-xl-3 {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
  }
  .sak32009 .py-xl-4 {
    padding-top: 1.5rem !important;
    padding-bottom: 1.5rem !important;
  }
  .sak32009 .py-xl-5 {
    padding-top: 3rem !important;
    padding-bottom: 3rem !important;
  }
  .sak32009 .pt-xl-0 {
    padding-top: 0 !important;
  }
  .sak32009 .pt-xl-1 {
    padding-top: 0.25rem !important;
  }
  .sak32009 .pt-xl-2 {
    padding-top: 0.5rem !important;
  }
  .sak32009 .pt-xl-3 {
    padding-top: 1rem !important;
  }
  .sak32009 .pt-xl-4 {
    padding-top: 1.5rem !important;
  }
  .sak32009 .pt-xl-5 {
    padding-top: 3rem !important;
  }
  .sak32009 .pe-xl-0 {
    padding-right: 0 !important;
  }
  .sak32009 .pe-xl-1 {
    padding-right: 0.25rem !important;
  }
  .sak32009 .pe-xl-2 {
    padding-right: 0.5rem !important;
  }
  .sak32009 .pe-xl-3 {
    padding-right: 1rem !important;
  }
  .sak32009 .pe-xl-4 {
    padding-right: 1.5rem !important;
  }
  .sak32009 .pe-xl-5 {
    padding-right: 3rem !important;
  }
  .sak32009 .pb-xl-0 {
    padding-bottom: 0 !important;
  }
  .sak32009 .pb-xl-1 {
    padding-bottom: 0.25rem !important;
  }
  .sak32009 .pb-xl-2 {
    padding-bottom: 0.5rem !important;
  }
  .sak32009 .pb-xl-3 {
    padding-bottom: 1rem !important;
  }
  .sak32009 .pb-xl-4 {
    padding-bottom: 1.5rem !important;
  }
  .sak32009 .pb-xl-5 {
    padding-bottom: 3rem !important;
  }
  .sak32009 .ps-xl-0 {
    padding-left: 0 !important;
  }
  .sak32009 .ps-xl-1 {
    padding-left: 0.25rem !important;
  }
  .sak32009 .ps-xl-2 {
    padding-left: 0.5rem !important;
  }
  .sak32009 .ps-xl-3 {
    padding-left: 1rem !important;
  }
  .sak32009 .ps-xl-4 {
    padding-left: 1.5rem !important;
  }
  .sak32009 .ps-xl-5 {
    padding-left: 3rem !important;
  }
  .sak32009 .gap-xl-0 {
    gap: 0 !important;
  }
  .sak32009 .gap-xl-1 {
    gap: 0.25rem !important;
  }
  .sak32009 .gap-xl-2 {
    gap: 0.5rem !important;
  }
  .sak32009 .gap-xl-3 {
    gap: 1rem !important;
  }
  .sak32009 .gap-xl-4 {
    gap: 1.5rem !important;
  }
  .sak32009 .gap-xl-5 {
    gap: 3rem !important;
  }
  .sak32009 .text-xl-start {
    text-align: left !important;
  }
  .sak32009 .text-xl-end {
    text-align: right !important;
  }
  .sak32009 .text-xl-center {
    text-align: center !important;
  }
}
@media (min-width: 1400px) {
  .sak32009 .float-xxl-start {
    float: left !important;
  }
  .sak32009 .float-xxl-end {
    float: right !important;
  }
  .sak32009 .float-xxl-none {
    float: none !important;
  }
  .sak32009 .d-xxl-inline {
    display: inline !important;
  }
  .sak32009 .d-xxl-inline-block {
    display: inline-block !important;
  }
  .sak32009 .d-xxl-block {
    display: block !important;
  }
  .sak32009 .d-xxl-grid {
    display: grid !important;
  }
  .sak32009 .d-xxl-table {
    display: table !important;
  }
  .sak32009 .d-xxl-table-row {
    display: table-row !important;
  }
  .sak32009 .d-xxl-table-cell {
    display: table-cell !important;
  }
  .sak32009 .d-xxl-flex {
    display: flex !important;
  }
  .sak32009 .d-xxl-inline-flex {
    display: inline-flex !important;
  }
  .sak32009 .d-xxl-none {
    display: none !important;
  }
  .sak32009 .flex-xxl-fill {
    flex: 1 1 auto !important;
  }
  .sak32009 .flex-xxl-row {
    flex-direction: row !important;
  }
  .sak32009 .flex-xxl-column {
    flex-direction: column !important;
  }
  .sak32009 .flex-xxl-row-reverse {
    flex-direction: row-reverse !important;
  }
  .sak32009 .flex-xxl-column-reverse {
    flex-direction: column-reverse !important;
  }
  .sak32009 .flex-xxl-grow-0 {
    flex-grow: 0 !important;
  }
  .sak32009 .flex-xxl-grow-1 {
    flex-grow: 1 !important;
  }
  .sak32009 .flex-xxl-shrink-0 {
    flex-shrink: 0 !important;
  }
  .sak32009 .flex-xxl-shrink-1 {
    flex-shrink: 1 !important;
  }
  .sak32009 .flex-xxl-wrap {
    flex-wrap: wrap !important;
  }
  .sak32009 .flex-xxl-nowrap {
    flex-wrap: nowrap !important;
  }
  .sak32009 .flex-xxl-wrap-reverse {
    flex-wrap: wrap-reverse !important;
  }
  .sak32009 .justify-content-xxl-start {
    justify-content: flex-start !important;
  }
  .sak32009 .justify-content-xxl-end {
    justify-content: flex-end !important;
  }
  .sak32009 .justify-content-xxl-center {
    justify-content: center !important;
  }
  .sak32009 .justify-content-xxl-between {
    justify-content: space-between !important;
  }
  .sak32009 .justify-content-xxl-around {
    justify-content: space-around !important;
  }
  .sak32009 .justify-content-xxl-evenly {
    justify-content: space-evenly !important;
  }
  .sak32009 .align-items-xxl-start {
    align-items: flex-start !important;
  }
  .sak32009 .align-items-xxl-end {
    align-items: flex-end !important;
  }
  .sak32009 .align-items-xxl-center {
    align-items: center !important;
  }
  .sak32009 .align-items-xxl-baseline {
    align-items: baseline !important;
  }
  .sak32009 .align-items-xxl-stretch {
    align-items: stretch !important;
  }
  .sak32009 .align-content-xxl-start {
    align-content: flex-start !important;
  }
  .sak32009 .align-content-xxl-end {
    align-content: flex-end !important;
  }
  .sak32009 .align-content-xxl-center {
    align-content: center !important;
  }
  .sak32009 .align-content-xxl-between {
    align-content: space-between !important;
  }
  .sak32009 .align-content-xxl-around {
    align-content: space-around !important;
  }
  .sak32009 .align-content-xxl-stretch {
    align-content: stretch !important;
  }
  .sak32009 .align-self-xxl-auto {
    align-self: auto !important;
  }
  .sak32009 .align-self-xxl-start {
    align-self: flex-start !important;
  }
  .sak32009 .align-self-xxl-end {
    align-self: flex-end !important;
  }
  .sak32009 .align-self-xxl-center {
    align-self: center !important;
  }
  .sak32009 .align-self-xxl-baseline {
    align-self: baseline !important;
  }
  .sak32009 .align-self-xxl-stretch {
    align-self: stretch !important;
  }
  .sak32009 .order-xxl-first {
    order: -1 !important;
  }
  .sak32009 .order-xxl-0 {
    order: 0 !important;
  }
  .sak32009 .order-xxl-1 {
    order: 1 !important;
  }
  .sak32009 .order-xxl-2 {
    order: 2 !important;
  }
  .sak32009 .order-xxl-3 {
    order: 3 !important;
  }
  .sak32009 .order-xxl-4 {
    order: 4 !important;
  }
  .sak32009 .order-xxl-5 {
    order: 5 !important;
  }
  .sak32009 .order-xxl-last {
    order: 6 !important;
  }
  .sak32009 .m-xxl-0 {
    margin: 0 !important;
  }
  .sak32009 .m-xxl-1 {
    margin: 0.25rem !important;
  }
  .sak32009 .m-xxl-2 {
    margin: 0.5rem !important;
  }
  .sak32009 .m-xxl-3 {
    margin: 1rem !important;
  }
  .sak32009 .m-xxl-4 {
    margin: 1.5rem !important;
  }
  .sak32009 .m-xxl-5 {
    margin: 3rem !important;
  }
  .sak32009 .m-xxl-auto {
    margin: auto !important;
  }
  .sak32009 .mx-xxl-0 {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }
  .sak32009 .mx-xxl-1 {
    margin-right: 0.25rem !important;
    margin-left: 0.25rem !important;
  }
  .sak32009 .mx-xxl-2 {
    margin-right: 0.5rem !important;
    margin-left: 0.5rem !important;
  }
  .sak32009 .mx-xxl-3 {
    margin-right: 1rem !important;
    margin-left: 1rem !important;
  }
  .sak32009 .mx-xxl-4 {
    margin-right: 1.5rem !important;
    margin-left: 1.5rem !important;
  }
  .sak32009 .mx-xxl-5 {
    margin-right: 3rem !important;
    margin-left: 3rem !important;
  }
  .sak32009 .mx-xxl-auto {
    margin-right: auto !important;
    margin-left: auto !important;
  }
  .sak32009 .my-xxl-0 {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
  .sak32009 .my-xxl-1 {
    margin-top: 0.25rem !important;
    margin-bottom: 0.25rem !important;
  }
  .sak32009 .my-xxl-2 {
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }
  .sak32009 .my-xxl-3 {
    margin-top: 1rem !important;
    margin-bottom: 1rem !important;
  }
  .sak32009 .my-xxl-4 {
    margin-top: 1.5rem !important;
    margin-bottom: 1.5rem !important;
  }
  .sak32009 .my-xxl-5 {
    margin-top: 3rem !important;
    margin-bottom: 3rem !important;
  }
  .sak32009 .my-xxl-auto {
    margin-top: auto !important;
    margin-bottom: auto !important;
  }
  .sak32009 .mt-xxl-0 {
    margin-top: 0 !important;
  }
  .sak32009 .mt-xxl-1 {
    margin-top: 0.25rem !important;
  }
  .sak32009 .mt-xxl-2 {
    margin-top: 0.5rem !important;
  }
  .sak32009 .mt-xxl-3 {
    margin-top: 1rem !important;
  }
  .sak32009 .mt-xxl-4 {
    margin-top: 1.5rem !important;
  }
  .sak32009 .mt-xxl-5 {
    margin-top: 3rem !important;
  }
  .sak32009 .mt-xxl-auto {
    margin-top: auto !important;
  }
  .sak32009 .me-xxl-0 {
    margin-right: 0 !important;
  }
  .sak32009 .me-xxl-1 {
    margin-right: 0.25rem !important;
  }
  .sak32009 .me-xxl-2 {
    margin-right: 0.5rem !important;
  }
  .sak32009 .me-xxl-3 {
    margin-right: 1rem !important;
  }
  .sak32009 .me-xxl-4 {
    margin-right: 1.5rem !important;
  }
  .sak32009 .me-xxl-5 {
    margin-right: 3rem !important;
  }
  .sak32009 .me-xxl-auto {
    margin-right: auto !important;
  }
  .sak32009 .mb-xxl-0 {
    margin-bottom: 0 !important;
  }
  .sak32009 .mb-xxl-1 {
    margin-bottom: 0.25rem !important;
  }
  .sak32009 .mb-xxl-2 {
    margin-bottom: 0.5rem !important;
  }
  .sak32009 .mb-xxl-3 {
    margin-bottom: 1rem !important;
  }
  .sak32009 .mb-xxl-4 {
    margin-bottom: 1.5rem !important;
  }
  .sak32009 .mb-xxl-5 {
    margin-bottom: 3rem !important;
  }
  .sak32009 .mb-xxl-auto {
    margin-bottom: auto !important;
  }
  .sak32009 .ms-xxl-0 {
    margin-left: 0 !important;
  }
  .sak32009 .ms-xxl-1 {
    margin-left: 0.25rem !important;
  }
  .sak32009 .ms-xxl-2 {
    margin-left: 0.5rem !important;
  }
  .sak32009 .ms-xxl-3 {
    margin-left: 1rem !important;
  }
  .sak32009 .ms-xxl-4 {
    margin-left: 1.5rem !important;
  }
  .sak32009 .ms-xxl-5 {
    margin-left: 3rem !important;
  }
  .sak32009 .ms-xxl-auto {
    margin-left: auto !important;
  }
  .sak32009 .p-xxl-0 {
    padding: 0 !important;
  }
  .sak32009 .p-xxl-1 {
    padding: 0.25rem !important;
  }
  .sak32009 .p-xxl-2 {
    padding: 0.5rem !important;
  }
  .sak32009 .p-xxl-3 {
    padding: 1rem !important;
  }
  .sak32009 .p-xxl-4 {
    padding: 1.5rem !important;
  }
  .sak32009 .p-xxl-5 {
    padding: 3rem !important;
  }
  .sak32009 .px-xxl-0 {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
  .sak32009 .px-xxl-1 {
    padding-right: 0.25rem !important;
    padding-left: 0.25rem !important;
  }
  .sak32009 .px-xxl-2 {
    padding-right: 0.5rem !important;
    padding-left: 0.5rem !important;
  }
  .sak32009 .px-xxl-3 {
    padding-right: 1rem !important;
    padding-left: 1rem !important;
  }
  .sak32009 .px-xxl-4 {
    padding-right: 1.5rem !important;
    padding-left: 1.5rem !important;
  }
  .sak32009 .px-xxl-5 {
    padding-right: 3rem !important;
    padding-left: 3rem !important;
  }
  .sak32009 .py-xxl-0 {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
  .sak32009 .py-xxl-1 {
    padding-top: 0.25rem !important;
    padding-bottom: 0.25rem !important;
  }
  .sak32009 .py-xxl-2 {
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
  }
  .sak32009 .py-xxl-3 {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
  }
  .sak32009 .py-xxl-4 {
    padding-top: 1.5rem !important;
    padding-bottom: 1.5rem !important;
  }
  .sak32009 .py-xxl-5 {
    padding-top: 3rem !important;
    padding-bottom: 3rem !important;
  }
  .sak32009 .pt-xxl-0 {
    padding-top: 0 !important;
  }
  .sak32009 .pt-xxl-1 {
    padding-top: 0.25rem !important;
  }
  .sak32009 .pt-xxl-2 {
    padding-top: 0.5rem !important;
  }
  .sak32009 .pt-xxl-3 {
    padding-top: 1rem !important;
  }
  .sak32009 .pt-xxl-4 {
    padding-top: 1.5rem !important;
  }
  .sak32009 .pt-xxl-5 {
    padding-top: 3rem !important;
  }
  .sak32009 .pe-xxl-0 {
    padding-right: 0 !important;
  }
  .sak32009 .pe-xxl-1 {
    padding-right: 0.25rem !important;
  }
  .sak32009 .pe-xxl-2 {
    padding-right: 0.5rem !important;
  }
  .sak32009 .pe-xxl-3 {
    padding-right: 1rem !important;
  }
  .sak32009 .pe-xxl-4 {
    padding-right: 1.5rem !important;
  }
  .sak32009 .pe-xxl-5 {
    padding-right: 3rem !important;
  }
  .sak32009 .pb-xxl-0 {
    padding-bottom: 0 !important;
  }
  .sak32009 .pb-xxl-1 {
    padding-bottom: 0.25rem !important;
  }
  .sak32009 .pb-xxl-2 {
    padding-bottom: 0.5rem !important;
  }
  .sak32009 .pb-xxl-3 {
    padding-bottom: 1rem !important;
  }
  .sak32009 .pb-xxl-4 {
    padding-bottom: 1.5rem !important;
  }
  .sak32009 .pb-xxl-5 {
    padding-bottom: 3rem !important;
  }
  .sak32009 .ps-xxl-0 {
    padding-left: 0 !important;
  }
  .sak32009 .ps-xxl-1 {
    padding-left: 0.25rem !important;
  }
  .sak32009 .ps-xxl-2 {
    padding-left: 0.5rem !important;
  }
  .sak32009 .ps-xxl-3 {
    padding-left: 1rem !important;
  }
  .sak32009 .ps-xxl-4 {
    padding-left: 1.5rem !important;
  }
  .sak32009 .ps-xxl-5 {
    padding-left: 3rem !important;
  }
  .sak32009 .gap-xxl-0 {
    gap: 0 !important;
  }
  .sak32009 .gap-xxl-1 {
    gap: 0.25rem !important;
  }
  .sak32009 .gap-xxl-2 {
    gap: 0.5rem !important;
  }
  .sak32009 .gap-xxl-3 {
    gap: 1rem !important;
  }
  .sak32009 .gap-xxl-4 {
    gap: 1.5rem !important;
  }
  .sak32009 .gap-xxl-5 {
    gap: 3rem !important;
  }
  .sak32009 .text-xxl-start {
    text-align: left !important;
  }
  .sak32009 .text-xxl-end {
    text-align: right !important;
  }
  .sak32009 .text-xxl-center {
    text-align: center !important;
  }
}
@media (min-width: 1200px) {
  .sak32009 .fs-1 {
    font-size: 2.5rem !important;
  }
  .sak32009 .fs-2 {
    font-size: 2rem !important;
  }
  .sak32009 .fs-3 {
    font-size: 1.75rem !important;
  }
  .sak32009 .fs-4 {
    font-size: 1.5rem !important;
  }
}
@media print {
  .sak32009 .d-print-inline {
    display: inline !important;
  }
  .sak32009 .d-print-inline-block {
    display: inline-block !important;
  }
  .sak32009 .d-print-block {
    display: block !important;
  }
  .sak32009 .d-print-grid {
    display: grid !important;
  }
  .sak32009 .d-print-table {
    display: table !important;
  }
  .sak32009 .d-print-table-row {
    display: table-row !important;
  }
  .sak32009 .d-print-table-cell {
    display: table-cell !important;
  }
  .sak32009 .d-print-flex {
    display: flex !important;
  }
  .sak32009 .d-print-inline-flex {
    display: inline-flex !important;
  }
  .sak32009 .d-print-none {
    display: none !important;
  }
}
.modal-backdrop {
  z-index: 99992;
}
.sak32009 .modal {
  z-index: 99993;
}
.sak32009 .modal .modal-header-logo img {
  width: 96px;
  height: 96px;
}
.sak32009 .modal .resize-none {
  resize: none;
}`)();
const unsafeWindowC = unsafeWindow;
const unsafejQuery = typeof unsafeWindowC.jQuery === "undefined" ? unsafeWindowC.wrappedJSObject.jQuery : unsafeWindowC.jQuery;
class Sak32009 {
  constructor() {
    __publicField(this, "extractedData", {
      appId: "",
      countAll: 0,
      countDlcs: 0,
      countDlcsUnknowns: 0,
      dlcs: {},
      dlcsUnknowns: {},
      name: "",
      withDlcsUnknowns: false
    });
    __publicField(this, "allowedUrls", {
      steamdbApp: "https://steamdb.info/app/",
      steamdbDepot: "https://steamdb.info/depot/",
      steamPowered: "https://store.steampowered.com/app/"
    });
    __publicField(this, "isAllowedUrls", {
      steamdbApp: false,
      steamdbDepot: false,
      steamPowered: false
    });
    __publicField(this, "titleScript", `${productName} v${version}<br><small>by ${author.name} | ${year}</small>`);
  }
  runScript() {
    GM_addStyle(skStyles);
    const { href } = window.location;
    if (href.startsWith(this.allowedUrls.steamdbApp)) {
      this.isAllowedUrls.steamdbApp = true;
      this.getDataFromSteamDbApp();
    } else if (href.startsWith(this.allowedUrls.steamdbDepot)) {
      this.isAllowedUrls.steamdbDepot = true;
      this.getDataFromSteamDbDepot();
    } else if (href.startsWith(this.allowedUrls.steamPowered)) {
      this.isAllowedUrls.steamPowered = true;
      this.getDataFromSteamPowered();
    }
    if (this.extractedData.countAll > 0) {
      this.setModal();
    }
  }
  getDataFromSteamDbApp() {
    this.extractedData.appId = $("div[data-appid]").attr("data-appid");
    this.extractedData.name = $('h1[itemprop="name"]').text().trim();
    $("#dlc.tab-pane tr.app[data-appid]").each((_index, element) => {
      const dom = $(element);
      const appId = dom.attr("data-appid");
      const appNameSelector = dom.find("td:nth-of-type(2)");
      const appName = appNameSelector.text().trim();
      if (appNameSelector.hasClass("muted")) {
        this.extractedData.dlcsUnknowns[appId] = appName;
        this.extractedData.countDlcsUnknowns += 1;
      } else {
        this.extractedData.dlcs[appId] = appName;
        this.extractedData.countDlcs += 1;
      }
      this.extractedData.countAll += 1;
    });
  }
  getDataFromSteamPowered() {
    this.extractedData.appId = $("div[data-appid]").attr("data-appid");
    this.extractedData.name = $("div#appHubAppName").text().trim();
    $("a.game_area_dlc_row").each((_index, element) => {
      const dom = $(element);
      const appId = dom.attr("data-ds-appid");
      const appName = dom.find(".game_area_dlc_name").text().trim();
      this.extractedData.dlcs[appId] = appName;
      this.extractedData.countDlcs += 1;
      this.extractedData.countAll += 1;
    });
  }
  getDataFromSteamDbDepot() {
    let content = "";
    const depotId = $("div[data-depotid]").attr("data-depotid");
    const depotData = unsafejQuery("div#files .table.file-tree").DataTable().data();
    $.each(depotData, (_index, values) => {
      const fileName = values[0];
      const sha1 = values[1];
      if (sha1 !== "NULL") {
        content += `${sha1} *${fileName}\r
`;
      }
    });
    if (content.length > 0) {
      this.setModal();
      $("a#sake_download").attr({
        download: `${depotId}.sha1`,
        href: this.encodeToDataUri(content)
      });
      $("textarea#sake_textarea").val(content);
    }
  }
  setModal() {
    this.setModalContainer();
    if (!this.isAllowedUrls.steamdbDepot) {
      this.setEvents();
    }
    this.setModalButton();
  }
  setModalButton() {
    $(`<div class="sak32009">
  <button type="button" class="btn btn-sake me-2 rounded-0 rounded-top position-fixed bottom-0 end-0" data-bs-toggle="modal" data-bs-target="#${name}">
    ${this.titleScript}
  </button>
</div>`).appendTo("body");
  }
  setModalContainer() {
    const rendered = mustache.render(skModalHtml, {
      extractedData: this.extractedData,
      isAllowedUrls: this.isAllowedUrls,
      packageName: name,
      packageProductName: productName,
      skAuthorIcon,
      skSelect: this.mustacheObjsToList(data),
      titleScript: this.titleScript
    });
    $(rendered).appendTo("body");
  }
  setEvents() {
    $(document).on("click", ".sak32009 button#sake_convert", (event) => {
      event.preventDefault();
      const selectedOption = $("select#sake_select option:selected").val();
      if (typeof selectedOption === "string") {
        const dataFormatFile = data[selectedOption].file;
        const fileText = dataFormatFile.text;
        const fileName = this.parse(dataFormatFile.name);
        let parsedContent = this.parse(fileText);
        if (selectedOption === "greenLuma2020ManagerBlueAmulet") {
          const parsedContentArray = [...parsedContent];
          parsedContent = `${parsedContentArray.splice(0, parsedContentArray.length - 6).join("")}\r
]\r
`;
        }
        $("textarea#sake_textarea").html(parsedContent).scrollTop(0);
        $("a#sake_download").attr({
          download: fileName,
          href: this.encodeToDataUri(parsedContent)
        }).removeClass("disabled");
      }
    });
    $(document).on("change", ".sak32009 input#sake_unknowns", (event) => {
      this.extractedData.withDlcsUnknowns = $(event.currentTarget).is(":checked");
    });
  }
  encodeToDataUri(content) {
    const textStripped = $("<textarea>").html(content)[0].value;
    const encodedWord = CryptoJS.enc.Utf8.parse(textStripped);
    const encoded = CryptoJS.enc.Base64.stringify(encodedWord);
    return `data:text/plain;charset=utf-8;base64,${encoded}`;
  }
  mustacheObjsToList(pp) {
    const rr = [];
    for (const kk in pp) {
      if (Object.hasOwn(pp, kk)) {
        rr.push({
          "@key": kk,
          "@val": pp[kk]
        });
      }
    }
    return rr;
  }
  parse(content) {
    let out = content;
    out = out.replace(/\[dlcs(?: (fromZero))?(?: prefix="(.*?)")?\]([\s\S]+?)\[\/dlcs\]/gu, (_substring, indexFromZero, indexPrefix, contentOne) => this.parseDlcsMatchValue(contentOne, indexFromZero, indexPrefix));
    out = out.replace(/\[data\]([^[]+)\[\/data\]/gu, (_substring, contentOne) => this.extractedData[contentOne]);
    return out;
  }
  parseDlcsMatchPrefix(index, prefix) {
    return prefix > index.length ? "0".repeat(prefix - index.length) + index : index;
  }
  parseDlcsMatchValue(content, indexFromZero, parameterTwo) {
    let out = "";
    let index = typeof indexFromZero === "undefined" ? 0 : -1;
    const indexPrefix = Number(typeof parameterTwo === "undefined" ? 0 : parameterTwo);
    const dlcs = this.extractedData.withDlcsUnknowns ? __spreadValues(__spreadValues({}, this.extractedData.dlcs), this.extractedData.dlcsUnknowns) : this.extractedData.dlcs;
    $.each(dlcs, (appId, name2) => {
      index += 1;
      out += content.replace(/\{(.*?)\}/gu, (_substring, contentOne) => {
        const values = {
          dlcId: appId,
          dlcIndex: this.parseDlcsMatchPrefix(index.toString(), indexPrefix),
          dlcName: name2
        };
        return values[contentOne];
      });
    });
    return out;
  }
}
const a = new Sak32009();
a.runScript();
