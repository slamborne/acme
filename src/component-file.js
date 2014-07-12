module.exports = ComponentFile;

function ComponentFile(filepath) {
  var INFO_PATTERN = /^([\w\d]+)(?:\-([\w\d]+))?(?:\-([\w\d]+))?(?:\.)([\w]{2,})$/i;
  var TEST_PATTERN = /.*\_test\./i;
  var data = INFO_PATTERN.exec(filepath);
  this.root     = data[1];
  this.name     = data[2];
  this.type     = data[3];
  this.filetype = data[4];
  this.module   = (data[2] === undefined && data[3] === undefined && data[4] === 'js' && !TEST_PATTERN.test(filepath)) ? true : false;
  this.test     = TEST_PATTERN.test(filepath);
};
ComponentFile.prototype.root = '';
ComponentFile.prototype.name = '';
ComponentFile.prototype.type = '';
ComponentFile.prototype.filetype = '';
ComponentFile.prototype.test = false;
ComponentFile.prototype.module = false;
