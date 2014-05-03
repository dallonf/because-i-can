var quote = String.fromCharCode(34);
var emptyString = new String();
var code = [
  "console.log('var quote = String.fromCharCode(34);');",
  "console.log('var emptyString = new String();');",
  "console.log('var code = [');",
  "code.forEach(function(c) {",
  "  console.log('  ' + quote + c + quote + ',');",
  "});",
  "console.log('];');",
  "console.log('eval(code.join(emptyString));');",
];
eval(code.join(emptyString));