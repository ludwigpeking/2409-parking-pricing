let customers = [];
let customersUsed = [];
let customersLeft = [];
let salesControlActive = false;
let customerLotChoices = []; // This will store customer-lot pairings for each round

let customersTotalIncome = 0;
// const remoteLotDist = 400; // in meters, Not in use
const baselineIncome = 60000; //CNY for surviving level
const guessHigh = 700000;
let householdNumbers;
let prices = []; // prices of each round
let realizations = []; // realizations of each round
let customersRealizations = []; // customers' realizations of each round
let percentageBar = 0; //minimum percentage of sold lots to be considered as a good round
let maxSales = 0;
let maxSalesIndex = -1;
let percentages = [];
let totalSales = [];

class Customer {
  constructor(core, level = 0) {
    this.meanIncome = 1.8 ** level * baselineIncome;
    this.income = normalRandom(this.meanIncome, 0.15 * this.meanIncome);
    this.carOwnership =
      0.12 /
      ((1.5 ** (log(this.income / baselineIncome) / log(2)) * 12000) /
        this.income);
    this.firstCar = false;
    this.secondCar = false;
    this.core = core;
    this.dists = this.core.dists;
    this.lotsLoss = [];
    this.meterValue = (this.income / 120000 / 80) * 600 * 12;
    for (let i = 0; i < ends.length; i++) {
      this.lotsLoss[i] = this.dists[i] * this.meterValue;
    }
    this.noLotLoss = core.maxMetersLoss * this.meterValue;
    //TODO the second noLotLoss should have a value related to wealth and frequency of car usage, with random distribution
    if (this.carOwnership > random()) {
      this.firstCar = true;
    }
    if (this.carOwnership > 1 + random()) {
      this.secondCar = true;
    }
  }
}

function startBuyingSimulation() {
  if (!salesControlActive) {
    createCustomers();
    customersLeft = customers.slice();
    textLayer.clear();
    image(img, 0, 0, width, height);
    bidding();
    //draw texts on textLayer
    drawDomsValue();
    //save image
    // saveCanvas("myCanvas", "jpg");
  } else {
    alert("The sales control is active!");
  }
}

function createCustomers() {
  //check exit.MinutesLoss plus start.distToExit minimum, the smallest sum is the final maxMinutesLoss, add to the start.maxMinutesLoss
  for (let i = 0; i < starts.length; i++) {
    let minMeterLoss = 2000;
    starts[i].maxMetersLoss = 2000;
    for (let j = 0; j < exits.length; j++) {
      if (
        starts[i].distsToExits[j] + exits[j].metersLoss + 120 <
        minMeterLoss
      ) {
        minMeterLoss = starts[i].distsToExits[j] + exits[j].metersLoss + 120;
      }
    }
    starts[i].maxMetersLoss = minMeterLoss;
  }
  customers = [];
  // create customers
  householdNumbers = 0;
  customersTotalIncome = 0;
  for (let i = 0; i < starts.length; i++) {
    for (let j = 0; j < coreHouseholdNumbers[i]; j++) {
      householdNumbers++;

      const customer = new Customer(starts[i], coreClasses[i]);
      customersTotalIncome += customer.income;
      if (customer.firstCar) {
        customers.push(customer);
      }
      if (customer.secondCar) {
        customers.push(customer);
      }
    }
  }
  //shuffle the customers
  shuffle(customers, true);
  console.log("cars: ", customers.length);
}

// function shuffle(array, inplace = false) {
//   if (!inplace) {
//     array = array.slice();
//   }
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = floor(random(i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
//   return array;
// }

function bidding() {
  //sale give price
  //resize the img to fit the canvas
  prices = [];
  let Round = 0;
  totalSales = [];
  percentages = [];
  prices.push(new Array(openLots.length).fill(guessHigh));
  maxSales = 0;
  maxSalesIndex = -1;
  realizations = []; //
  customersRealizations = [];
  customerLotChoices = []; // Reset for a new simulation run

  while (Round < 3000) {
    let roundChoices = {}; // Initialize an empty object for this round
    customersRealizations.push(new Array(customersLeft.length).fill(0));
    totalSales.push(0);
    let availability = new Array(openLots.length).fill(1);
    for (let i = 0; i < customersLeft.length; i++) {
      let customer = customersLeft[i];
      let loss = new Array(openLots.length).fill(customer.noLotLoss);
      let minLoss = customer.noLotLoss;
      let chosenLotIndex = -1; // Default to -1, indicating no lot chosen yet
      for (let j = 0; j < openLots.length; j++) {
        if (availability[j] === 1) {
          loss[j] = customer.lotsLoss[j] + prices[Round][j];
          if (loss[j] < minLoss) {
            customersRealizations[Round][i] = 1;
            minLoss = loss[j];
            chosenLotIndex = j;
          }
        }
      }
      if (chosenLotIndex !== -1) {
        availability[chosenLotIndex] = 0;
        totalSales[Round] += prices[Round][chosenLotIndex];
        roundChoices[i] = chosenLotIndex; // Record the customer's choice
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

  //put the sold lots into soldLots, remove from openLots
  for (let i = 0; i < realizations[maxSalesIndex].length; i++) {
    if (realizations[maxSalesIndex][i] === 0) {
      soldLots.push(openLots[i]);
    }
  }
  //remove sold lots from openLots, reverse order
  for (let i = realizations[maxSalesIndex].length - 1; i >= 0; i--) {
    if (realizations[maxSalesIndex][i] === 0) {
      openLots.splice(i, 1);
    }
  }

  // draw the results on the canvas with colors
  console.log("maxSalesIndex: ", maxSalesIndex, "maxSales: ", maxSales);
  for (let i = 0; i < ends.length; i++) {
    fill(
      (prices[maxSalesIndex][i] * 10) / 10000,
      255 - (prices[maxSalesIndex][i] * 10) / 10000,
      255
    );
    strokeWeight(0.5);
    stroke(255, 100);
    rectMode(CENTER);
    rect(
      ends[i].x * pixelMultiplier,
      ends[i].y * pixelMultiplier,
      ends[i].horizontal * 2.5 * pixelMultiplier + 2.5 * pixelMultiplier,
      -ends[i].horizontal * 2.5 * pixelMultiplier + 5 * pixelMultiplier
    );
    if (realizations[maxSalesIndex][i] === 0) {
      fill(255, 0, 0);
      noStroke();
      circle(
        ends[i].x * pixelMultiplier,
        ends[i].y * pixelMultiplier,
        2.5 * pixelMultiplier
      );
    }
  }

  for (let i = 0; i < ends.length; i++) {
    let x = ends[i].x;
    let y = ends[i].y;

    colorMode(RGB);
    fill(255);
    noStroke();
    textSize(pixelMultiplier);
    //center the text
    textAlign(CENTER, CENTER);
    text(
      round(prices[maxSalesIndex][i] / 10000, 1),
      x * pixelMultiplier,
      y * pixelMultiplier
    );
  }

  console.log(prices[maxSalesIndex]);
  console.log(realizations[maxSalesIndex]);
  console.log(round(percentages[maxSalesIndex] * 100), "%");
  console.log("Max Sales: ", totalSales[maxSalesIndex]);

  //store the current canvas
  // img = get(0, 0, width, height);
  //make the canvas larger as the bottom
  // resizeCanvas(width, height + 12 * pixelMultiplier);
  //draw the saved pixels on the canvas
  // image(img, 0, 0 )

  //print results on the canvas: total lot number, total customer number, realization percentage, total sales, average price
  printOutput();
  //export the final statistics 总车位数, 总户数, 总售出车位数, 车位售出率, 总销售额, 单车位实现价格 to a csv file, using p5.js table
  saveTableFile();
  drawCustomerLotLines(maxSalesIndex);
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
