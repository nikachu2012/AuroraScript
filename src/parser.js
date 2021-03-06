const script = {};

const codeSplit = (code) => {
  const startTime = performance.now();

  //コマンドに変形
  code = code.replace(/\r\n/g, "").replace(/\t/g, "").split(/(?<=(?<!\\);)|(?<=(?<=(?:function|fn)\s*\(.*\)\s*{.*).*})/g);
  console.log(code);



  let newcode = [];

  while (true) {

    if (/^(?:function|fn)\s*\(/.test(code[0])) {
      if (/^(?:function|fn)\s*\(/.test(code[0])) {
        const bracketPlace = code.findIndex(element => element.match(/}\s*$/))
        const slice = code.slice(0, bracketPlace + 1)
        const replace = slice.join("")
        code.splice(0, bracketPlace + 1)
        newcode.push(replace)
      }
    }
    else {
      break;
    }
    console.log(code)
    console.log(newcode)
  }

  // https://qiita.com/ArcCosine@github/items/12699ecb7ac40b0956c9
  Array.prototype.splice.apply(code,[0,0].concat(newcode));


  let allAST = [];
  let buildJS = [];

  for (let index = 0; index < code.length; index++) {
    const element = code[index];

    const AST = parser(element);

    allAST.push(AST)

    if(AST.type === "function"){
      // 関数の場合
      buildJS.push(functionAccess(AST));
    }
    else if(AST.type === "function_define"){
      // 関数定義
      const ASTconvert = [];
      for (let index = 0; index < AST.defineFn.valueParse.length; index++) {
        const element = AST.defineFn.valueParse[index];
        ASTconvert.push(functionAccess(element))
        
      }
      buildJS.push(`function ${AST.function.name}(${AST.defineParameter.value.join(',')}){${ASTconvert.join(';')}}`)
    }
    else if(AST.type === "var_define"){
      // 変数定義

      if(/.+\(.*\).*/.test(AST.defDat)){
        const match = AST.defDat.split(/\s*(?:\+|\-|\*|\/)\s*/g);
        let convert = AST.defDat;
        for (let index = 0; index < match.length; index++) {
          const element_parse = parser(match[index] + ';')
          const fnAcc = functionAccess(element_parse);
          convert = convert.replace(match[index], fnAcc)
        }
        buildJS.push(AST.defName + ' = ' + convert)
      }
    }
    else {
      return null;
    }
  }

  eval(buildJS.join(';'))
  const endTime = performance.now(); 

  console.log(allAST)
  console.log(buildJS)

  aurora.log(`実行時間: ${endTime - startTime}ms`, new Date())

};
/**
 * 関数のデータを取得してビルドされるJavascriptを返す
 * @param {string} AST ASTパーサ
 * @returns {string} 変換後のJS
 * @returns {null} エラー時
 */
const functionAccess = (AST) => {
  switch (AST.function.value) {
    // 予約文はここに記入
    case 'print':
      return(`console.log('${AST.parameter.parse[0].value}');`);
    default:
      if (Object.keys(script).includes(AST.function.value)) {
        return(Function(`const AST = ${JSON.stringify(AST)}; return \`${script[AST.function.value].formula}\`;`)());
      } else {
        break;
      }
      break;
  }
}

/**
 * コマンドを解析してASTを生成する
 * @param {string} code コード
 * @returns {JSON} AST
 * @returns {null} エラー時
 */
const parser = (code) => {
  if (code == "") {
    return null;
  }

  let retCode = {}; //JSON


  if (/^(?:function|fn)\s.+\s*\(.*\)\s*{.+}\s*.*/.test(code)) {
    // functionの場合
    retCode.type = "function_define";
    retCode.input = code;

    // 関数定義関連
    retCode.function = {};

    retCode.function.value = code.match(/^(?:function|fn)(?=\s)/)[0];
    if (retCode.function.value === "function") {
      retCode.function.short = false;
    } else if (retCode.function.value === "fn") {
      retCode.function.short = true;
    } else {
      return null; // エラー
    }

    retCode.function.name = code.match(/(?<=function\s+|fn\s+).+(?=\(.+\)\{.*\})/)[0];
    const defParamAll = code.match(/\s*(?<=\().*(?=\)\s*{)/)[0];

    // パラメータ
    retCode.defineParameter = {};
    retCode.defineParameter.all = defParamAll;
    retCode.defineParameter.value = defParamAll.split(/(?<!\\), |, | ,/g);

    const defineFn = code.match(/(?<=^(?:function|fn).*\s*\(.*\)\s*{).*(?=})/g);
    retCode.defineFn = {};
    retCode.defineFn.all = defineFn[0];
    retCode.defineFn.value = defineFn[0].split(/(?<=(?<!\\);)/g);
    retCode.defineFn.valueParse = [];

    retCode.defineFn.value.forEach(function (e) {
      retCode.defineFn.valueParse.push(parser(e + ';'))
    })
// /.+(?<!\=\s*)\(.*\).*;/
  } else if (/(?<!.+\s*\=\s*.+)\(.*\).*;/.test(code)) {
    // 関数の場合
    retCode.type = "function";
    retCode.input = code;

    retCode.function = {};
    retCode.function.value = code.match(/(?:.*)(?=\()/g)[0];

    const allParameter = code.match(/(?<=\().*?(?=\))/)[0];
    const parameter = allParameter.split(/(?<!\\)(?:,\s*|\s*,|,)/g);

    retCode.parameter = {};
    retCode.parameter.all = allParameter;
    retCode.parameter.value = parameter;

    retCode.parameter.parse = [];

    for (let index = 0; index < retCode.parameter.value.length; index++) {
      const element = retCode.parameter.value[index];
      retCode.parameter.parse[index] = {};
      if (/^'.+'$/g.test(element)) {
        retCode.parameter.parse[index].type = 'string'
        retCode.parameter.parse[index].value = element.replace(/^'|'$/g, "");
      }
      else if (/[0-9]/g.test(element)) {
        retCode.parameter.parse[index].type = 'number';
        retCode.parameter.parse[index].value = element;
      }
      else if (/[^0-9]/g.test(element)) {
        retCode.parameter.parse[index].type = 'various';
        retCode.parameter.parse[index].value = element;
      }
      else if (element == "") {
        retCode.parameter.parse[index].type = 'null';
        retCode.parameter.parse[index].value = element;
      }
      else {
        return null;
      }
    }
  }
  else if (/^\/\/.*|\/\*.*\*\//g.test(code)) {
    // コメントの場合
    // 何もしない
  }
  else if (/.+\s*(?<!\\)=\s*.+;/g.test(code)) {
    // TODO 変数定義の場合
    retCode.type = "var_define";
    retCode.input = code;

    retCode.defName = code.match(/^.+(?=\s*(?<!\\)=)/g)[0].replace(' ', '')
    retCode.defDat = code.match(/(?<=.*(?<!\\)=\s*).*(?=;)/g)[0].replace(' ', '')
  }
  else {
    return null;
  }

  console.log(retCode);
  return retCode;
};


const addCommand = (addDat) => {

  script[addDat.code] = addDat
  console.log(`${addDat.code}の読み込みに成功しました。`)
}