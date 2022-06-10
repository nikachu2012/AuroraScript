const codeSplit = (code) => {
  //コマンドに変形
  code = code.replace(/\r\n/g, "").replace(/\t/g, "");
  code = code.split(/(?<!\\);/g);
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

    retCode.functionValue = code.match(functionRegExp)[0];
    if (retCode.functionValue === "function") {
      retCode.functionShort = false;
    } else if (retCode.functionValue === "fn") {
      retCode.functionShort = true;
    } else {
      return null; // エラー
    }
    const defParamAll = code.match(/\s*(?<=\().*(?=\)\s*{)/)[0];
    
    retCode.defineParameterAllList = defParamAll;
    retCode.defineParameter = defParamAll.split(/(?<!\\), |, | ,/g)
  } else if (code.match(/.+\(.*\).*;/g) !== void 0) {
    // 関数の場合
    retCode.type = "function";
    retCode.input = code;

    retCode.function_nameValue = code.match(functionRegExp)[0];

    const allParameter = code.match(/(?<=\().*?(?=\))/)[0];
    retCode.allParameter = allParameter;

    const parameter = allParameter.split(/(?<!\\), |, | ,/g);
  } else if (undefined) {
    // TODO 数式の場合を追加
  } else {
    return null;
  }

  console.log (retCode);
  return retCode;
};
