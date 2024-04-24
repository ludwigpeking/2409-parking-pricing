function a13DrawStartsNumber(targetLayer) {
  const listOfCustomers = ["刚需 ", "首置 ", "首改 ", "再改 ", "高改 "];
  for (let i = 0; i < basement1.starts.length; i++) {
    let start = basement1.starts[i];

    if (targetLayer) {
      //   console.log("Drawing start", i);
      targetLayer.textSize(12);
      targetLayer.fill(255);
      targetLayer.text(
        listOfCustomers[basement1.coreClasses[i]] +
          ", " +
          basement1.coreHouseholdNumbers[i] +
          "户",
        start.x * pixelMultiplier,
        start.y * pixelMultiplier - 2 * pixelMultiplier
      );
    }
  }
}
// 库存均价
// 165 x 22000  = 363
// 143 x 20000 = 286
// 130 x 16000 = 208
// class 2 meanIncome = 1.8 ** 2 * 60000 = 194400
// class 3 meanIncome = 1.8 ** 3 * 60000 = 349920
// class 4 meanIncome = 1.8 ** 4 * 60000 = 629856

function a13Values() {
  basement1.info = {
    //all the way to 36
    0: {
      coreClass: 4,
      coreHouseholdNumber: 18,
    },
    1: {
      coreClass: 4,
      coreHouseholdNumber: 18,
    },
    2: {
      coreClass: 4,
      coreHouseholdNumber: 18,
    },
    3: {
      coreClass: 4,
      coreHouseholdNumber: 18,
    },
    4: {
      coreClass: 3,
      coreHouseholdNumber: 22,
    },
    5: {
      coreClass: 3,
      coreHouseholdNumber: 22,
    },
    6: {
      coreClass: 4,
      coreHouseholdNumber: 18,
    },
    7: {
      coreClass: 3,
      coreHouseholdNumber: 22,
    },
    8: {
      coreClass: 3,
      coreHouseholdNumber: 22,
    },
    9: {
      coreClass: 4,
      coreHouseholdNumber: 18,
    },
    10: {
      coreClass: 4,
      coreHouseholdNumber: 18,
    },
    11: {
      coreClass: 3,
      coreHouseholdNumber: 22,
    },
    12: {
      coreClass: 3,
      coreHouseholdNumber: 22,
    },
    13: {
      coreClass: 4,
      coreHouseholdNumber: 18,
    },
    14: {
      coreClass: 3,
      coreHouseholdNumber: 22,
    },
    15: {
      coreClass: 3,
      coreHouseholdNumber: 22,
    },
    16: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    17: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    18: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    19: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    20: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    21: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    22: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    23: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    24: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    25: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    26: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    27: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    28: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    29: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    30: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    31: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    32: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    33: {
      coreClass: 2,
      coreHouseholdNumber: 28,
    },
    34: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    35: {
      coreClass: 2,
      coreHouseholdNumber: 28,
    },
  };
  //apply the values to the basement1 object
  for (let i = 0; i < basement1.starts.length; i++) {
    basement1.coreClasses[i] = basement1.info[i].coreClass;
    basement1.coreHouseholdNumbers[i] = basement1.info[i].coreHouseholdNumber;
  }
}
