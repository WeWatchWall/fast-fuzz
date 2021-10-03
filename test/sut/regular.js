const constants = [69366, 42808];

//                                bool     int,0,16  int,0   int,0     bool     int,0
const regularInternal1 = function (isFalse, cityCode, amount, interest, isExtra, extraInterest) {

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

//                                 bool     int,0,16  int,0   int,0     bool     int,0
const regularInternal2 = function (isFalse, cityCode, amount, interest, isExtra, extraInterest) {

  let result;
  if (isFalse || amount === 0)
  {
    result = {
      type: 'false',
      cityCode: cityCode,
      amount: 0
    };
  }
  else if (cityCode == 12)
  {
    let netInterest = interest + extraInterest;
    let extraInterestTO;

    if (isExtra) {
      if (netInterest > constants[0]) {
        amount = 0;
        extraInterestTO = 0;
      } else {
        extraInterestTO = extraInterest;  
      }
    } else {
      if (netInterest > constants[1]) {
        amount = 0;
        extraInterestTO = 0;
      } else {
        extraInterestTO = 0;
      }
    }

    result = {
      type: 'toronto',
      cityCode: cityCode,
      amount: amount,
      extraInterestTO: extraInterestTO
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

module.exports.regular1 = function (args) {
  return regularInternal1(...args);
};


module.exports.regular2 = function (args) {
  return regularInternal2(...args);
};