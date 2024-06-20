"use strict";(self.webpackChunkic_analyzer=self.webpackChunkic_analyzer||[]).push([[726],{4726:(n,r,t)=>{t.r(r),t.d(r,{default:()=>e});let e=function(){var n="file:///home/runner/work/ICAnalyzer/ICAnalyzer/deps/squoosh/codecs/jxl/enc/jxl_enc.js";return function(r){var e,a,o,i,u,c,f,s,l,p,y,h,v,g,d,m,_,r=void 0!==(r=r||{})?r:{};r.ready=new Promise(function(n,r){e=n,a=r});var w={};for(o in r)r.hasOwnProperty(o)&&(w[o]=r[o]);var b=[],T="./this.program",A="";A=self.location.href,n&&(A=n),A=0!==A.indexOf("blob:")?A.substr(0,A.lastIndexOf("/")+1):"",i=function(n){var r=new XMLHttpRequest;return r.open("GET",n,!1),r.responseType="arraybuffer",r.send(null),new Uint8Array(r.response)};var C=r.print||console.log.bind(console),F=r.printErr||console.warn.bind(console);for(o in w)w.hasOwnProperty(o)&&(r[o]=w[o]);w=null,r.arguments&&(b=r.arguments),r.thisProgram&&(T=r.thisProgram),r.quit&&r.quit;var E=function(n){};r.wasmBinary&&(u=r.wasmBinary),r.noExitRuntime,"object"!=typeof WebAssembly&&L("no native wasm support detected");var D=!1,P=new TextDecoder("utf8");function W(n,r){if(!n)return"";for(var t=n+r,e=n;!(e>=t)&&l[e];)++e;return P.decode(l.subarray(n,e))}function k(n,r,t,e){if(!(e>0))return 0;for(var a=t,o=t+e-1,i=0;i<n.length;++i){var u=n.charCodeAt(i);if(u>=55296&&u<=57343&&(u=65536+((1023&u)<<10)|1023&n.charCodeAt(++i)),u<=127){if(t>=o)break;r[t++]=u}else if(u<=2047){if(t+1>=o)break;r[t++]=192|u>>6,r[t++]=128|63&u}else if(u<=65535){if(t+2>=o)break;r[t++]=224|u>>12,r[t++]=128|u>>6&63,r[t++]=128|63&u}else{if(t+3>=o)break;r[t++]=240|u>>18,r[t++]=128|u>>12&63,r[t++]=128|u>>6&63,r[t++]=128|63&u}}return r[t]=0,t-a}function M(n){for(var r=0,t=0;t<n.length;++t){var e=n.charCodeAt(t);e>=55296&&e<=57343&&(e=65536+((1023&e)<<10)|1023&n.charCodeAt(++t)),e<=127?++r:e<=2047?r+=2:e<=65535?r+=3:r+=4}return r}var R=new TextDecoder("utf-16le");function j(n,r){for(var t=n,e=t>>1,a=e+r/2;!(e>=a)&&y[e];)++e;return t=e<<1,R.decode(l.subarray(n,t))}function S(n,r,t){if(void 0===t&&(t=2147483647),t<2)return 0;for(var e=r,a=(t-=2)<2*n.length?t/2:n.length,o=0;o<a;++o){var i=n.charCodeAt(o);p[r>>1]=i,r+=2}return p[r>>1]=0,r-e}function O(n){return 2*n.length}function I(n,r){for(var t=0,e="";!(t>=r/4);){var a=h[n+4*t>>2];if(0==a)break;if(++t,a>=65536){var o=a-65536;e+=String.fromCharCode(55296|o>>10,56320|1023&o)}else e+=String.fromCharCode(a)}return e}function U(n,r,t){if(void 0===t&&(t=2147483647),t<4)return 0;for(var e=r,a=e+t-4,o=0;o<n.length;++o){var i=n.charCodeAt(o);if(i>=55296&&i<=57343&&(i=65536+((1023&i)<<10)|1023&n.charCodeAt(++o)),h[r>>2]=i,(r+=4)+4>a)break}return h[r>>2]=0,r-e}function x(n){for(var r=0,t=0;t<n.length;++t){var e=n.charCodeAt(t);e>=55296&&e<=57343&&++t,r+=4}return r}function Y(n){f=n,r.HEAP8=s=new Int8Array(n),r.HEAP16=p=new Int16Array(n),r.HEAP32=h=new Int32Array(n),r.HEAPU8=l=new Uint8Array(n),r.HEAPU16=y=new Uint16Array(n),r.HEAPU32=v=new Uint32Array(n),r.HEAPF32=g=new Float32Array(n),r.HEAPF64=d=new Float64Array(n)}r.INITIAL_MEMORY;var H=[],z=[],V=[],N=0,B=null,q=null;function L(n){r.onAbort&&r.onAbort(n),F(n+=""),D=!0,n="abort("+n+"). Build with -s ASSERTIONS=1 for more info.";var t=new WebAssembly.RuntimeError(n);throw a(t),t}function G(n){return n.startsWith("data:application/octet-stream;base64,")}if(r.preloadedImages={},r.preloadedAudios={},r.locateFile){var J,X="jxl_enc.wasm";G(X)||(J=X,X=r.locateFile?r.locateFile(J,A):A+J)}else var X=new URL(t(5824),t.b).toString();function K(n){try{if(n==X&&u)return new Uint8Array(u);if(i)return i(n);throw"both async and sync fetching of the wasm failed"}catch(n){L(n)}}function Z(n){for(;n.length>0;){var t=n.shift();if("function"==typeof t){t(r);continue}var e=t.func;"number"==typeof e?void 0===t.arg?m.get(e)():m.get(e)(t.arg):e(void 0===t.arg?null:t.arg)}}function Q(n){this.excPtr=n,this.ptr=n-16,this.set_type=function(n){h[this.ptr+8>>2]=n},this.get_type=function(){return h[this.ptr+8>>2]},this.set_destructor=function(n){h[this.ptr+0>>2]=n},this.get_destructor=function(){return h[this.ptr+0>>2]},this.set_refcount=function(n){h[this.ptr+4>>2]=n},this.set_caught=function(n){n=n?1:0,s[this.ptr+12>>0]=n},this.get_caught=function(){return 0!=s[this.ptr+12>>0]},this.set_rethrown=function(n){n=n?1:0,s[this.ptr+13>>0]=n},this.get_rethrown=function(){return 0!=s[this.ptr+13>>0]},this.init=function(n,r){this.set_type(n),this.set_destructor(r),this.set_refcount(0),this.set_caught(!1),this.set_rethrown(!1)},this.add_ref=function(){var n=h[this.ptr+4>>2];h[this.ptr+4>>2]=n+1},this.release_ref=function(){var n=h[this.ptr+4>>2];return h[this.ptr+4>>2]=n-1,1===n}}var $=0,nn={mappings:{},buffers:[null,[],[]],printChar:function(n,r){var t=nn.buffers[n];0===r||10===r?((1===n?C:F)(function(n,r,t){for(var e=NaN,a=0;n[a]&&!(a>=e);)++a;return P.decode(n.subarray?n.subarray(0,a):new Uint8Array(n.slice(r,a)))}(t,0)),t.length=0):t.push(r)},varargs:void 0,get:function(){return nn.varargs+=4,h[nn.varargs-4>>2]},getStr:function(n){return W(n)},get64:function(n,r){return n}},nr={};function nt(n){for(;n.length;){var r=n.pop();n.pop()(r)}}function ne(n){return this.fromWireType(v[n>>2])}var na={},no={},ni={};function nu(n){if(void 0===n)return"_unknown";var r=(n=n.replace(/[^a-zA-Z0-9_]/g,"$")).charCodeAt(0);return r>=48&&r<=57?"_"+n:n}function nc(n,r){return Function("body","return function "+(n=nu(n))+'() {\n    "use strict";    return body.apply(this, arguments);\n};\n')(r)}function nf(n,r){var t=nc(r,function(n){this.name=r,this.message=n;var t=Error(n).stack;void 0!==t&&(this.stack=this.toString()+"\n"+t.replace(/^Error(:[^\n]*)?\n/,""))});return t.prototype=Object.create(n.prototype),t.prototype.constructor=t,t.prototype.toString=function(){return void 0===this.message?this.name:this.name+": "+this.message},t}var ns=void 0;function nl(n){throw new ns(n)}function np(n,r,t){function e(r){var e=t(r);e.length!==n.length&&nl("Mismatched type converter count");for(var a=0;a<n.length;++a)nm(n[a],e[a])}n.forEach(function(n){ni[n]=r});var a=Array(r.length),o=[],i=0;r.forEach(function(n,r){no.hasOwnProperty(n)?a[r]=no[n]:(o.push(n),na.hasOwnProperty(n)||(na[n]=[]),na[n].push(function(){a[r]=no[n],++i===o.length&&e(a)}))}),0===o.length&&e(a)}function ny(n){switch(n){case 1:return 0;case 2:return 1;case 4:return 2;case 8:return 3;default:throw TypeError("Unknown type size: "+n)}}var nh=void 0;function nv(n){for(var r="",t=n;l[t];)r+=nh[l[t++]];return r}var ng=void 0;function nd(n){throw new ng(n)}function nm(n,r,t){if(t=t||{},!("argPackAdvance"in r))throw TypeError("registerType registeredInstance requires argPackAdvance");var e=r.name;if(n||nd('type "'+e+'" must have a positive integer typeid pointer'),no.hasOwnProperty(n)){if(t.ignoreDuplicateRegistrations)return;nd("Cannot register type '"+e+"' twice")}if(no[n]=r,delete ni[n],na.hasOwnProperty(n)){var a=na[n];delete na[n],a.forEach(function(n){n()})}}var n_=[],nw=[{},{value:void 0},{value:null},{value:!0},{value:!1}];function nb(n){n>4&&0==--nw[n].refcount&&(nw[n]=void 0,n_.push(n))}function nT(n){switch(n){case void 0:return 1;case null:return 2;case!0:return 3;case!1:return 4;default:var r=n_.length?n_.pop():nw.length;return nw[r]={refcount:1,value:n},r}}function nA(n){if(null===n)return"null";var r=typeof n;return"object"===r||"array"===r||"function"===r?n.toString():""+n}function nC(n,t){n=nv(n);var e=function(){if(n.includes("j")){var e,a;return e=n,a=[],function(){a.length=arguments.length;for(var n=0;n<arguments.length;n++)a[n]=arguments[n];return function(n,t,e){if(n.includes("j")){var a;return a=r["dynCall_"+n],e&&e.length?a.apply(null,[t].concat(e)):a.call(null,t)}return m.get(t).apply(null,e)}(e,t,a)}}return m.get(t)}();return"function"!=typeof e&&nd("unknown function pointer with signature "+n+": "+t),e}var nF=void 0;function nE(n){var r=nz(n),t=nv(r);return nH(r),t}var nD={};function nP(){return"object"==typeof globalThis?globalThis:Function("return this")()}function nW(n,r){var t=no[n];return void 0===t&&nd(r+" has unknown type "+nE(n)),t}var nk={},nM={};function nR(){if(!nR.strings){var n={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"==typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:T||"./this.program"};for(var r in nM)n[r]=nM[r];var t=[];for(var r in n)t.push(r+"="+n[r]);nR.strings=t}return nR.strings}function nj(n){return n%4==0&&(n%100!=0||n%400==0)}function nS(n,r){for(var t=0,e=0;e<=r;t+=n[e++]);return t}var nO=[31,29,31,30,31,30,31,31,30,31,30,31],nI=[31,28,31,30,31,30,31,31,30,31,30,31];function nU(n,r){for(var t=new Date(n.getTime());r>0;){var e=nj(t.getFullYear()),a=t.getMonth(),o=(e?nO:nI)[a];if(r>o-t.getDate())r-=o-t.getDate()+1,t.setDate(1),a<11?t.setMonth(a+1):(t.setMonth(0),t.setFullYear(t.getFullYear()+1));else{t.setDate(t.getDate()+r);break}}return t}ns=r.InternalError=nf(Error,"InternalError"),function(){for(var n=Array(256),r=0;r<256;++r)n[r]=String.fromCharCode(r);nh=n}(),ng=r.BindingError=nf(Error,"BindingError"),r.count_emval_handles=function(){for(var n=0,r=5;r<nw.length;++r)void 0!==nw[r]&&++n;return n},r.get_first_emval=function(){for(var n=5;n<nw.length;++n)if(void 0!==nw[n])return nw[n];return null},nF=r.UnboundTypeError=nf(Error,"UnboundTypeError");var nx={u:function(n){return nY(n+16)+16},I:function(n,r){},p:function(n,r,t){throw new Q(n).init(r,t),$++,n},h:function(n,r,t){return nn.varargs=t,0},A:function(n,r,t){return nn.varargs=t,0},B:function(n,r,t){nn.varargs=t},m:function(n){var r=nr[n];delete nr[n];var t=r.rawConstructor,e=r.rawDestructor,a=r.fields;np([n],a.map(function(n){return n.getterReturnType}).concat(a.map(function(n){return n.setterArgumentType})),function(n){var o={};return a.forEach(function(r,t){var e=r.fieldName,i=n[t],u=r.getter,c=r.getterContext,f=n[t+a.length],s=r.setter,l=r.setterContext;o[e]={read:function(n){return i.fromWireType(u(c,n))},write:function(n,r){var t=[];s(l,n,f.toWireType(t,r)),nt(t)}}}),[{name:r.name,fromWireType:function(n){var r={};for(var t in o)r[t]=o[t].read(n);return e(n),r},toWireType:function(n,r){for(var a in o)if(!(a in r))throw TypeError('Missing field:  "'+a+'"');var i=t();for(a in o)o[a].write(i,r[a]);return null!==n&&n.push(e,i),i},argPackAdvance:8,readValueFromPointer:ne,destructorFunction:e}]})},r:function(n,r,t,e,a){},D:function(n,r,t,e,a){var o=ny(t);nm(n,{name:r=nv(r),fromWireType:function(n){return!!n},toWireType:function(n,r){return r?e:a},argPackAdvance:8,readValueFromPointer:function(n){var e;if(1===t)e=s;else if(2===t)e=p;else if(4===t)e=h;else throw TypeError("Unknown boolean type size: "+r);return this.fromWireType(e[n>>o])},destructorFunction:null})},C:function(n,r){nm(n,{name:r=nv(r),fromWireType:function(n){var r=nw[n].value;return nb(n),r},toWireType:function(n,r){return nT(r)},argPackAdvance:8,readValueFromPointer:ne,destructorFunction:null})},j:function(n,r,t){var e=ny(t);nm(n,{name:r=nv(r),fromWireType:function(n){return n},toWireType:function(n,r){if("number"!=typeof r&&"boolean"!=typeof r)throw TypeError('Cannot convert "'+nA(r)+'" to '+this.name);return r},argPackAdvance:8,readValueFromPointer:function(n,r){switch(r){case 2:return function(n){return this.fromWireType(g[n>>2])};case 3:return function(n){return this.fromWireType(d[n>>3])};default:throw TypeError("Unknown float type: "+n)}}(r,e),destructorFunction:null})},l:function(n,t,e,a,o,i){var u,c,f,s=function(n,r){for(var t=[],e=0;e<n;e++)t.push(h[(r>>2)+e]);return t}(t,e);n=nv(n),o=nC(a,o),u=n,c=function(){!function(n,r){var t=[],e={};throw r.forEach(function n(r){if(!e[r]&&!no[r]){if(ni[r]){ni[r].forEach(n);return}t.push(r),e[r]=!0}}),new nF(n+": "+t.map(nE).join([", "]))}("Cannot call "+n+" due to unbound types",s)},f=t-1,r.hasOwnProperty(u)?((void 0===f||void 0!==r[u].overloadTable&&void 0!==r[u].overloadTable[f])&&nd("Cannot register public name '"+u+"' twice"),function(n,r,t){if(void 0===n[r].overloadTable){var e=n[r];n[r]=function(){return n[r].overloadTable.hasOwnProperty(arguments.length)||nd("Function '"+t+"' called with an invalid number of arguments ("+arguments.length+") - expects one of ("+n[r].overloadTable+")!"),n[r].overloadTable[arguments.length].apply(this,arguments)},n[r].overloadTable=[],n[r].overloadTable[e.argCount]=e}}(r,u,u),r.hasOwnProperty(f)&&nd("Cannot register multiple overloads of a function with the same number of arguments ("+f+")!"),r[u].overloadTable[f]=c):(r[u]=c,void 0!==f&&(r[u].numArguments=f)),np([],s,function(e){var a,u,c,f=[e[0],null].concat(e.slice(1));return a=n,u=function(n,r,t,e,a){var o=r.length;o<2&&nd("argTypes array size mismatch! Must at least get return value and 'this' types!");for(var i=null!==r[1]&&!1,u=!1,c=1;c<r.length;++c)if(null!==r[c]&&void 0===r[c].destructorFunction){u=!0;break}for(var f="void"!==r[0].name,s="",l="",c=0;c<o-2;++c)s+=(0!==c?", ":"")+"arg"+c,l+=(0!==c?", ":"")+"arg"+c+"Wired";var p="return function "+nu(n)+"("+s+") {\nif (arguments.length !== "+(o-2)+") {\nthrowBindingError('function "+n+" called with ' + arguments.length + ' arguments, expected "+(o-2)+" args!');\n}\n";u&&(p+="var destructors = [];\n");var y=u?"destructors":"null",h=["throwBindingError","invoker","fn","runDestructors","retType","classParam"],v=[nd,e,a,nt,r[0],r[1]];i&&(p+="var thisWired = classParam.toWireType("+y+", this);\n");for(var c=0;c<o-2;++c)p+="var arg"+c+"Wired = argType"+c+".toWireType("+y+", arg"+c+"); // "+r[c+2].name+"\n",h.push("argType"+c),v.push(r[c+2]);if(i&&(l="thisWired"+(l.length>0?", ":"")+l),p+=(f?"var rv = ":"")+"invoker(fn"+(l.length>0?", ":"")+l+");\n",u)p+="runDestructors(destructors);\n";else for(var c=i?1:2;c<r.length;++c){var g=1===c?"thisWired":"arg"+(c-2)+"Wired";null!==r[c].destructorFunction&&(p+=g+"_dtor("+g+"); // "+r[c].name+"\n",h.push(g+"_dtor"),v.push(r[c].destructorFunction))}return f&&(p+="var ret = retType.fromWireType(rv);\nreturn ret;\n"),p+="}\n",h.push(p),(function(n,r){if(!(n instanceof Function))throw TypeError("new_ called with constructor type "+typeof n+" which is not a function");var t=nc(n.name||"unknownFunctionName",function(){});t.prototype=n.prototype;var e=new t,a=n.apply(e,r);return a instanceof Object?a:e})(Function,h).apply(null,v)}(n,f,0,o,i),c=t-1,r.hasOwnProperty(a)||nl("Replacing nonexistant public symbol"),void 0!==r[a].overloadTable&&void 0!==c?r[a].overloadTable[c]=u:(r[a]=u,r[a].argCount=c),[]})},c:function(n,r,t,e,a){r=nv(r),-1===a&&(a=4294967295);var o=ny(t),i=function(n){return n};if(0===e){var u=32-8*t;i=function(n){return n<<u>>>u}}var c=r.includes("unsigned");nm(n,{name:r,fromWireType:i,toWireType:function(n,t){if("number"!=typeof t&&"boolean"!=typeof t)throw TypeError('Cannot convert "'+nA(t)+'" to '+this.name);if(t<e||t>a)throw TypeError('Passing a number "'+nA(t)+'" from JS side to C/C++ side to an argument of type "'+r+'", which is outside the valid range ['+e+", "+a+"]!");return c?t>>>0:0|t},argPackAdvance:8,readValueFromPointer:function(n,r,t){switch(r){case 0:return t?function(n){return s[n]}:function(n){return l[n]};case 1:return t?function(n){return p[n>>1]}:function(n){return y[n>>1]};case 2:return t?function(n){return h[n>>2]}:function(n){return v[n>>2]};default:throw TypeError("Unknown integer type: "+n)}}(r,o,0!==e),destructorFunction:null})},b:function(n,r,t){var e=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array][r];function a(n){n>>=2;var r=v,t=r[n],a=r[n+1];return new e(f,a,t)}nm(n,{name:t=nv(t),fromWireType:a,argPackAdvance:8,readValueFromPointer:a},{ignoreDuplicateRegistrations:!0})},k:function(n,r){var t="std::string"===(r=nv(r));nm(n,{name:r,fromWireType:function(n){var r,e=v[n>>2];if(t)for(var a=n+4,o=0;o<=e;++o){var i=n+4+o;if(o==e||0==l[i]){var u=i-a,c=W(a,u);void 0===r?r=c:r+="\0"+c,a=i+1}}else{for(var f=Array(e),o=0;o<e;++o)f[o]=String.fromCharCode(l[n+4+o]);r=f.join("")}return nH(n),r},toWireType:function(n,r){r instanceof ArrayBuffer&&(r=new Uint8Array(r));var e="string"==typeof r;e||r instanceof Uint8Array||r instanceof Uint8ClampedArray||r instanceof Int8Array||nd("Cannot pass non-string to std::string");var a=(t&&e?function(){return M(r)}:function(){return r.length})(),o=nY(4+a+1);if(v[o>>2]=a,t&&e)k(r,l,o+4,a+1);else if(e)for(var i=0;i<a;++i){var u=r.charCodeAt(i);u>255&&(nH(o),nd("String has UTF-16 code units that do not fit in 8 bits")),l[o+4+i]=u}else for(var i=0;i<a;++i)l[o+4+i]=r[i];return null!==n&&n.push(nH,o),o},argPackAdvance:8,readValueFromPointer:ne,destructorFunction:function(n){nH(n)}})},g:function(n,r,t){var e,a,o,i,u;t=nv(t),2===r?(e=j,a=S,i=O,o=function(){return y},u=1):4===r&&(e=I,a=U,i=x,o=function(){return v},u=2),nm(n,{name:t,fromWireType:function(n){for(var t,a=v[n>>2],i=o(),c=n+4,f=0;f<=a;++f){var s=n+4+f*r;if(f==a||0==i[s>>u]){var l=s-c,p=e(c,l);void 0===t?t=p:t+="\0"+p,c=s+r}}return nH(n),t},toWireType:function(n,e){"string"!=typeof e&&nd("Cannot pass non-string to C++ string type "+t);var o=i(e),c=nY(4+o+r);return v[c>>2]=o>>u,a(e,c+4,o+r),null!==n&&n.push(nH,c),c},argPackAdvance:8,readValueFromPointer:ne,destructorFunction:function(n){nH(n)}})},n:function(n,r,t,e,a,o){nr[n]={name:nv(r),rawConstructor:nC(t,e),rawDestructor:nC(a,o),fields:[]}},d:function(n,r,t,e,a,o,i,u,c,f){nr[n].fields.push({fieldName:nv(r),getterReturnType:t,getter:nC(e,a),getterContext:o,setterArgumentType:i,setter:nC(u,c),setterContext:f})},E:function(n,r){nm(n,{isVoid:!0,name:r=nv(r),argPackAdvance:0,fromWireType:function(){},toWireType:function(n,r){}})},e:nb,H:function(n){var r,t;return 0===n?nT(nP()):(n=void 0===(t=nD[r=n])?nv(r):t,nT(nP()[n]))},G:function(n){n>4&&(nw[n].refcount+=1)},o:function(n,t,e,a){(o=n)||nd("Cannot use deleted val. handle = "+o),n=nw[o].value;var o,i=nk[t];return i||(i=function(n){for(var t="",e=0;e<n;++e)t+=(0!==e?", ":"")+"arg"+e;for(var a="return function emval_allocator_"+n+"(constructor, argTypes, args) {\n",e=0;e<n;++e)a+="var argType"+e+" = requireRegisteredType(Module['HEAP32'][(argTypes >>> 2) + "+e+'], "parameter '+e+'");\nvar arg'+e+" = argType"+e+".readValueFromPointer(args);\nargs += argType"+e+"['argPackAdvance'];\n";return Function("requireRegisteredType","Module","__emval_register",a+="var obj = new constructor("+t+");\nreturn __emval_register(obj);\n}\n")(nW,r,nT)}(t),nk[t]=i),i(n,e,a)},a:function(){L()},t:function(n,r,t){l.copyWithin(n,r,r+t)},f:function(n){var r=l.length;if((n>>>=0)>2147483648)return!1;for(var t=1;t<=4;t*=2){var e,a=r*(1+.2/t);if(a=Math.min(a,n+100663296),function(n){try{return c.grow(n-f.byteLength+65535>>>16),Y(c.buffer),1}catch(n){}}(Math.min(2147483648,((e=Math.max(n,a))%65536>0&&(e+=65536-e%65536),e))))return!0}return!1},w:function(n,r){var t=0;return nR().forEach(function(e,a){var o=r+t;h[n+4*a>>2]=o,function(n,r,t){for(var e=0;e<n.length;++e)s[r++>>0]=n.charCodeAt(e);s[r>>0]=0}(e,o),t+=e.length+1}),0},x:function(n,r){var t=nR();h[n>>2]=t.length;var e=0;return t.forEach(function(n){e+=n.length+1}),h[r>>2]=e,0},i:function(n){return 0},z:function(n,r,t,e){var a=nn.getStreamFromFD(n),o=nn.doReadv(a,r,t);return h[e>>2]=o,0},q:function(n,r,t,e,a){},y:function(n,r,t,e){for(var a=0,o=0;o<t;o++){for(var i=h[r+8*o>>2],u=h[r+(8*o+4)>>2],c=0;c<u;c++)nn.printChar(n,l[i+c]);a+=u}return h[e>>2]=a,0},s:function(n){E(n)},v:function(n,r,t,e){return function(n,r,t,e){var a,o,i,u=h[e+40>>2],c={tm_sec:h[e>>2],tm_min:h[e+4>>2],tm_hour:h[e+8>>2],tm_mday:h[e+12>>2],tm_mon:h[e+16>>2],tm_year:h[e+20>>2],tm_wday:h[e+24>>2],tm_yday:h[e+28>>2],tm_isdst:h[e+32>>2],tm_gmtoff:h[e+36>>2],tm_zone:u?W(u):""},f=W(t),l={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var p in l)f=f.replace(RegExp(p,"g"),l[p]);var y=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],v=["January","February","March","April","May","June","July","August","September","October","November","December"];function g(n,r,t){for(var e="number"==typeof n?n.toString():n||"";e.length<r;)e=t[0]+e;return e}function d(n,r){return g(n,r,"0")}function m(n,r){var t;function e(n){return n<0?-1:n>0?1:0}return 0===(t=e(n.getFullYear()-r.getFullYear()))&&0===(t=e(n.getMonth()-r.getMonth()))&&(t=e(n.getDate()-r.getDate())),t}function _(n){switch(n.getDay()){case 0:return new Date(n.getFullYear()-1,11,29);case 1:return n;case 2:return new Date(n.getFullYear(),0,3);case 3:return new Date(n.getFullYear(),0,2);case 4:return new Date(n.getFullYear(),0,1);case 5:return new Date(n.getFullYear()-1,11,31);case 6:return new Date(n.getFullYear()-1,11,30)}}function w(n){var r=nU(new Date(n.tm_year+1900,0,1),n.tm_yday),t=new Date(r.getFullYear(),0,4),e=new Date(r.getFullYear()+1,0,4),a=_(t),o=_(e);return 0>=m(a,r)?0>=m(o,r)?r.getFullYear()+1:r.getFullYear():r.getFullYear()-1}var b={"%a":function(n){return y[n.tm_wday].substring(0,3)},"%A":function(n){return y[n.tm_wday]},"%b":function(n){return v[n.tm_mon].substring(0,3)},"%B":function(n){return v[n.tm_mon]},"%C":function(n){return d((n.tm_year+1900)/100|0,2)},"%d":function(n){return d(n.tm_mday,2)},"%e":function(n){return g(n.tm_mday,2," ")},"%g":function(n){return w(n).toString().substring(2)},"%G":function(n){return w(n)},"%H":function(n){return d(n.tm_hour,2)},"%I":function(n){var r=n.tm_hour;return 0==r?r=12:r>12&&(r-=12),d(r,2)},"%j":function(n){return d(n.tm_mday+nS(nj(n.tm_year+1900)?nO:nI,n.tm_mon-1),3)},"%m":function(n){return d(n.tm_mon+1,2)},"%M":function(n){return d(n.tm_min,2)},"%n":function(){return"\n"},"%p":function(n){return n.tm_hour>=0&&n.tm_hour<12?"AM":"PM"},"%S":function(n){return d(n.tm_sec,2)},"%t":function(){return"	"},"%u":function(n){return n.tm_wday||7},"%U":function(n){var r=new Date(n.tm_year+1900,0,1),t=0===r.getDay()?r:nU(r,7-r.getDay()),e=new Date(n.tm_year+1900,n.tm_mon,n.tm_mday);if(0>m(t,e)){var a=nS(nj(e.getFullYear())?nO:nI,e.getMonth()-1)-31;return d(Math.ceil((31-t.getDate()+a+e.getDate())/7),2)}return 0===m(t,r)?"01":"00"},"%V":function(n){var r=new Date(n.tm_year+1900,0,4),t=new Date(n.tm_year+1901,0,4),e=_(r),a=_(t),o=nU(new Date(n.tm_year+1900,0,1),n.tm_yday);return 0>m(o,e)?"53":0>=m(a,o)?"01":d(Math.ceil((e.getFullYear()<n.tm_year+1900?n.tm_yday+32-e.getDate():n.tm_yday+1-e.getDate())/7),2)},"%w":function(n){return n.tm_wday},"%W":function(n){var r=new Date(n.tm_year,0,1),t=1===r.getDay()?r:nU(r,0===r.getDay()?1:7-r.getDay()+1),e=new Date(n.tm_year+1900,n.tm_mon,n.tm_mday);if(0>m(t,e)){var a=nS(nj(e.getFullYear())?nO:nI,e.getMonth()-1)-31;return d(Math.ceil((31-t.getDate()+a+e.getDate())/7),2)}return 0===m(t,r)?"01":"00"},"%y":function(n){return(n.tm_year+1900).toString().substring(2)},"%Y":function(n){return n.tm_year+1900},"%z":function(n){var r=n.tm_gmtoff;return(r>=0?"+":"-")+String("0000"+(r=(r=Math.abs(r)/60)/60*100+r%60)).slice(-4)},"%Z":function(n){return n.tm_zone},"%%":function(){return"%"}};for(var p in b)f.includes(p)&&(f=f.replace(RegExp(p,"g"),b[p](c)));var T=(o=Array(M(a=f)+1),i=k(a,o,0,o.length),o);return T.length>r?0:(s.set(T,n),T.length-1)}(n,r,t,e)},F:function(n){return n?(h[nV()>>2]=52,-1):0}};!function(){var n={a:nx};function t(n,t){var e,a=n.exports;r.asm=a,Y((c=r.asm.J).buffer),m=r.asm.Q,e=r.asm.K,z.unshift(e),function(n){if(N--,r.monitorRunDependencies&&r.monitorRunDependencies(N),0==N&&(null!==B&&(clearInterval(B),B=null),q)){var t=q;q=null,t()}}(0)}function e(n){t(n.instance)}function o(r){return(u||"function"!=typeof fetch?Promise.resolve().then(function(){return K(X)}):fetch(X,{credentials:"same-origin"}).then(function(n){if(!n.ok)throw"failed to load wasm binary file at '"+X+"'";return n.arrayBuffer()}).catch(function(){return K(X)})).then(function(r){return WebAssembly.instantiate(r,n)}).then(r,function(n){F("failed to asynchronously prepare wasm: "+n),L(n)})}if(N++,r.monitorRunDependencies&&r.monitorRunDependencies(N),r.instantiateWasm)try{return r.instantiateWasm(n,t)}catch(n){return F("Module.instantiateWasm callback failed with error: "+n),!1}(u||"function"!=typeof WebAssembly.instantiateStreaming||G(X)||"function"!=typeof fetch?o(e):fetch(X,{credentials:"same-origin"}).then(function(r){return WebAssembly.instantiateStreaming(r,n).then(e,function(n){return F("wasm streaming compile failed: "+n),F("falling back to ArrayBuffer instantiation"),o(e)})})).catch(a)}(),r.___wasm_call_ctors=function(){return(r.___wasm_call_ctors=r.asm.K).apply(null,arguments)};var nY=r._malloc=function(){return(nY=r._malloc=r.asm.L).apply(null,arguments)},nH=r._free=function(){return(nH=r._free=r.asm.M).apply(null,arguments)},nz=r.___getTypeName=function(){return(nz=r.___getTypeName=r.asm.N).apply(null,arguments)},nV=(r.___embind_register_native_and_builtin_types=function(){return(r.___embind_register_native_and_builtin_types=r.asm.O).apply(null,arguments)},r.___errno_location=function(){return(nV=r.___errno_location=r.asm.P).apply(null,arguments)});function nN(n){n=n||b,!(N>0)&&(!function(){if(r.preRun)for("function"==typeof r.preRun&&(r.preRun=[r.preRun]);r.preRun.length;){var n;n=r.preRun.shift(),H.unshift(n)}Z(H)}(),N>0||(r.setStatus?(r.setStatus("Running..."),setTimeout(function(){setTimeout(function(){r.setStatus("")},1),t()},1)):t()));function t(){!_&&(_=!0,r.calledRun=!0,D||(Z(z),e(r),r.onRuntimeInitialized&&r.onRuntimeInitialized(),function(){if(r.postRun)for("function"==typeof r.postRun&&(r.postRun=[r.postRun]);r.postRun.length;){var n;n=r.postRun.shift(),V.unshift(n)}Z(V)}()))}}if(r.dynCall_jiji=function(){return(r.dynCall_jiji=r.asm.R).apply(null,arguments)},r.dynCall_iiji=function(){return(r.dynCall_iiji=r.asm.S).apply(null,arguments)},r.dynCall_iiiiij=function(){return(r.dynCall_iiiiij=r.asm.T).apply(null,arguments)},r.dynCall_iiiiijj=function(){return(r.dynCall_iiiiijj=r.asm.U).apply(null,arguments)},r.dynCall_iiiiiijj=function(){return(r.dynCall_iiiiiijj=r.asm.V).apply(null,arguments)},r.dynCall_viijii=function(){return(r.dynCall_viijii=r.asm.W).apply(null,arguments)},q=function n(){_||nN(),_||(q=n)},r.run=nN,r.preInit)for("function"==typeof r.preInit&&(r.preInit=[r.preInit]);r.preInit.length>0;)r.preInit.pop()();return nN(),r.ready}}()},5824:(n,r,t)=>{n.exports=t.p+"s/jxl_enc.wasm"}}]);
//# sourceMappingURL=726.js.map