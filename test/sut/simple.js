module.exports = function (args) {
  if (args[2] == 7) {
    if (args[0] == 'Bob') {
      return false;
    }
  } else if (args[2] == 10) {
    if (args[1] == 22 && args[0] == 'Alice') {
      return false;
    }
  }
  return true;
};