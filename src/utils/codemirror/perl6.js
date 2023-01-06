// Parts from Ace; see <https://raw.githubusercontent.com/ajaxorg/ace/master/LICENSE>
CodeMirror.defineMode("perl6", function(cmCfg, modeCfg) {

  // Fake define() function.
  var moduleHolder = Object.create(null);

  // Given a module path as a string, create the canonical version
  // (no leading ./, no ending .js).
  var canonicalPath = function(path) {
    return path.replace(/\.\//, '').replace(/\.js$/, '');
  };

  // We intentionally add the `path` argument to `define()`.
  var define = function(path, init) {
    var exports = Object.create(null);
    init(require, exports);  // module (3rd parameter) isn't supported.
    moduleHolder[canonicalPath(path)] = exports;
  };

  // path: string of the location of the JS file.
  var require = function(path) { return moduleHolder[canonicalPath(path)]; };

  // All dependencies here.
  define("../lib/oop.js", function(require, exports, module) {
    "use strict";
    
    exports.inherits = function(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
    };
    
    exports.mixin = function(obj, mixin) {
        for (var key in mixin) {
            obj[key] = mixin[key];
        }
        return obj;
    };
    
    exports.implement = function(proto, mixin) {
        exports.mixin(proto, mixin);
    };
    
    });
    

  define("../lib/lang.js", function(require, exports, module) {
    "use strict";
    
    exports.last = function(a) {
        return a[a.length - 1];
    };
    
    exports.stringReverse = function(string) {
        return string.split("").reverse().join("");
    };
    
    exports.stringRepeat = function (string, count) {
        var result = '';
        while (count > 0) {
            if (count & 1)
                result += string;
    
            if (count >>= 1)
                string += string;
        }
        return result;
    };
    
    var trimBeginRegexp = /^\s\s*/;
    var trimEndRegexp = /\s\s*$/;
    
    exports.stringTrimLeft = function (string) {
        return string.replace(trimBeginRegexp, '');
    };
    
    exports.stringTrimRight = function (string) {
        return string.replace(trimEndRegexp, '');
    };
    
    exports.copyObject = function(obj) {
        var copy = {};
        for (var key in obj) {
            copy[key] = obj[key];
        }
        return copy;
    };
    
    exports.copyArray = function(array){
        var copy = [];
        for (var i=0, l=array.length; i<l; i++) {
            if (array[i] && typeof array[i] == "object")
                copy[i] = this.copyObject( array[i] );
            else 
                copy[i] = array[i];
        }
        return copy;
    };
    
    exports.deepCopy = function deepCopy(obj) {
        if (typeof obj !== "object" || !obj)
            return obj;
        var copy;
        if (Array.isArray(obj)) {
            copy = [];
            for (var key = 0; key < obj.length; key++) {
                copy[key] = deepCopy(obj[key]);
            }
            return copy;
        }
        var cons = obj.constructor;
        if (cons === RegExp)
            return obj;
        
        copy = cons();
        for (var key in obj) {
            copy[key] = deepCopy(obj[key]);
        }
        return copy;
    };
    
    exports.arrayToMap = function(arr) {
        var map = {};
        for (var i=0; i<arr.length; i++) {
            map[arr[i]] = 1;
        }
        return map;
    
    };
    
    exports.createMap = function(props) {
        var map = Object.create(null);
        for (var i in props) {
            map[i] = props[i];
        }
        return map;
    };
    
    /*
     * splice out of 'array' anything that === 'value'
     */
    exports.arrayRemove = function(array, value) {
      for (var i = 0; i <= array.length; i++) {
        if (value === array[i]) {
          array.splice(i, 1);
        }
      }
    };
    
    exports.escapeRegExp = function(str) {
        return str.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
    };
    
    exports.escapeHTML = function(str) {
        return str.replace(/&/g, "&#38;").replace(/"/g, "&#34;").replace(/'/g, "&#39;").replace(/</g, "&#60;");
    };
    
    exports.getMatchOffsets = function(string, regExp) {
        var matches = [];
    
        string.replace(regExp, function(str) {
            matches.push({
                offset: arguments[arguments.length-2],
                length: str.length
            });
        });
    
        return matches;
    };
    
    /* deprecated */
    exports.deferredCall = function(fcn) {
        var timer = null;
        var callback = function() {
            timer = null;
            fcn();
        };
    
        var deferred = function(timeout) {
            deferred.cancel();
            timer = setTimeout(callback, timeout || 0);
            return deferred;
        };
    
        deferred.schedule = deferred;
    
        deferred.call = function() {
            this.cancel();
            fcn();
            return deferred;
        };
    
        deferred.cancel = function() {
            clearTimeout(timer);
            timer = null;
            return deferred;
        };
        
        deferred.isPending = function() {
            return timer;
        };
    
        return deferred;
    };
    
    
    exports.delayedCall = function(fcn, defaultTimeout) {
        var timer = null;
        var callback = function() {
            timer = null;
            fcn();
        };
    
        var _self = function(timeout) {
            if (timer == null)
                timer = setTimeout(callback, timeout || defaultTimeout);
        };
    
        _self.delay = function(timeout) {
            timer && clearTimeout(timer);
            timer = setTimeout(callback, timeout || defaultTimeout);
        };
        _self.schedule = _self;
    
        _self.call = function() {
            this.cancel();
            fcn();
        };
    
        _self.cancel = function() {
            timer && clearTimeout(timer);
            timer = null;
        };
    
        _self.isPending = function() {
            return timer;
        };
    
        return _self;
    };
    });
    

  define("./text_highlight_rules.js", function(require, exports, module) {
    "use strict";
    
    var lang = require("../lib/lang");
    
    var TextHighlightRules = function() {
    
        // regexp must not have capturing parentheses
        // regexps are ordered -> the first match is used
    
        this.$rules = {
            "start" : [{
                token : "empty_line",
                regex : '^$'
            }, {
                defaultToken : "text"
            }]
        };
    };
    
    (function() {
    
        this.addRules = function(rules, prefix) {
            if (!prefix) {
                for (var key in rules)
                    this.$rules[key] = rules[key];
                return;
            }
            for (var key in rules) {
                var state = rules[key];
                for (var i = 0; i < state.length; i++) {
                    var rule = state[i];
                    if (rule.next || rule.onMatch) {
                        if (typeof rule.next != "string") {
                            if (rule.nextState && rule.nextState.indexOf(prefix) !== 0)
                                rule.nextState = prefix + rule.nextState;
                        } else {
                            if (rule.next.indexOf(prefix) !== 0)
                                rule.next = prefix + rule.next;
                        }
                    }
                }
                this.$rules[prefix + key] = state;
            }
        };
    
        this.getRules = function() {
            return this.$rules;
        };
    
        this.embedRules = function (HighlightRules, prefix, escapeRules, states, append) {
            var embedRules = typeof HighlightRules == "function"
                ? new HighlightRules().getRules()
                : HighlightRules;
            if (states) {
                for (var i = 0; i < states.length; i++)
                    states[i] = prefix + states[i];
            } else {
                states = [];
                for (var key in embedRules)
                    states.push(prefix + key);
            }
    
            this.addRules(embedRules, prefix);
    
            if (escapeRules) {
                var addRules = Array.prototype[append ? "push" : "unshift"];
                for (var i = 0; i < states.length; i++)
                    addRules.apply(this.$rules[states[i]], lang.deepCopy(escapeRules));
            }
    
            if (!this.$embeds)
                this.$embeds = [];
            this.$embeds.push(prefix);
        };
    
        this.getEmbeds = function() {
            return this.$embeds;
        };
    
        var pushState = function(currentState, stack) {
            if (currentState != "start" || stack.length)
                stack.unshift(this.nextState, currentState);
            return this.nextState;
        };
        var popState = function(currentState, stack) {
            // if (stack[0] === currentState)
            stack.shift();
            return stack.shift() || "start";
        };
    
        this.normalizeRules = function() {
            var id = 0;
            var rules = this.$rules;
            function processState(key) {
                var state = rules[key];
                state.processed = true;
                for (var i = 0; i < state.length; i++) {
                    var rule = state[i];
                    if (!rule.regex && rule.start) {
                        rule.regex = rule.start;
                        if (!rule.next)
                            rule.next = [];
                        rule.next.push({
                            defaultToken: rule.token
                        }, {
                            token: rule.token + ".end",
                            regex: rule.end || rule.start,
                            next: "pop"
                        });
                        rule.token = rule.token + ".start";
                        rule.push = true;
                    }
                    var next = rule.next || rule.push;
                    if (next && Array.isArray(next)) {
                        var stateName = rule.stateName;
                        if (!stateName)  {
                            stateName = rule.token;
                            if (typeof stateName != "string")
                                stateName = stateName[0] || "";
                            if (rules[stateName])
                                stateName += id++;
                        }
                        rules[stateName] = next;
                        rule.next = stateName;
                        processState(stateName);
                    } else if (next == "pop") {
                        rule.next = popState;
                    }
    
                    if (rule.push) {
                        rule.nextState = rule.next || rule.push;
                        rule.next = pushState;
                        delete rule.push;
                    }
    
                    if (rule.rules) {
                        for (var r in rule.rules) {
                            if (rules[r]) {
                                if (rules[r].push)
                                    rules[r].push.apply(rules[r], rule.rules[r]);
                            } else {
                                rules[r] = rule.rules[r];
                            }
                        }
                    }
                    if (rule.include || typeof rule == "string") {
                        var includeName = rule.include || rule;
                        var toInsert = rules[includeName];
                    } else if (Array.isArray(rule))
                        toInsert = rule;
    
                    if (toInsert) {
                        var args = [i, 1].concat(toInsert);
                        if (rule.noEscape)
                            args = args.filter(function(x) {return !x.next;});
                        state.splice.apply(state, args);
                        // skip included rules since they are already processed
                        //i += args.length - 3;
                        i--;
                        toInsert = null;
                    }
                    
                    if (rule.keywordMap) {
                        rule.token = this.createKeywordMapper(
                            rule.keywordMap, rule.defaultToken || "text", rule.caseInsensitive
                        );
                        delete rule.defaultToken;
                    }
                }
            }
            Object.keys(rules).forEach(processState, this);
        };
    
        this.createKeywordMapper = function(map, defaultToken, ignoreCase, splitChar) {
            var keywords = Object.create(null);
            Object.keys(map).forEach(function(className) {
                var a = map[className];
                if (ignoreCase)
                    a = a.toLowerCase();
                var list = a.split(splitChar || "|");
                for (var i = list.length; i--; )
                    keywords[list[i]] = className;
            });
            // in old versions of opera keywords["__proto__"] sets prototype
            // even on objects with __proto__=null
            if (Object.getPrototypeOf(keywords)) {
                keywords.__proto__ = null;
            }
            this.$keywordList = Object.keys(keywords);
            map = null;
            return ignoreCase
                ? function(value) {return keywords[value.toLowerCase()] || defaultToken }
                : function(value) {return keywords[value] || defaultToken };
        };
    
        this.getKeywords = function() {
            return this.$keywords;
        };
    
    }).call(TextHighlightRules.prototype);
    
    exports.TextHighlightRules = TextHighlightRules;
    });
    

  define("perl_6_highlight_rules", function(require, exports, module) {
    "use strict";
    
    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
    
    var Perl6HighlightRules = function() {
        // regexp must not have capturing parentheses. Use (?:) instead.
        // regexps are ordered -> the first match is used
    
        this.$rules = {
            start: [{
                token: "comment.block.perl",
                regex: /^=begin/,
                push: [{
                    token: "comment.block.perl",
                    regex: /^=end/,
                    next: "pop"
                }, {
                    defaultToken: "comment.block.perl"
                }]
            }, {
                token: "punctuation.definition.comment.perl",
                regex: /#/,
                push: [{
                    token: "comment.line.number-sign.perl",
                    regex: /$/,
                    next: "pop"
                }, {
                    defaultToken: "comment.line.number-sign.perl"
                }]
            }, {
                token: "punctuation.definition.string.begin.perl",
                regex: /'/,
                push: [{
                    token: "punctuation.definition.string.end.perl",
                    regex: /'/,
                    next: "pop"
                }, {
                    token: "constant.character.escape.perl",
                    regex: /\\['\\]/
                }, {
                    defaultToken: "string.quoted.single.perl"
                }]
            }, {
                token: "punctuation.definition.string.begin.perl",
                regex: /"/,
                push: [{
                    token: "punctuation.definition.string.end.perl",
                    regex: /"/,
                    next: "pop"
                }, {
                    token: "constant.character.escape.perl",
                    regex: /\\[abtnfre"\\]/
                }, {
                    defaultToken: "string.quoted.double.perl"
                }]
            }, {
                token: "string.quoted.single.heredoc.perl",
                regex: /q(?:q|to|heredoc)*\s*:?(?:q|to|heredoc)*\s*\/.+\//,
                push: [{
                    token: "string.quoted.single.heredoc.perl",
                    regex: /.+/,
                    next: "pop"
                }, {
                    defaultToken: "string.quoted.single.heredoc.perl"
                }]
            }, {
                token: "string.quoted.double.heredoc.brace.perl",
                regex: /(?:q|Q)(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*:?(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*{{/,
                push: [{
                    token: "string.quoted.double.heredoc.brace.perl",
                    regex: /}}/,
                    next: "pop"
                }, {
                    include: "#qq_brace_string_content"
                }, {
                    defaultToken: "string.quoted.double.heredoc.brace.perl"
                }]
            }, {
                token: "string.quoted.double.heredoc.paren.perl",
                regex: /(?:q|Q)(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*:?(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*\(\(/,
                push: [{
                    token: "string.quoted.double.heredoc.paren.perl",
                    regex: /\)\)/,
                    next: "pop"
                }, {
                    include: "#qq_paren_string_content"
                }, {
                    defaultToken: "string.quoted.double.heredoc.paren.perl"
                }]
            }, {
                token: "string.quoted.double.heredoc.bracket.perl",
                regex: /(?:q|Q)(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*:?(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*\[\[/,
                push: [{
                    token: "string.quoted.double.heredoc.bracket.perl",
                    regex: /\]\]/,
                    next: "pop"
                }, {
                    include: "#qq_bracket_string_content"
                }, {
                    defaultToken: "string.quoted.double.heredoc.bracket.perl"
                }]
            }, {
                token: "string.quoted.single.heredoc.brace.perl",
                regex: /(?:q|Q)(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*:?(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*{/,
                push: [{
                    token: "string.quoted.single.heredoc.brace.perl",
                    regex: /}/,
                    next: "pop"
                }, {
                    include: "#qq_brace_string_content"
                }, {
                    defaultToken: "string.quoted.single.heredoc.brace.perl"
                }]
            }, {
                token: "string.quoted.single.heredoc.slash.perl",
                regex: /(?:q|Q)(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*:?(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*\//,
                push: [{
                    token: "string.quoted.single.heredoc.slash.perl",
                    regex: /\//,
                    next: "pop"
                }, {
                    include: "#qq_slash_string_content"
                }, {
                    defaultToken: "string.quoted.single.heredoc.slash.perl"
                }]
            }, {
                token: "string.quoted.single.heredoc.paren.perl",
                regex: /(?:q|Q)(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*:?(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*\(/,
                push: [{
                    token: "string.quoted.single.heredoc.paren.perl",
                    regex: /\)/,
                    next: "pop"
                }, {
                    include: "#qq_paren_string_content"
                }, {
                    defaultToken: "string.quoted.single.heredoc.paren.perl"
                }]
            }, {
                token: "string.quoted.single.heredoc.bracket.perl",
                regex: /(?:q|Q)(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*:?(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*\[/,
                push: [{
                    token: "string.quoted.single.heredoc.bracket.perl",
                    regex: /\]/,
                    next: "pop"
                }, {
                    include: "#qq_bracket_string_content"
                }, {
                    defaultToken: "string.quoted.single.heredoc.bracket.perl"
                }]
            }, {
                token: "string.quoted.single.heredoc.single.perl",
                regex: /(?:q|Q)(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*:?(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*'/,
                push: [{
                    token: "string.quoted.single.heredoc.single.perl",
                    regex: /'/,
                    next: "pop"
                }, {
                    include: "#qq_single_string_content"
                }, {
                    defaultToken: "string.quoted.single.heredoc.single.perl"
                }]
            }, {
                token: "string.quoted.single.heredoc.double.perl",
                regex: /(?:q|Q)(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*:?(?:x|exec|w|words|ww|quotewords|v|val|q|single|qq|double|s|scalar|a|array|h|hash|f|function|c|closure|b|blackslash|regexp|substr|trans|codes|p|path)*\s*"/,
                push: [{
                    token: "string.quoted.single.heredoc.double.perl",
                    regex: /"/,
                    next: "pop"
                }, {
                    include: "#qq_double_string_content"
                }, {
                    defaultToken: "string.quoted.single.heredoc.double.perl"
                }]
            }, {
                token: "variable.other.perl",
                regex: /\b\$\w+\b/
            }, {
                token: "storage.type.declare.routine.perl",
                regex: /\b(?:macro|sub|submethod|method|multi|proto|only|rule|token|regex|category)\b/
            }, {
                token: "keyword.other.module.perl",
                regex: /\b(?:module|class|role|package|enum|grammar|slang|subset)\b/
            }, {
                token: "variable.language.perl",
                regex: /\bself\b/
            }, {
                token: "keyword.other.include.perl",
                regex: /\b(?:use|require)\b/
            }, {
                token: "keyword.control.conditional.perl",
                regex: /\b(?:if|else|elsif|unless)\b/
            }, {
                token: "storage.type.variable.perl",
                regex: /\b(?:let|my|our|state|temp|has|constant)\b/
            }, {
                token: "keyword.control.repeat.perl",
                regex: /\b(?:for|loop|repeat|while|until|gather|given)\b/
            }, {
                token: "keyword.control.flowcontrol.perl",
                regex: /\b(?:take|do|when|next|last|redo|return|contend|maybe|defer|default|exit|make|continue|break|goto|leave|async|lift)\b/
            }, {
                token: "storage.modifier.type.constraints.perl",
                regex: /\b(?:is|as|but|trusts|of|returns|handles|where|augment|supersede)\b/
            }, {
                token: "meta.function.perl",
                regex: /\b(?:BEGIN|CHECK|INIT|START|FIRST|ENTER|LEAVE|KEEP|UNDO|NEXT|LAST|PRE|POST|END|CATCH|CONTROL|TEMP)\b/
            }, {
                token: "keyword.control.control-handlers.perl",
                regex: /\b(?:die|fail|try|warn)\b/
            }, {
                token: "storage.modifier.perl",
                regex: /\b(?:prec|irs|ofs|ors|export|deep|binary|unary|reparsed|rw|parsed|cached|readonly|defequiv|will|ref|copy|inline|tighter|looser|equiv|assoc|required)\b/
            }, {
                token: "constant.numeric.perl",
                regex: /\b(?:NaN|Inf)\b/
            }, {
                token: "keyword.other.pragma.perl",
                regex: /\b(?:oo|fatal)\b/
            }, {
                token: "support.type.perl",
                regex: /\b(?:Object|Any|Junction|Whatever|Capture|MatchSignature|Proxy|Matcher|Package|Module|ClassGrammar|Scalar|Array|Hash|KeyHash|KeySet|KeyBagPair|List|Seq|Range|Set|Bag|Mapping|Void|UndefFailure|Exception|Code|Block|Routine|Sub|MacroMethod|Submethod|Regex|Str|str|Blob|Char|ByteCodepoint|Grapheme|StrPos|StrLen|Version|NumComplex|num|complex|Bit|bit|bool|True|FalseIncreasing|Decreasing|Ordered|Callable|AnyCharPositional|Associative|Ordering|KeyExtractorComparator|OrderingPair|IO|KitchenSink|RoleInt|int|int1|int2|int4|int8|int16|int32|int64Rat|rat|rat1|rat2|rat4|rat8|rat16|rat32|rat64Buf|buf|buf1|buf2|buf4|buf8|buf16|buf32|buf64UInt|uint|uint1|uint2|uint4|uint8|uint16|uint32uint64|Abstraction|utf8|utf16|utf32)\b/
            }, {
                token: "keyword.operator.perl",
                regex: /\b(?:div|x|xx|mod|also|leg|cmp|before|after|eq|ne|le|lt|gt|ge|eqv|ff|fff|and|andthen|Z|X|or|xor|orelse|extra|m|mm|rx|s|tr)\b/
            }, {
                token: "variable.other.basic.perl",
                regex: /(?:\$|@|%|&)(?:\*|:|!|\^|~|=|\?|<(?=.+>))?[A-Za-z_](?:[A-Za-z0-9_]|[\-'][A-Za-z0-9_])*/
            }, {
                token: "support.function.perl",
                regex: /\b(?:eager|hyper|substr|index|rindex|grep|map|sort|join|lines|hints|chmod|split|reduce|min|max|reverse|truncate|zip|cat|roundrobin|classify|first|sum|keys|values|pairs|defined|delete|exists|elems|end|kv|any|all|one|wrap|shape|key|value|name|pop|push|shift|splice|unshift|floor|ceiling|abs|exp|log|log10|rand|sign|sqrt|sin|cos|tan|round|strand|roots|cis|unpolar|polar|atan2|pick|chop|p5chop|chomp|p5chomp|lc|lcfirst|uc|ucfirst|capitalize|normalize|pack|unpack|quotemeta|comb|samecase|sameaccent|chars|nfd|nfc|nfkd|nfkc|printf|sprintf|caller|evalfile|run|runinstead|nothing|want|bless|chr|ord|gmtime|time|eof|localtime|gethost|getpw|chroot|getlogin|getpeername|kill|fork|wait|perl|graphs|codes|bytes|clone|print|open|read|write|readline|say|seek|close|opendir|readdir|slurp|spurt|shell|run|pos|fmt|vec|link|unlink|symlink|uniq|pair|asin|atan|sec|cosec|cotan|asec|acosec|acotan|sinh|cosh|tanh|asinh|done|acos|acosh|atanh|sech|cosech|cotanh|sech|acosech|acotanh|asech|ok|nok|plan_ok|dies_ok|lives_ok|skip|todo|pass|flunk|force_todo|use_ok|isa_ok|diag|is_deeply|isnt|like|skip_rest|unlike|cmp_ok|eval_dies_ok|nok_error|eval_lives_ok|approx|is_approx|throws_ok|version_lt|plan|EVAL|succ|pred|times|nonce|once|signature|new|connect|operator|undef|undefine|sleep|from|to|infix|postfix|prefix|circumfix|postcircumfix|minmax|lazy|count|unwrap|getc|pi|e|context|void|quasi|body|each|contains|rewinddir|subst|can|isa|flush|arity|assuming|rewind|callwith|callsame|nextwith|nextsame|attr|eval_elsewhere|none|srand|trim|trim_start|trim_end|lastcall|WHAT|WHERE|HOW|WHICH|VAR|WHO|WHENCE|ACCEPTS|REJECTS|not|true|iterator|by|re|im|invert|flip|gist|flat|tree|is-prime|throws_like|trans)\b/
            }],
            "#qq_brace_string_content": [{
                token: "text",
                regex: /{/,
                push: [{
                    token: "text",
                    regex: /}/,
                    next: "pop"
                }, {
                    include: "#qq_brace_string_content"
                }]
            }],
            "#qq_bracket_string_content": [{
                token: "text",
                regex: /\[/,
                push: [{
                    token: "text",
                    regex: /\]/,
                    next: "pop"
                }, {
                    include: "#qq_bracket_string_content"
                }]
            }],
            "#qq_double_string_content": [{
                token: "text",
                regex: /"/,
                push: [{
                    token: "text",
                    regex: /"/,
                    next: "pop"
                }, {
                    include: "#qq_double_string_content"
                }]
            }],
            "#qq_paren_string_content": [{
                token: "text",
                regex: /\(/,
                push: [{
                    token: "text",
                    regex: /\)/,
                    next: "pop"
                }, {
                    include: "#qq_paren_string_content"
                }]
            }],
            "#qq_single_string_content": [{
                token: "text",
                regex: /'/,
                push: [{
                    token: "text",
                    regex: /'/,
                    next: "pop"
                }, {
                    include: "#qq_single_string_content"
                }]
            }],
            "#qq_slash_string_content": [{
                token: "text",
                regex: /\\\//,
                push: [{
                    token: "text",
                    regex: /\\\//,
                    next: "pop"
                }, {
                    include: "#qq_slash_string_content"
                }]
            }]
        }
        
        this.normalizeRules();
    };
    
    Perl6HighlightRules.metaData = {
        fileTypes: ["p6", "pl6", "pm6", "nqp"],
        firstLineMatch: "(^#!.*\\bperl6\\b)|use\\s+v6",
        keyEquivalent: "^~P",
        name: "Perl 6",
        scopeName: "source.perl.6"
    }
    
    
    oop.inherits(Perl6HighlightRules, TextHighlightRules);
    
    exports.Perl6HighlightRules = Perl6HighlightRules;
    });


  // Ace highlight rules function imported below.
  var HighlightRules = require("perl_6_highlight_rules").Perl6HighlightRules;

  

  // Ace's Syntax Tokenizer.

  // tokenizing lines longer than this makes editor very slow
  var MAX_TOKEN_COUNT = 1000;
  var Tokenizer = function(rules) {
      this.states = rules;

      this.regExps = {};
      this.matchMappings = {};
      for (var key in this.states) {
          var state = this.states[key];
          var ruleRegExps = [];
          var matchTotal = 0;
          var mapping = this.matchMappings[key] = {defaultToken: "text"};
          var flag = "g";

          var splitterRurles = [];
          for (var i = 0; i < state.length; i++) {
              var rule = state[i];
              if (rule.defaultToken)
                  mapping.defaultToken = rule.defaultToken;
              if (rule.caseInsensitive)
                  flag = "gi";
              if (rule.regex == null)
                  continue;

              if (rule.regex instanceof RegExp)
                  rule.regex = rule.regex.toString().slice(1, -1);

              // Count number of matching groups. 2 extra groups from the full match
              // And the catch-all on the end (used to force a match);
              var adjustedregex = rule.regex;
              var matchcount = new RegExp("(?:(" + adjustedregex + ")|(.))").exec("a").length - 2;
              if (Array.isArray(rule.token)) {
                  if (rule.token.length == 1 || matchcount == 1) {
                      rule.token = rule.token[0];
                  } else if (matchcount - 1 != rule.token.length) {
                      throw new Error("number of classes and regexp groups in '" + 
                          rule.token + "'\n'" + rule.regex +  "' doesn't match\n"
                          + (matchcount - 1) + "!=" + rule.token.length);
                  } else {
                      rule.tokenArray = rule.token;
                      rule.token = null;
                      rule.onMatch = this.$arrayTokens;
                  }
              } else if (typeof rule.token == "function" && !rule.onMatch) {
                  if (matchcount > 1)
                      rule.onMatch = this.$applyToken;
                  else
                      rule.onMatch = rule.token;
              }

              if (matchcount > 1) {
                  if (/\\\d/.test(rule.regex)) {
                      // Replace any backreferences and offset appropriately.
                      adjustedregex = rule.regex.replace(/\\([0-9]+)/g, function(match, digit) {
                          return "\\" + (parseInt(digit, 10) + matchTotal + 1);
                      });
                  } else {
                      matchcount = 1;
                      adjustedregex = this.removeCapturingGroups(rule.regex);
                  }
                  if (!rule.splitRegex && typeof rule.token != "string")
                      splitterRurles.push(rule); // flag will be known only at the very end
              }

              mapping[matchTotal] = i;
              matchTotal += matchcount;

              ruleRegExps.push(adjustedregex);

              // makes property access faster
              if (!rule.onMatch)
                  rule.onMatch = null;
          }
          
          splitterRurles.forEach(function(rule) {
              rule.splitRegex = this.createSplitterRegexp(rule.regex, flag);
          }, this);

          this.regExps[key] = new RegExp("(" + ruleRegExps.join(")|(") + ")|($)", flag);
      }
  };

  (function() {
      this.$setMaxTokenCount = function(m) {
          MAX_TOKEN_COUNT = m | 0;
      };
      
      this.$applyToken = function(str) {
          var values = this.splitRegex.exec(str).slice(1);
          var types = this.token.apply(this, values);

          // required for compatibility with old modes
          if (typeof types === "string")
              return [{type: types, value: str}];

          var tokens = [];
          for (var i = 0, l = types.length; i < l; i++) {
              if (values[i])
                  tokens[tokens.length] = {
                      type: types[i],
                      value: values[i]
                  };
          }
          return tokens;
      },

      this.$arrayTokens = function(str) {
          if (!str)
              return [];
          var values = this.splitRegex.exec(str);
          if (!values)
              return "text";
          var tokens = [];
          var types = this.tokenArray;
          for (var i = 0, l = types.length; i < l; i++) {
              if (values[i + 1])
                  tokens[tokens.length] = {
                      type: types[i],
                      value: values[i + 1]
                  };
          }
          return tokens;
      };

      this.removeCapturingGroups = function(src) {
          var r = src.replace(
              /\[(?:\\.|[^\]])*?\]|\\.|\(\?[:=!]|(\()/g,
              function(x, y) {return y ? "(?:" : x;}
          );
          return r;
      };

      this.createSplitterRegexp = function(src, flag) {
          if (src.indexOf("(?=") != -1) {
              var stack = 0;
              var inChClass = false;
              var lastCapture = {};
              src.replace(/(\\.)|(\((?:\?[=!])?)|(\))|([\[\]])/g, function(
                  m, esc, parenOpen, parenClose, square, index
              ) {
                  if (inChClass) {
                      inChClass = square != "]";
                  } else if (square) {
                      inChClass = true;
                  } else if (parenClose) {
                      if (stack == lastCapture.stack) {
                          lastCapture.end = index+1;
                          lastCapture.stack = -1;
                      }
                      stack--;
                  } else if (parenOpen) {
                      stack++;
                      if (parenOpen.length != 1) {
                          lastCapture.stack = stack
                          lastCapture.start = index;
                      }
                  }
                  return m;
              });

              if (lastCapture.end != null && /^\)*$/.test(src.substr(lastCapture.end)))
                  src = src.substring(0, lastCapture.start) + src.substr(lastCapture.end);
          }
          return new RegExp(src, (flag||"").replace("g", ""));
      };

      /**
      * Returns an object containing two properties: `tokens`, which contains all the tokens; and `state`, the current state.
      * @returns {Object}
      **/
      this.getLineTokens = function(line, startState) {
          if (startState && typeof startState != "string") {
              var stack = startState.slice(0);
              startState = stack[0];
          } else
              var stack = [];

          var currentState = startState || "start";
          var state = this.states[currentState];
          if (!state) {
              currentState = "start";
              state = this.states[currentState];
          }
          var mapping = this.matchMappings[currentState];
          var re = this.regExps[currentState];
          re.lastIndex = 0;

          var match, tokens = [];
          var lastIndex = 0;

          var token = {type: null, value: ""};

          while (match = re.exec(line)) {
              var type = mapping.defaultToken;
              var rule = null;
              var value = match[0];
              var index = re.lastIndex;

              if (index - value.length > lastIndex) {
                  var skipped = line.substring(lastIndex, index - value.length);
                  if (token.type == type) {
                      token.value += skipped;
                  } else {
                      if (token.type)
                          tokens.push(token);
                      token = {type: type, value: skipped};
                  }
              }

              for (var i = 0; i < match.length-2; i++) {
                  if (match[i + 1] === undefined)
                      continue;

                  rule = state[mapping[i]];

                  if (rule.onMatch)
                      type = rule.onMatch(value, currentState, stack);
                  else
                      type = rule.token;

                  if (rule.next) {
                      if (typeof rule.next == "string")
                          currentState = rule.next;
                      else
                          currentState = rule.next(currentState, stack);

                      state = this.states[currentState];
                      if (!state) {
                          window.console && console.error && console.error(currentState, "doesn't exist");
                          currentState = "start";
                          state = this.states[currentState];
                      }
                      mapping = this.matchMappings[currentState];
                      lastIndex = index;
                      re = this.regExps[currentState];
                      re.lastIndex = index;
                  }
                  break;
              }

              if (value) {
                  if (typeof type == "string") {
                      if ((!rule || rule.merge !== false) && token.type === type) {
                          token.value += value;
                      } else {
                          if (token.type)
                              tokens.push(token);
                          token = {type: type, value: value};
                      }
                  } else if (type) {
                      if (token.type)
                          tokens.push(token);
                      token = {type: null, value: ""};
                      for (var i = 0; i < type.length; i++)
                          tokens.push(type[i]);
                  }
              }

              if (lastIndex == line.length)
                  break;

              lastIndex = index;

              if (tokens.length > MAX_TOKEN_COUNT) {
                  // chrome doens't show contents of text nodes with very long text
                  while (lastIndex < line.length) {
                      if (token.type)
                          tokens.push(token);
                      token = {
                          value: line.substring(lastIndex, lastIndex += 2000),
                          type: "overflow"
                      };
                  }
                  currentState = "start";
                  stack = [];
                  break;
              }
          }

          if (token.type)
              tokens.push(token);
          
          if (stack.length > 1) {
              if (stack[0] !== currentState)
                  stack.unshift(currentState);
          }
          return {
              tokens : tokens,
              state : stack.length ? stack : currentState
          };
      };

  }).call(Tokenizer.prototype);

  // Token conversion.
  // See <https://github.com/ajaxorg/ace/wiki/Creating-or-Extending-an-Edit-Mode#common-tokens>
  // This is not an exact match nor the best match that can be made.
  var tokenFromAceToken = {
    empty: null,
    text: null,

    // Keyword
    keyword: 'keyword',
      control: 'keyword',
      operator: 'operator',

    // Constants
    constant: 'atom',
      numeric: 'number',
      character: 'atom',
        escape: 'atom',

    // Variables
    variable: 'variable',
    parameter: 'variable-3',
    language: 'variable-2',  // Python's `self` uses that.

    // Comments
    comment: 'comment',
      line: 'comment',
        'double-slash': 'comment',
        'double-dash': 'comment',
        'number-sign': 'comment',
        percentage: 'comment',
      block: 'comment',
        documentation: 'comment',

    // String
    string: 'string',
      quoted: 'string',
        single: 'string',
        double: 'string',
        triple: 'string',
      unquoted: 'string',
      interpolated: 'string',
      regexp: 'string-2',

    meta: 'meta',
    literal: 'qualifier',
    support: 'builtin',

    // Markup
    markup: 'tag',
    underline: 'link',
    link: 'link',
    bold: 'strong',
    heading: 'header',
    italic: 'em',
    list: 'variable-2',
    numbered: 'variable-2',
    unnumbered: 'variable-2',
    quote: 'quote',
    raw: 'variable-2',  // Markdown's raw block uses that.

    // Invalid
    invalid: 'error',
    illegal: 'invalidchar',
    deprecated: 'error'
  };

  // Takes a list of Ace tokens, returns a (string) CodeMirror token.
  var cmTokenFromAceTokens = function(tokens) {
    var token = null;
    for (var i = 0; i < tokens.length; i++) {
      // Find the most specific token.
      if (tokenFromAceToken[tokens[i]] !== undefined) {
        token = tokenFromAceToken[tokens[i]];
      }
    }
    return token;
  };

  // Consume a token from plannedTokens.
  var consumeToken = function(stream, state) {
    var plannedToken = state.plannedTokens.shift();
    if (plannedToken === undefined) {
      return null;
    }
    stream.match(plannedToken.value);
    var tokens = plannedToken.type.split('.');
    return cmTokenFromAceTokens(tokens);
  };

  var matchToken = function(stream, state) {
    // Anormal start: we already have planned tokens to consume.
    if (state.plannedTokens.length > 0) {
      return consumeToken(stream, state);
    }

    // Normal start.
    var currentState = state.current;
    var currentLine = stream.match(/.*$/, false)[0];
    var tokenized = tokenizer.getLineTokens(currentLine, currentState);
    // We got a {tokens, state} object.
    // Each token is a {value, type} object.
    state.plannedTokens = tokenized.tokens;
    state.current = tokenized.state;

    // Consume a token.
    return consumeToken(stream, state);
  }

  // Initialize all state.
  var aceHighlightRules = new HighlightRules();
  var tokenizer = new Tokenizer(aceHighlightRules.$rules);

  return {
    startState: function() {
      return {
        current: 'start',
        // List of {value, type}, with type being an Ace token string.
        plannedTokens: []
      };
    },
    blankLine: function(state) { matchToken('', state); },
    token: matchToken
  };
});

CodeMirror.defineMIME("text/x-perl6", "perl6");