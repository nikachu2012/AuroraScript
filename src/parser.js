const codeSplit = (code) => {
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

  for (let index = 0; index < code.length; index++) {
    const element = code[index];

    parser(element);
  }
};

/**
 * コマンドを解析してASTを生成する
 * @param {string} code コード
 * @returns {JSON} AST
 * @returns {null}
 */
const parser = (code) => {
  if (code == "") {
    return null;
  }

  let retCode = {}; //JSON


  if (/^(?:function|fn)\s*\(.*\)\s*{.+}\s*.*/.test(code)) {
    // functionの場合
    retCode.type = "function_define";
    retCode.input = code;

    // 関数定義関連
    retCode.function = {};

    retCode.function.value = code.match(/^(?:function|fn)(?=\()/)[0];
    if (retCode.function.value === "function") {
      retCode.function.short = false;
    } else if (retCode.function.value === "fn") {
      retCode.function.short = true;
    } else {
      return null; // エラー
    }
    const defParamAll = code.match(/\s*(?<=\().*(?=\)\s*{)/)[0];

    // パラメータ
    retCode.defineParameter = {};
    retCode.defineParameter.all = defParamAll;
    retCode.defineParameter.value = defParamAll.split(/(?<!\\), |, | ,/g);

    const defineFn = code.match(/(?<=^(?:function|fn)\s*\(.*\)\s*{).*(?=})/g);
    retCode.defineFn = {};
    retCode.defineFn.all = defineFn[0];
    retCode.defineFn.value = defineFn[0].split(/(?<=(?<!\\);)/g);
    retCode.defineFn.valueParse = [];

    retCode.defineFn.value.forEach(function (e) {
      retCode.defineFn.valueParse.push(parser(e))
    })

  } else if (/.+\(.*\).*;/.test(code)) {
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
  else if (/.+\s*=\s*.+;/g.test(code)) {
    // TODO 変数定義の場合
    retCode.type = "var_define";
    retCode.input = code;

    retCode.defName = code.match(/^.+(?=\s*=)/g)[0].replace(' ', '')
    retCode.defDat = code.match(/(?<=.*=\s*).*(?=;)/g)[0].replace(' ', '')
  }
  else {
    return null;
  }

  console.log(retCode);
  return retCode;
};
