function a6DrawStartsNumber(targetLayer) {
  const listOfCustomers = ["刚需 ", "首置 ", "18层小高 ", "11层洋房 ", "洋房 "];
  for (let i = 0; i < basement1.starts.length; i++) {
    let start = basement1.starts[i];

    if (targetLayer) {
      //   console.log("Drawing start", i);
      targetLayer.textSize(16);
      targetLayer.fill(255, 0, 0);
      targetLayer.text(
        listOfCustomers[basement1.coreClasses[i]] +
          ", " +
          basement1.coreHouseholdNumbers[i] +
          "户" +
          " " +
          i,

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

function projectData(projectName) {
  basement1.info = projectName;
  for (let i = 0; i < basement1.starts.length; i++) {
    basement1.coreClasses[i] = basement1.info[i].coreClass;
    basement1.coreHouseholdNumbers[i] = basement1.info[i].coreHouseholdNumber;
  }
}

a6 = {
  classes: ["刚需 ", "首置 ", "125 ", "140 ", "165 "],
  0: {
    coreClass: 1,
    coreHouseholdNumber: 34,
  },
  1: {
    coreClass: 1,
    coreHouseholdNumber: 36,
  },
  2: {
    coreClass: 1,
    coreHouseholdNumber: 36,
  },
  3: {
    coreClass: 1,
    coreHouseholdNumber: 36,
  },
  4: {
    coreClass: 1,
    coreHouseholdNumber: 32,
  },
  5: {
    coreClass: 1,
    coreHouseholdNumber: 26,
  },
  6: {
    coreClass: 1,
    coreHouseholdNumber: 34,
  },
  7: {
    coreClass: 1,
    coreHouseholdNumber: 36,
  },
  8: {
    coreClass: 1,
    coreHouseholdNumber: 36,
  },
  9: {
    coreClass: 1,
    coreHouseholdNumber: 36,
  },
  10: {
    coreClass: 1,
    coreHouseholdNumber: 32,
  },
  11: {
    coreClass: 3,
    coreHouseholdNumber: 18,
  },
  12: {
    coreClass: 1,
    coreHouseholdNumber: 26,
  },
  13: {
    coreClass: 1,
    coreHouseholdNumber: 36,
  },
  14: {
    coreClass: 3,
    coreHouseholdNumber: 18,
  },
  15: {
    coreClass: 2,
    coreHouseholdNumber: 36,
  },
  16: {
    coreClass: 2,
    coreHouseholdNumber: 36,
  },
  17: {
    coreClass: 2,
    coreHouseholdNumber: 34,
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
    coreHouseholdNumber: 26,
  },
  21: {
    coreClass: 1,
    coreHouseholdNumber: 36,
  },
  22: {
    coreClass: 2,
    coreHouseholdNumber: 34,
  },
  23: {
    coreClass: 2,
    coreHouseholdNumber: 26,
  },
  24: {
    coreClass: 3,
    coreHouseholdNumber: 18,
  },
  25: {
    coreClass: 3,
    coreHouseholdNumber: 18,
  },
  26: {
    coreClass: 2,
    coreHouseholdNumber: 26,
  },
  27: {
    coreClass: 2,
    coreHouseholdNumber: 34,
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
    coreHouseholdNumber: 26,
  },
  32: {
    coreClass: 2,
    coreHouseholdNumber: 34,
  },
  33: {
    coreClass: 2,
    coreHouseholdNumber: 36,
  },
  34: {
    coreClass: 2,
    coreHouseholdNumber: 36,
  },
  35: {
    coreClass: 2,
    coreHouseholdNumber: 36,
  },
};

function a6Values() {
  basement1.info = {
    //all the way to 36
    0: {
      coreClass: 1,
      coreHouseholdNumber: 34,
    },
    1: {
      coreClass: 1,
      coreHouseholdNumber: 36,
    },
    2: {
      coreClass: 1,
      coreHouseholdNumber: 36,
    },
    3: {
      coreClass: 1,
      coreHouseholdNumber: 36,
    },
    4: {
      coreClass: 1,
      coreHouseholdNumber: 32,
    },
    5: {
      coreClass: 1,
      coreHouseholdNumber: 26,
    },
    6: {
      coreClass: 1,
      coreHouseholdNumber: 34,
    },
    7: {
      coreClass: 1,
      coreHouseholdNumber: 36,
    },
    8: {
      coreClass: 1,
      coreHouseholdNumber: 36,
    },
    9: {
      coreClass: 1,
      coreHouseholdNumber: 36,
    },
    10: {
      coreClass: 1,
      coreHouseholdNumber: 32,
    },
    11: {
      coreClass: 3,
      coreHouseholdNumber: 18,
    },
    12: {
      coreClass: 1,
      coreHouseholdNumber: 26,
    },
    13: {
      coreClass: 1,
      coreHouseholdNumber: 36,
    },
    14: {
      coreClass: 3,
      coreHouseholdNumber: 18,
    },
    15: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    16: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    17: {
      coreClass: 2,
      coreHouseholdNumber: 34,
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
      coreHouseholdNumber: 26,
    },
    21: {
      coreClass: 1,
      coreHouseholdNumber: 36,
    },
    22: {
      coreClass: 2,
      coreHouseholdNumber: 34,
    },
    23: {
      coreClass: 2,
      coreHouseholdNumber: 26,
    },
    24: {
      coreClass: 3,
      coreHouseholdNumber: 18,
    },
    25: {
      coreClass: 3,
      coreHouseholdNumber: 18,
    },
    26: {
      coreClass: 2,
      coreHouseholdNumber: 26,
    },
    27: {
      coreClass: 2,
      coreHouseholdNumber: 34,
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
      coreHouseholdNumber: 26,
    },
    32: {
      coreClass: 2,
      coreHouseholdNumber: 34,
    },
    33: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    34: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
    35: {
      coreClass: 2,
      coreHouseholdNumber: 36,
    },
  };
  //apply the values to the basement1 object
  for (let i = 0; i < basement1.starts.length; i++) {
    basement1.coreClasses[i] = basement1.info[i].coreClass;
    basement1.coreHouseholdNumbers[i] = basement1.info[i].coreHouseholdNumber;
  }
}
