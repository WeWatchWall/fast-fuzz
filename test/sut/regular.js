const constants = [69366, 42808];

//                                bool     int,0,16  int,0   int,0     bool     int,0
const regularInternal = function (isFalse, cityCode, amount, interest, isExtra, extraInterest) {

  let result;
  if (cityCode == 12)
  {
      let extraInterestTO = 0;
      if (isExtra && !isFalse)
      {
        extraInterestTO = extraInterest;
      }

      let netInterest = interest + extraInterest;
      let overInterest = (netInterest > constants[0] && isExtra) || (netInterest > constants[1] && !isExtra);

      if (overInterest)
      {
          amount = 0;
          extraInterestTO = 0;
      }

      result = {
        type: 'toronto',
        cityCode: cityCode,
        amount: amount,
        extraInterestTO: extraInterestTO
      };
  }
  else if (isFalse || amount === 0)
  {
    result = {
      type: 'false',
      cityCode: cityCode,
      amount: 0
    };
  }
  else
  {
    result = {
      type: 'regular',
      cityCode: cityCode,
      amount: amount
    };
  }

  return result;
};

module.exports.regular = function (args) {
  return regularInternal(...args);
};