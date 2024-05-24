function DrawStartsNumber(targetLayer, projectName) {
  const listOfCustomers = projectName.classes;
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

function projectData(projectName) {
  basement1.info = projectName;
  for (let i = 0; i < basement1.starts.length; i++) {
    basement1.coreClasses[i] = basement1.info[i].coreClass;
    basement1.coreHouseholdNumbers[i] = basement1.info[i].coreHouseholdNumber;
  }
}

//盘锦 人均可支配收入49000，约等于天津、济南、南通，高于合肥、沈阳； 低于武汉、青岛
// 库存均价
// 165 x 7500  = 115.5
// 140 x 7000 = 98
// 125 x 6500 = 81.25
// class 2 meanIncome = 1.8 ** 2 * 60000 = 194400
// class 3 meanIncome = 1.8 ** 3 * 60000 = 349920
// class 4 meanIncome = 1.8 ** 4 * 60000 = 629856

// let occupancyRate = 0.85;
// let customersTotalIncome = 0;
// // const remoteLotDist = 400; // in meters, Not in use
// // const baselineIncome = 60000; //CNY for surviving level
// // const baselineIncome = 115000; //jinan a13 adjusted value
// const baselineIncome = 120000; //jinan a6 adjusted value
// const guessHigh = 700000;

// this.meanIncome = 1.5 ** level * baselineIncome;

const panjin = {
  occupancyRate: 0.85,
  baselineIncome: 80000,
  exponentBase: 1.5,
  classes: ["刚需 ", "首置 ", "125 ", "140 ", "165 "],
  0: {
    coreClass: 2,
    coreHouseholdNumber: 36,
  },
  1: {
    coreClass: 2,
    coreHouseholdNumber: 53,
  },
  2: {
    coreClass: 2,
    coreHouseholdNumber: 34,
  },
  3: {
    coreClass: 2,
    coreHouseholdNumber: 47,
  },
  4: {
    coreClass: 3,
    coreHouseholdNumber: 12,
  },
  5: {
    coreClass: 3,
    coreHouseholdNumber: 18,
  },
  6: {
    coreClass: 2,
    coreHouseholdNumber: 34,
  },
  7: {
    coreClass: 3,
    coreHouseholdNumber: 16,
  },
  8: {
    coreClass: 2,
    coreHouseholdNumber: 34,
  },
  9: {
    coreClass: 3,
    coreHouseholdNumber: 26,
  },
  10: {
    coreClass: 2,
    coreHouseholdNumber: 34,
  },
  11: {
    coreClass: 4,
    coreHouseholdNumber: 36,
  },
  12: {
    coreClass: 3,
    coreHouseholdNumber: 36,
  },
  13: {
    coreClass: 2,
    coreHouseholdNumber: 34,
  },
  14: {
    coreClass: 3,
    coreHouseholdNumber: 26,
  },
  15: {
    coreClass: 4,
    coreHouseholdNumber: 36,
  },
  16: {
    coreClass: 3,
    coreHouseholdNumber: 36,
  },
  17: {
    coreClass: 3,
    coreHouseholdNumber: 34,
  },
  18: {
    coreClass: 3,
    coreHouseholdNumber: 24,
  },
  19: {
    coreClass: 4,
    coreHouseholdNumber: 34,
  },
  20: {
    coreClass: 2,
    coreHouseholdNumber: 34,
  },
  21: {
    coreClass: 3,
    coreHouseholdNumber: 34,
  },
  22: {
    coreClass: 4,
    coreHouseholdNumber: 34,
  },
  23: {
    coreClass: 3,
    coreHouseholdNumber: 12,
  },
  24: {
    coreClass: 2,
    coreHouseholdNumber: 34,
  },
  25: {
    coreClass: 2,
    coreHouseholdNumber: 34,
  },
  26: {
    coreClass: 3,
    coreHouseholdNumber: 9,
  },
  27: {
    coreClass: 3,
    coreHouseholdNumber: 15,
  },
  28: {
    coreClass: 3,
    coreHouseholdNumber: 15,
  },
  29: {
    coreClass: 2,
    coreHouseholdNumber: 20,
  },
  30: {
    coreClass: 2,
    coreHouseholdNumber: 27,
  },
  31: {
    coreClass: 2,
    coreHouseholdNumber: 44,
  },
  32: {
    coreClass: 2,
    coreHouseholdNumber: 20,
  },
  33: {
    coreClass: 2,
    coreHouseholdNumber: 44,
  },
};
