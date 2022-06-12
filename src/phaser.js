const codeSplit = (code) => {
  //コマンドに変形
  code = code.replace(/\r\n/g, "").replace(/\t/g, "").split(/(?<=(?<!\\);)/g);
  console.log(code);



  let newcode = [];

  while (true) {
    if (code == 0) {
      break;
    }

    try {
      if (code[0].match(/^(?:function|fn)\s*\(/)[0] == undefined) {
        break;
      }
    } catch (error) {
      break;
    }
    if (code[0].match(/^(?:function|fn)\s*\(/)) {
      if (code[0].match(/^(?:function|fn)\s*\(/) !== undefined) {
        const bracketPlace = code.indexOf('};')
        const replace = code.slice(0, bracketPlace + 1).join("")
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

  if (code == 0) {
    code = newcode;
  }

  for (let index = 0; index < code.length; index++) {
    const element = code[index];

    phaser(element);
  }
};

/**
 * コマンドを解析してASTを生成する
 * @param {string} code コード
 * @returns {JSON} AST
 * @returns {null}
 */
const phaser = (code) => {
  if (code == "") {
    return null;
  }

  let retCode = {}; //JSON

  const functionRegExp = /(?:.*)(?=\()/;

  if (/^(?:function|fn)\s*\(.*\)\s*{.+}\s*;/.test(code)) {
    // functionの場合
    retCode.type = "function_define";
    retCode.input = code;

    // 関数定義関連
    retCode.function = {};

    retCode.function.value = code.match(functionRegExp)[0];
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
  } else if (/.+\(.*\).*;/.test(code)) {
    // 関数の場合
    retCode.type = "function";
    retCode.input = code;

    retCode.function = {};
    retCode.function.value = code.match(functionRegExp)[0];

    const allParameter = code.match(/(?<=\().*?(?=\))/)[0];
    const parameter = allParameter.split(/(?<!\\), |, | ,/g);

    retCode.parameter = {};
    retCode.parameter.all = allParameter;
    retCode.parameter.value = parameter;
  } else if (undefined) {
    // TODO 数式の場合を追加
  } else {
    return null;
  }

  console.log(retCode);
  return retCode;
};
