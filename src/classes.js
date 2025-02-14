let customers = [];
let customersUsed = [];
let customersLeft = [];
let salesControlActive = false;
let customerLotChoices = []; // This will store customer-lot pairings for each round

let customersTotalIncome = 0;
// const remoteLotDist = 400; // in meters, Not in use
// const baselineIncome = 60000; //CNY for surviving level
// const baselineIncome = 115000; //jinan a13 adjusted value
const project = panjin;
let occupancyRate = project.occupancyRate || 0.85;
const baselineIncome = project.baselineIncome; //jinan a6 adjusted value
const exponentBase = project.exponentBase || 1.4;
const guessHigh = 700000;
const incomeDeviation = project.incomeDeviation || 0.15;
const timeValueFactor = project.timeValueFactor || 1;
let householdNumberWithDeal;
let totalHouseholdNumber;
let prices = []; // prices of each round
let realizations = []; // realizations of each round
let customersRealizations = []; // customers' realizations of each round
let percentageBar = 0; //minimum percentage of sold lots to be considered as a good round
let maxSales = 0;
let maxSalesIndex = -1;
let percentages = [];
let totalSales = [];
let commonStarts = [];
let combinedEnds = [];
let openLots = [];
let soldLots = [];
const basement2RampMetersLoss = project.basement2RampMetersLoss || 50;

class Customer {
  constructor(core, level = 0) {
    // this.meanIncome = 1.8 ** level * baselineIncome;
    // this.meanIncome = 1.4 ** level * baselineIncome; //jinan a13 adjusted value
    this.meanIncome = exponentBase ** level * baselineIncome; //jinan a6 adjusted value

    this.income = normalRandom(
      this.meanIncome,
      incomeDeviation * this.meanIncome
    );
    //jinan a13 adjusted value
    ///////////// TODO: the carOwnership needs some tuning perhapse ////////////////////
    this.carOwnership =
      0.075 /
      ((1.35 ** (log(this.income / baselineIncome) / log(2)) * 12000) /
        this.income);
    // this.carOwnership =
    // 0.12 /
    // ((1.5 ** (log(this.income / baselineIncome) / log(2)) * 12000) /
    //   this.income);

    this.firstCar = false;
    if (this.carOwnership > random()) {
      this.firstCar = true;
      //first car is a mini car
      if (this.carOwnership < random() * 2.5 - 1.25) {
        this.firstCarMini = true;
      }
    }
    //two car
    if (this.carOwnership > 1 + random() * 1.2 - 0.1) {
      this.twoCars = true;
      this.doubleAcceptance = false;
      //second car is a mini car
      if (this.carOwnership < random() + 0.52) {
        this.secondCarMini = true;
      }
      this.secondCarUsage = max(min(normalRandom(1, 0.5), 1), 0);
      // this.secondCarUsage = 0.78;
      // console.log("second car usage: ", this.secondCarUsage);
    }
    //the customer can accept a double lot
    if (this.secondCarUsage < random() + 0.2) {
      this.doubleAcceptance = true;
      console.log("double acceptance", this.secondCarUsage);
    }

    this.core = core;
    this.dists = this.core.dists;
    this.lotsLoss = [];
    this.meterValue = (this.income / 120000 / 80) * 600 * 12 * timeValueFactor;
    this.lotsLossDouble = new Array(combinedEnds.length).fill(Infinity);
    if (this.twoCars) {
      this.meterValueSecond = (this.meterValue * (1 + this.secondCarUsage)) / 2;
      // this.meterValueSecond = this.meterValue * this.secondCarUsage;

      this.lotsLossSecond = [];
      if (this.doubleAcceptance) {
        this.meterValueDouble = this.meterValue + this.meterValueSecond;
        //should only target the double lots
      }
    }

    for (let i = 0; i < combinedEnds.length; i++) {
      //first car loss
      this.lotsLoss[i] =
        (this.dists[i] +
          basement2RampMetersLoss * (combinedEnds[i].basement - 1)) *
        this.meterValue; //B2 penalty
      if (this.dists[i] < 16) this.lotsLoss[i] -= 30 * this.meterValue;
      if (this.dists[i] < 8) this.lotsLoss[i] -= 30 * this.meterValue;
      if (combinedEnds[i].advantagedColorPoint)
        this.lotsLoss[i] -= 80 * this.meterValue; //advantaged parking
      if (combinedEnds[i].small) {
        this.lotsLoss[i] += 400 * this.meterValue;
      }
      if (combinedEnds[i].small && this.firstCarMini) {
        this.lotsLoss[i] -= 300 * this.meterValue;
      }
      if (combinedEnds[i].narrowColorPoint) {
        this.lotsLoss[i] += 30 * this.meterValue;
      }
      if (combinedEnds[i].disadvantagedColorPoint) {
        this.lotsLoss[i] += 110 * this.meterValue;
      }
      if (combinedEnds[i].housedColorPoint) {
        // housed parking can be used for storage
        this.lotsLoss[i] -= 550 * this.meterValue;
      }
      if (combinedEnds[i].deadEndPoint) {
        this.lotsLoss[i] += 70 * this.meterValue;
        if (combinedEnds[i].small) {
          this.lotsLoss[i] -= 50 * this.meterValue;
        }
      }

      //second car loss
      if (this.twoCars) {
        this.lotsLossSecond[i] =
          (this.dists[i] +
            basement2RampMetersLoss * (combinedEnds[i].basement - 1)) *
          this.meterValueSecond; //B2 penalty
        if (this.dists[i] < 16)
          this.lotsLossSecond[i] -= 30 * this.meterValueSecond;
        if (this.dists[i] < 8)
          this.lotsLossSecond[i] -= 30 * this.meterValueSecond;
        if (combinedEnds[i].advantagedColorPoint) {
          this.lotsLossSecond[i] -= 80 * this.meterValueSecond;
        }
        if (combinedEnds[i].small)
          this.lotsLossSecond[i] += 400 * this.meterValueSecond;
        if (this.secondCarMini && combinedEnds[i].small)
          this.lotsLossSecond[i] -= 300 * this.meterValueSecond;
        if (combinedEnds[i].narrowColorPoint)
          this.lotsLossSecond[i] += 30 * this.meterValueSecond;
        if (combinedEnds[i].disadvantagedColorPoint)
          this.lotsLossSecond[i] += 110 * this.meterValueSecond;
        if (combinedEnds[i].housedColorPoint)
          this.lotsLossSecond[i] -= 550 * this.meterValueSecond;
        if (combinedEnds[i].deadEndPoint) {
          this.lotsLossSecond[i] += 70 * this.meterValueSecond;
          if (combinedEnds[i].small)
            this.lotsLossSecond[i] -= 50 * this.meterValueSecond;
        }

        //

        if (this.doubleAcceptance && combinedEnds[i].double) {
          // console.log("double lot involved");
          this.lotsLossDouble[i] =
            (this.dists[i] +
              basement2RampMetersLoss * (combinedEnds[i].basement - 1)) *
              this.meterValueDouble +
            150 * this.meterValueDouble;
          if (this.dists[i] < 16)
            this.lotsLossDouble[i] -= 30 * this.meterValueDouble;
          if (this.dists[i] < 8)
            this.lotsLossDouble[i] -= 30 * this.meterValueDouble;
          if (combinedEnds[i].advantagedColorPoint)
            this.lotsLossDouble[i] -= 80 * this.meterValueDouble;

          if (combinedEnds[i].narrowColorPoint)
            this.lotsLossDouble[i] += 30 * this.meterValueDouble;
          if (combinedEnds[i].disadvantagedColorPoint)
            this.lotsLossDouble[i] += 110 * this.meterValueDouble;
          if (combinedEnds[i].housedColorPoint)
            this.lotsLossDouble[i] -= 550 * this.meterValueDouble;
          if (combinedEnds[i].deadEndPoint) {
            this.lotsLossDouble[i] += 70 * this.meterValueDouble;
            if (combinedEnds[i].small)
              this.lotsLossDouble[i] -= 50 * this.meterValueDouble;
          }
        }
      }
    }

    this.noLotLoss = core.maxMetersLoss * this.meterValue;
    this.noLotLossSecond = core.maxMetersLoss * this.meterValueSecond;
    this.noLotLossDouble = core.maxMetersLoss * this.meterValueDouble;
  }
  // pickSeparateLot() {}
  // pickDoubleLot() {}
  // pickMakeCompare() {}
}

function startBuyingSimulation() {
  console.log("start buying simulation");
  if (!salesControlActive) {
    soldLots = [];
    createCustomers();
    customersLeft = customers.slice();
    [basement1, basement2].forEach((basement) => {
      if (!basement.textLayer) {
        basement.textLayer = createGraphics(width, height);
      } else {
        basement.textLayer.clear();
      }
      if (!basement.customerLinesLayer) {
        basement.customerLinesLayer = createGraphics(width, height);
      } else {
        basement.customerLinesLayer.clear();
      }
    });

    bidding();
    drawCustomerLotLines(maxSalesIndex);
    //draw texts on textLayer
    // drawDomsValue();
    //save image
    // saveCanvas("myCanvas", "jpg");
  } else {
    alert("The sales control is active!"); //not implemented yet.
  }
}

function multipleSimulation(times) {
  // console.log(prices[maxSalesIndex]);
  // console.log(realizations[maxSalesIndex]);
  // console.log(round(percentages[maxSalesIndex] * 100), "%");
  // console.log("Max Sales: ", totalSales[maxSalesIndex]);
  const results = [];
  let HighPrices = [];

  for (let i = 0; i < times; i++) {
    startBuyingSimulation();
    HighPrices.push(prices[maxSalesIndex]);
  }
  //average the prices
  for (let i = 0; i < HighPrices[0].length; i++) {
    let sum = 0;
    for (let j = 0; j < HighPrices.length; j++) {
      sum += HighPrices[j][i];
    }
    results.push(sum / times);
  }

  //calculate
}

function combineEnds(basement1, basement2) {
  //put the combinedEnds of the two basements into one array
  combinedEnds = [];

  basement1.ends.forEach((end) => {
    combinedEnds.push({ ...end, basement: 1 });
  });

  basement2.ends.forEach((end) => {
    combinedEnds.push({ ...end, basement: 2 });
  });
  starts = basement1.starts.concat(basement2.starts);
  openLots = basement1.openLots.concat(basement2.openLots);
}

//recognize which starts in basement2 are common with basement1, merge their dists arrays into that of each start in basement1
function mergeCommonStarts(basement1, basement2, tolerance = 2) {
  commonStarts = [];
  for (let i = 0; i < basement1.starts.length; i++) {
    for (let j = 0; j < basement2.starts.length; j++) {
      let dx = Math.abs(basement1.starts[i].x - basement2.starts[j].x);
      let dy = Math.abs(basement1.starts[i].y - basement2.starts[j].y);

      // Check if the difference in both x and y falls within the tolerance
      if (dx <= tolerance && dy <= tolerance) {
        commonStarts.push(basement2.starts[j]);
        // Here we assume dists is an array and we want to merge the two arrays
        basement1.starts[i].dists = [
          ...basement1.starts[i].dists,
          ...basement2.starts[j].dists,
        ];

        // Optionally, you might want to update the position of the common start
        // to be the average of the two if they're not exactly the same
        if (dx > 0 || dy > 0) {
          basement1.starts[i].x =
            (basement1.starts[i].x + basement2.starts[j].x) / 2;
          basement1.starts[i].y =
            (basement1.starts[i].y + basement2.starts[j].y) / 2;
        }

        break; // Assuming each start in basement2 matches at most one start in basement1
      }
    }
  }
}

function createCustomers() {
  //check exit.MinutesLoss plus start.distToExit minimum, the smallest sum is the final maxMinutesLoss, add to the start.maxMinutesLoss
  for (let i = 0; i < basement1.starts.length; i++) {
    let minMeterLoss = 2000;
    basement1.starts[i].maxMetersLoss = 2000;
    for (let j = 0; j < basement1.exits.length; j++) {
      if (
        basement1.starts[i].distsToExits[j] +
          basement1.exits[j].metersLoss +
          120 <
        minMeterLoss
      ) {
        minMeterLoss =
          basement1.starts[i].distsToExits[j] +
          basement1.exits[j].metersLoss +
          120;
      }
    }
    basement1.starts[i].maxMetersLoss = minMeterLoss;
  }
  customers = [];
  // const customerFirstCar = [];
  // const customerSecondCar = [];
  // create customers
  householdNumberWithDeal = 0;
  totalHouseholdNumber = 0;
  customersTotalIncome = 0;
  let customerFirstCarCount = 0;
  let customerSecondCarCount = 0;
  let customerFirstCarMiniCount = 0;
  let customerSecondCarMiniCount = 0;
  let customerDoubleAcceptanceCount = 0;
  let customerSecondCarUsage = 0;
  let averageCarOwnership = 0;
  for (let i = 0; i < basement1.starts.length; i++) {
    for (let j = 0; j < basement1.coreHouseholdNumbers[i]; j++) {
      totalHouseholdNumber++;
      if (occupancyRate > random()) {
        const customer = new Customer(
          basement1.starts[i],
          basement1.coreClasses[i]
        );
        householdNumberWithDeal++;
        averageCarOwnership += customer.carOwnership;
        customersTotalIncome += customer.income;
        if (customer.firstCar) {
          customerFirstCarCount++;
          // customerFirstCar.push(customer);
          customers.push(customer);
        }
        if (customer.twoCars) {
          customerSecondCarCount++;
          customerSecondCarUsage += customer.secondCarUsage;
          // const secondBuy = new Customer(basement1.starts[i],
          //   basement1.coreClasses[i], 1);
          // customerSecondCar.push(secondBuy);
          // customerSecondCar.push(customer);
        }
        if (customer.firstCarMini) {
          customerFirstCarMiniCount++;
        }
        if (customer.secondCarMini) {
          customerSecondCarMiniCount++;
        }
        if (customer.doubleAcceptance) {
          customerDoubleAcceptanceCount++;
        }
      }
    }
  }
  averageCarOwnership = averageCarOwnership / householdNumberWithDeal;
  customerSecondCarUsage = customerSecondCarUsage / customerSecondCarCount;
  let firstCarMiniPercentage =
    customerFirstCarMiniCount / customerFirstCarCount;
  let secondCarMiniPercentage =
    customerSecondCarMiniCount / customerSecondCarCount;
  //shuffle the customers
  // shuffle(customerFirstCar, true); //p5.js shuffle
  shuffle(customers, true); //p5.js shuffle
  // shuffle(customerSecondCar, true); //p5.js shuffle
  //combine the two arrays into customers
  // customers = customerFirstCar.concat(customerSecondCar);
  console.log(
    "\n",
    "有需求客户数 householdNumberWithDeal: ",
    householdNumberWithDeal,
    // "\n",
    // "first cars: ",
    // customerFirstCarCount,
    "\n",
    "平均车位需求 average car ownership: ",
    averageCarOwnership,
    "\n",

    "主要用车为微型车的客户数 first mini cars: ",
    customerFirstCarMiniCount,
    // "\n",
    // "first car mini percentage: ",
    // firstCarMiniPercentage,
    "\n",
    "有第二辆车的客户数 second cars: ",
    customerSecondCarCount,
    "\n",
    "第二辆车为微型车的客户数 second mini cars: ",
    customerSecondCarMiniCount,
    // "\n",
    // "second car mini percentage: ",
    // secondCarMiniPercentage,
    "\n",
    "可以接受子母车位的数量 double acceptance: ",
    customerDoubleAcceptanceCount,
    "\n",
    "第二辆车的使用频率 second car usage: ",
    round(customerSecondCarUsage * 100) + "%"
  );

  //draw a customer carOwnership histogram
}

function bidding() {
  //sale give price
  //resize the img to fit the canvas
  prices = [];
  let Round = 0;
  totalSales = [];
  percentages = [];
  openLots = combinedEnds.slice();
  console.log("openLots: ", openLots.length);
  prices.push(new Array(openLots.length).fill(guessHigh));
  maxSales = 0;
  maxSalesIndex = -1;
  realizations = []; //
  customersRealizations = [];
  customerLotChoices = []; // Reset for a new simulation run

  while (Round < 3000) {
    let roundChoices = []; // Initialize an empty object for this round
    // customersRealizations.push(new Array(customersLeft.length).fill([0, 0]));//seems problematic
    customersRealizations.push([]);
    for (let i = 0; i < customersLeft.length; i++) {
      roundChoices.push([-1, -1]);
      if (customersLeft[i].twoCars) {
        customersRealizations[Round].push([0, 0]);
      } else {
        customersRealizations[Round].push([0, 2]); //2 means no demand, 1 means demand fulfilled, 0 means demand not fulfilled
      }
    }

    totalSales.push(0);
    let availability = new Array(openLots.length).fill(1);
    for (let i = 0; i < customersLeft.length; i++) {
      let customer = customersLeft[i];

      //one customer one car -
      if (!customer.twoCars) {
        let loss = new Array(openLots.length).fill(customer.noLotLoss);
        let minLoss = customer.noLotLoss;
        let chosenLotIndex = -1; // Default to -1, indicating no lot chosen yet
        for (let j = 0; j < openLots.length; j++) {
          if (availability[j] === 1) {
            loss[j] = customer.lotsLoss[j] + prices[Round][j];
            if (loss[j] < minLoss) {
              customersRealizations[Round][i][0] = 1;
              minLoss = loss[j];
              chosenLotIndex = j;
            }
          }
        }
        if (chosenLotIndex !== -1) {
          availability[chosenLotIndex] = 0;
          totalSales[Round] += prices[Round][chosenLotIndex];
          roundChoices[i][0] = chosenLotIndex; // Record the customer's choice
        }
      } else if (
        //two car customers make two picks independently
        //first pick
        !customer.doubleAcceptance
      ) {
        let loss = new Array(openLots.length).fill(customer.noLotLoss);
        let minLoss = customer.noLotLoss;
        let chosenLotIndex = -1; // Default to -1, indicating no lot chosen yet
        for (let j = 0; j < openLots.length; j++) {
          if (availability[j] === 1) {
            loss[j] = customer.lotsLoss[j] + prices[Round][j];
            if (loss[j] < minLoss) {
              customersRealizations[Round][i][0] = 1;
              minLoss = loss[j];
              chosenLotIndex = j;
            }
          }
        }
        if (chosenLotIndex !== -1) {
          availability[chosenLotIndex] = 0;
          totalSales[Round] += prices[Round][chosenLotIndex];
          roundChoices[i][0] = chosenLotIndex;
        }

        //second pick
        let LossSecond = new Array(openLots.length).fill(
          customer.noLotLossSecond
        );
        let minLossSecond = customer.noLotLossSecond;
        let chosenLotIndexSecond = -1;
        for (let j = 0; j < openLots.length; j++) {
          if (availability[j] === 1) {
            LossSecond[j] = customer.lotsLossSecond[j] + prices[Round][j];
            if (LossSecond[j] < minLossSecond) {
              customersRealizations[Round][i][1] = 1;
              minLossSecond = LossSecond[j];
              chosenLotIndexSecond = j;
            }
          }
        }
        if (chosenLotIndexSecond !== -1) {
          availability[chosenLotIndexSecond] = 0;
          totalSales[Round] += prices[Round][chosenLotIndexSecond];
          roundChoices[i][1] = chosenLotIndexSecond; // Record the customer's choice
        }
      }

      // if (customer.twoCars && customer.doubleAcceptance) {
      else {
        //compare the loss between picking two lots and picking one double lot
        //first car
        let loss = new Array(openLots.length).fill(customer.noLotLoss);
        let minLoss = customer.noLotLoss;
        let chosenLotIndex = -1; // Default to -1, indicating no lot chosen yet
        for (let j = 0; j < openLots.length; j++) {
          if (availability[j] === 1) {
            loss[j] = customer.lotsLoss[j] + prices[Round][j];
            if (loss[j] < minLoss) {
              // customersRealizations[Round][i][0] = 1;
              minLoss = loss[j];
              chosenLotIndex = j;
            }
          }
        }
        //second car
        let LossSecond = new Array(openLots.length).fill(
          customer.noLotLossSecond
        );
        let minLossSecond = customer.noLotLossSecond;
        let chosenLotIndexSecond = -1;
        for (let j = 0; j < openLots.length; j++) {
          if (availability[j] === 1) {
            LossSecond[j] = customer.lotsLossSecond[j] + prices[Round][j];
            if (LossSecond[j] < minLossSecond) {
              // customersRealizations[Round][i][1] = 1;
              minLossSecond = LossSecond[j];
              chosenLotIndexSecond = j;
            }
          }
        }
        const totalLoss = minLoss + minLossSecond;

        //double lot

        let lossDouble = new Array(openLots.length).fill(
          customer.noLotLossDouble
        );
        let minLossDouble = customer.noLotLossDouble;
        let chosenLotIndexDouble = -1;
        for (let j = 0; j < openLots.length; j++) {
          if (availability[j] === 1 && openLots[j].double) {
            lossDouble[j] = customer.lotsLossDouble[j] + prices[Round][j];
            if (lossDouble[j] < minLossDouble) {
              // customersRealizations[Round][i][0] = 1;
              // customersRealizations[Round][i][1] = 1;
              minLossDouble = lossDouble[j];
              chosenLotIndexDouble = j;
            }
          }
        }
        //compare the total Loss between picking two lots and picking one double lot
        if (totalLoss < minLossDouble) {
          if (chosenLotIndex !== -1) {
            availability[chosenLotIndex] = 0;
            totalSales[Round] += prices[Round][chosenLotIndex];
            roundChoices[i][0] = chosenLotIndex; // Record the customer's choice
            customersRealizations[Round][i][0] = 1;
          }
          if (chosenLotIndexSecond !== -1) {
            availability[chosenLotIndexSecond] = 0;
            totalSales[Round] += prices[Round][chosenLotIndexSecond];
            roundChoices[i][1] = chosenLotIndexSecond; // Record the customer's choice
            customersRealizations[Round][i][1] = 1;
          }
        } else {
          if (chosenLotIndexDouble !== -1) {
            availability[chosenLotIndexDouble] = 0;
            totalSales[Round] += prices[Round][chosenLotIndexDouble];
            roundChoices[i][0] = chosenLotIndexDouble; // Record the customer's choice
            roundChoices[i][1] = chosenLotIndexDouble; // Record the customer's choice
            customersRealizations[Round][i][0] = 1;
            customersRealizations[Round][i][1] = 1;
          }
        }
      }
    }

    customerLotChoices.push(roundChoices); // Add the choices for this round to the global array

    //percentage availability
    let percentage = 0;
    for (let i = 0; i < availability.length; i++) {
      if (availability[i] === 0) {
        percentage++;
      }
    }
    percentage = percentage / availability.length;

    prices.push(prices[Round].slice());
    realizations.push(availability.slice());
    // console.log('Round: ', Round, 'total sales: ', totalSales[Round]);
    // console.log('prices: ', prices[Round], 'realizations: ', realizations[Round]);

    Round++;

    for (let i = 0; i < openLots.length; i++) {
      if (availability[i] === 1) {
        prices[Round][i] -= 500;
      }
    }
  }
  percentages = calculatePercentage();

  for (let i = 0; i < prices.length; i++) {
    if (totalSales[i] > maxSales && percentages[i] > percentageBar) {
      maxSales = totalSales[i];
      maxSalesIndex = i;
    }
  }
  //put realized customers into customersUsed,remove from customers
  customersUsed = [];
  // console.log("info check:", customersRealizations);
  for (let i = 0; i < customersRealizations[maxSalesIndex].length; i++) {
    if (customersRealizations[maxSalesIndex][i] === 1) {
      let originalCustomerIndex = findOriginalCustomerIndex(customersLeft[i]);
      if (originalCustomerIndex !== -1) {
        customersUsed.push(customers[originalCustomerIndex]);
      }
      // customersUsed.push(customers[i]);
    }
  }
  //remove realized customers from customersLeft,reverse order
  for (let i = customersRealizations[maxSalesIndex].length - 1; i >= 0; i--) {
    if (customersRealizations[maxSalesIndex][i] === 1) {
      customersLeft.splice(i, 1);
    }
  }

  //put the sold lots into soldLots
  for (let i = 0; i < realizations[maxSalesIndex].length; i++) {
    if (realizations[maxSalesIndex][i] === 0) {
      soldLots.push(openLots[i]);
    }
  }
  //remove sold lots from openLots, reversed order
  for (let i = realizations[maxSalesIndex].length - 1; i >= 0; i--) {
    if (realizations[maxSalesIndex][i] === 0) {
      openLots.splice(i, 1);
    }
  }
  drawParkingLotsAndPrices();
  console.log("maxSalesIndex: ", maxSalesIndex, "maxSales: ", maxSales);

  console.log(prices[maxSalesIndex]);
  console.log(realizations[maxSalesIndex]);
  console.log(round(percentages[maxSalesIndex] * 100), "%");
  console.log("Max Sales: ", totalSales[maxSalesIndex]);

  //print results on the canvas: total lot number, total customer number, realization percentage, total sales, average price
  printOutput(basement1.textLayer);
  //export the final statistics 总车位数, 总户数, 总售出车位数, 车位售出率, 总销售额, 单车位实现价格 to a csv file, using p5.js table
  saveTableFile();
  // drawCustomerLotLines(maxSalesIndex);
  // saveTable(table, "results.csv");
}

function findOriginalCustomerIndex(customer) {
  // Iterate over the original 'customers' array to find a match
  for (let i = 0; i < customers.length; i++) {
    if (customers[i] === customer) {
      return i;
    }
  }
  return -1; // Return -1 if no match is found
}

function drawParkingLotsAndPrices() {
  // Clear existing drawings on textLayers
  basement1.textLayer.clear();
  basement2.textLayer.clear();

  const lowestPrice = min(prices[maxSalesIndex]);
  const highestPrice = max(prices[maxSalesIndex]);
  const lowestColor = color(50, 0, 0);
  const highestColor = color(255, 0, 0);
  const lerpHigh = lowestPrice + 0.7 * (highestPrice - lowestPrice);
  const lerpLow = lowestPrice + 0.2 * (highestPrice - lowestPrice);

  combinedEnds.forEach((lot, i) => {
    // Select the correct textLayer based on the basement identifier
    let targetLayer =
      lot.basement === 1 ? basement1.textLayer : basement2.textLayer;

    // Adjust positions without needing translation since drawing directly on the respective layer
    let x = lot.x * pixelMultiplier;
    let y = lot.y * pixelMultiplier;

    // Set drawing styles for the targetLayer
    // targetLayer.fill(
    //   (prices[maxSalesIndex][i] * 10) / 10000,
    //   255 - (prices[maxSalesIndex][i] * 10) / 10000,
    //   255
    // );

    targetLayer.strokeWeight(0.5);
    targetLayer.stroke(255, 100);
    targetLayer.rectMode(CENTER);

    targetLayer.push();
    targetLayer.translate(lot.x * pixelMultiplier, lot.y * pixelMultiplier);
    targetLayer.rotate(lot.angle);

    targetLayer.fill(
      lerpColor(
        lowestColor,
        highestColor,
        (prices[maxSalesIndex][i] - lerpLow) / (lerpHigh - lerpLow)
      )
    );
    targetLayer.rect(
      0,
      0,
      (lot.xSize + 2) * pixelMultiplier,
      5 * pixelMultiplier
    );

    // Restore the original drawing context
    targetLayer.pop();

    // Draw the circle for sold lots
    if (realizations[maxSalesIndex][i] === 0) {
      // targetLayer.fill(100, 100, 100);
      targetLayer.noFill();
      // targetLayer.noStroke();
      targetLayer.stroke(255, 100);
      targetLayer.strokeWeight(2);
      targetLayer.circle(x, y, 2.5 * pixelMultiplier * 2);
    }

    // Draw the price text
    targetLayer.fill(255);
    targetLayer.noStroke();
    targetLayer.textSize(pixelMultiplier * 2);
    targetLayer.textAlign(CENTER, CENTER);
    targetLayer.text(round(prices[maxSalesIndex][i] / 10000, 1), x, y);
    targetLayer.noStroke();

    if (lot.small) targetLayer.fill(80, 80, 255);
    if (lot.double) targetLayer.fill(0, 160, 255);
    if (lot.narrowColorPoint) targetLayer.fill(160, 0, 255);
    if (lot.deadEndPoint) targetLayer.fill(255, 0, 255);
    if (lot.advantagedColorPoint) targetLayer.fill(100, 0, 255);
    if (lot.disadvantagedColorPoint) targetLayer.fill(200, 0, 255);
    if (lot.housedColorPoint) targetLayer.fill(100, 199, 255);
    if (
      !lot.small &&
      !lot.narrowColorPoint &&
      !lot.deadEndPoint &&
      !lot.advantagedColorPoint &&
      !lot.disadvantagedColorPoint &&
      !lot.housedColorPoint &&
      !lot.double
    ) {
      targetLayer.fill(0, 0, 255);
    }
    targetLayer.rect(x, y + 8, 2 * pixelMultiplier, 2 * pixelMultiplier);
  });

  // a13DrawStartsNumber(basement1.textLayer);
  DrawStartsNumber(basement1.textLayer, panjin);
  // a6DrawStartsNumber(basement1.textLayer);
  // After drawing, make sure to render these layers in the main draw loop to see the changes

  // save all the lots, save the x, y, price, basement of each lot as a csv file
  function arrayToCSV(data) {
    const csvRows = [];
    const headers = ["x", "y", "price", "basement"];
    csvRows.push(headers.join(","));

    data.forEach((lot) => {
      const row = [lot.x, lot.y, lot.price, lot.basement];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }

  // Function to trigger download of CSV file
  function downloadCSV(csvData) {
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "parking_lot_data.csv");
    a.click();
  }

  // Collect lot data and download as CSV
  const lotData = combinedEnds.map((lot, i) => ({
    x: lot.x * 500,
    y: lot.y * 500,
    price: prices[maxSalesIndex][i],
    basement: lot.basement,
  }));

  const csvData = arrayToCSV(lotData);
  downloadCSV(csvData);
}
