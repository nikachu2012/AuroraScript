const codeSplit = (code) => {
  //コマンドに変形
  code = code.replace(/\r\n/g, "").replace(/\t/g, "").split(/(?<=(?<!\\);)/g);
  console.log(code);

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
  let retCode = {}; //JSON

  const functionRegExp = /(?:.*)(?=\()/;

  if (code.match(/^(?:function|fn)\s*\(.*\)\s*{.+}\s*;/g) !== null) {
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
    retCode.defineParameter.value = defParamAll.split(/(?<!\\), |, | ,/g)
  } else if (code.match(/.+\(.*\).*;/g) !== void 0) {
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

  console.log (retCode);
  return retCode;
};
