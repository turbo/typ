var fs = require("fs");
var plist = require("plist");
var cson = require("cson");

function write(file, contents) {
  fs.writeFileSync(__dirname + "/" + file, contents, "utf8");
  console.log('wrote to "' + file + '"');
}

////////////////////////////////////////// Grammar /////////////////////////////////////////////

console.log('building grammar...');
var template = fs.readFileSync(__dirname + "/thinscript.tmLanguage.in").toString().replace(/([\\`])/g, "\\$1");
var strings = {
  "identifier": "[A-Za-z$_][\\w$]*",
  "category": {
    "preprocessor": "token.debug-token.preprocessor.thin",
    "unsafe": "token.warn-token.unsafe.thin",
    "assertion": "token.debug-token.assertion.thin",
    "decorator": "token.debug-token.decorator.thin"
  }
};
var language = Function.apply(null, Object.keys(strings).concat("return `" + template + "`")).apply(null, Object.keys(strings).map(key => strings[key]));
var languageParsed = plist.parse(language);

write("sublime/thinscript.tmLanguage", language);
write("vscode/thinscript.tmLanguage", language);
write("atom/grammars/thinscript.cson", cson.createCSONString(languageParsed));

////////////////////////////////////////// Snippets /////////////////////////////////////////////

console.log('building snippets...');
var completions = require("./completions.json");

// Sublime
var sublimeCompletions = {
  "scope": "source.thin",
  "completions": completions.map(str => { return {
    "trigger": str,
    "contents": str
  } })
}
write("sublime/thinscript.sublime-completions", JSON.stringify(sublimeCompletions, null, 2));

// Atom
var completionsJson = {};
completions.forEach(key => completionsJson[key] = {
  "prefix": key,
  "body": key
} );
write("atom/snippets/thinscript-atom.cson", cson.createCSONString({ ".source.thin": completionsJson }));

// VSCode
write("vscode/snippets.json", JSON.stringify(completionsJson, null, 2));