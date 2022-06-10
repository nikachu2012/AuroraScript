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

