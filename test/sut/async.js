const FlatPromise = require("flat-promise");

module.exports = async function (args) {
  var flatPromise = new FlatPromise();

  setTimeout(() => {
    if (args && args[2] == 7) {
      if (args[0] == 'Bob') {
        flatPromise.resolve(false);
      }
    } else if (args && args[2] == 10) {
      if (args[1] == 22 && args[0] == 'Alice') {
        flatPromise.resolve(false);
      }
    }
    flatPromise.resolve(true);
  }, 1);

  return await flatPromise.promise;
};