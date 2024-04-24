function cleanDOM() {
  let inputs = document.getElementsByTagName("input");
  for (let i = inputs.length - 1; i >= 0; i--) {
    const input = inputs[i];
    if (input.type != "file") {
      input.remove();
    }
  }
  let selects = document.getElementsByTagName("select");
  for (let i = selects.length - 1; i >= 0; i--) {
    const select = selects[i];
    select.remove();
  }
  //destroy the button
  let buttons = document.getElementsByTagName("button");
  for (let i = buttons.length - 1; i >= 0; i--) {
    const button = buttons[i];
    button.remove();
  }
  //destroy the p dom
  let ps = document.getElementsByTagName("p");
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    p.remove();
  }
}

function drawDomsValue() {
  //shadow first for visibility
  textLayer.fill(0, 100);
  textLayer.noStroke();
  textLayer.textSize(pixelMultiplier * 2);
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    textLayer.text(
      listOfCustomers[coreClasses[i]],
      start.x * pixelMultiplier + 1,
      (start.y - 2) * pixelMultiplier + 1
    );
    textLayer.text(
      coreHouseholdNumbers[i] + "户",
      start.x * pixelMultiplier + 1,
      (start.y - 2) * pixelMultiplier + 3 * pixelMultiplier + 1
    );
  }
  for (let i = 0; i < exits.length; i++) {
    const exit = exits[i];
    textLayer.text(
      listOfExits[exitClasses[i]],
      exit.x * pixelMultiplier + 1,
      exit.y * pixelMultiplier + 1
    );
  }
  textLayer.fill(255);
  textLayer.noStroke();
  textLayer.textSize(pixelMultiplier * 2);
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    textLayer.text(
      listOfCustomers[coreClasses[i]],
      start.x * pixelMultiplier,
      (start.y - 2) * pixelMultiplier
    );
    textLayer.text(
      coreHouseholdNumbers[i] + "户",
      start.x * pixelMultiplier,
      (start.y - 2) * pixelMultiplier + 3 * pixelMultiplier
    );
  }
  for (let i = 0; i < exits.length; i++) {
    const exit = exits[i];
    textLayer.text(
      listOfExits[exitClasses[i]],
      exit.x * pixelMultiplier,
      exit.y * pixelMultiplier
    );
  }
  image(textLayer, 0, 0, width, height);
}

//calculate the percentage of sold lots in each round
function calculatePercentage() {
  let percentages = [];
  for (let i = 0; i < realizations.length; i++) {
    let sum = 0;
    for (let j = 0; j < realizations[i].length; j++) {
      sum += realizations[i][j];
    }
    percentages.push(1 - sum / realizations[i].length);
  }
  return percentages;
}

function normalRandom(mean, stdDev = mean * 0.2) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let rand = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  return Math.round(rand * stdDev + mean);
}

function drawCustomerLotLines(maxSalesIndex) {
  // console.log("Drawing customer-lot lines for maxSalesIndex: ", maxSalesIndex);
  let choices = customerLotChoices[maxSalesIndex];

  for (let i = 0; i < choices.length; i++) {
    for (let j = 0; j < choices[i].length; j++) {
      let lotIndex = choices[i][j];
      if (lotIndex != -1) {
        let lot = combinedEnds[lotIndex];
        let basement = lot.basement === 1 ? basement1 : basement2; // Determine the correct basement
        let customer = customers[i];
        let startX = customer.core.x * pixelMultiplier;
        let startY = customer.core.y * pixelMultiplier;
        let endX = lot.x * pixelMultiplier;
        let endY = lot.y * pixelMultiplier;

        // Select the correct textLayer for drawing
        let targetLayer = basement.customerLinesLayer;

        // Set drawing styles for targetLayer
        targetLayer.stroke(255); // Color for the line
        targetLayer.strokeWeight(0.5); // Line thickness
        targetLayer.noFill();

        if (
          (customer.firstCarMini && j === 0) ||
          (customer.secondCarMini && j === 1)
        ) {
          targetLayer.stroke(255, 0, 0);
        }

        if (customer.doubleAcceptance) {
          targetLayer.stroke(0, 255, 0);
        }

        // Draw the dashed line on the targetLayer
        dashLine(targetLayer, startX, startY, endX, endY);
      }
    }
  }

  //   Object.entries(choices).forEach(([customerIndex, lotIndex]) => {
  //     let customer = customers[customerIndex];
  //     let lot = combinedEnds[lotIndex];
  //     let basement = lot.basement === 1 ? basement1 : basement2; // Determine the correct basement

  //     let startX = customer.core.x * pixelMultiplier;
  //     let startY = customer.core.y * pixelMultiplier;
  //     let endX = lot.x * pixelMultiplier;
  //     let endY = lot.y * pixelMultiplier;

  //     // Select the correct textLayer for drawing
  //     let targetLayer = basement.customerLinesLayer;

  //     // Set drawing styles for targetLayer
  //     targetLayer.stroke(255, 20); // Color for the line
  //     targetLayer.strokeWeight(0.5); // Line thickness
  //     targetLayer.noFill();

  //     // Draw the dashed line on the targetLayer
  //     dashLine(targetLayer, startX, startY, endX, endY);

  //     // Draw a circle at the end on the targetLayer
  //     // targetLayer.circle(endX, endY, 2 * pixelMultiplier);

  //     // Draw text annotation on the targetLayer
  //     // targetLayer.fill(0);
  //     // targetLayer.text(customerIndex, endX, endY + 10);
  //   });
}

function drawGraph(basement) {
  // Ensure graph is defined
  if (!basement.graph) {
    console.log("Graph not initialized.");
    return;
  }

  // Draw each node and edges
  Object.values(basement.graph).forEach((nodeEntry) => {
    const node = nodeEntry.node;
    // fill(255, 0, 0); // Red color for node
    // ellipse(node.x * pixelMultiplier, node.y * pixelMultiplier, 1, 1);

    // Draw edges
    nodeEntry.edges.forEach((edge) => {
      const toNode = edge.to;
      noFill();
      stroke(0, 255, 0, 150); // Green color for edges
      strokeWeight(0.2);
      line(
        node.x * pixelMultiplier,
        node.y * pixelMultiplier,
        toNode.x * pixelMultiplier,
        toNode.y * pixelMultiplier
      );
    });
  });
}

// A simple implementation of dashLine function if not already defined
function dashLine(layer, x1, y1, x2, y2, len = 5, gap = 3) {
  let d = dist(x1, y1, x2, y2);
  let dashNum = d / (len + gap);
  let dx = (x2 - x1) / dashNum;
  let dy = (y2 - y1) / dashNum;

  for (let i = 0; i < dashNum; i++) {
    if (i % 2 === 0) {
      layer.line(
        x1 + dx * i,
        y1 + dy * i,
        x1 + dx * (i + 1),
        y1 + dy * (i + 1)
      );
    }
  }
}

// function printOutput() {
//   textLayer.fill(255, 220);
//   textLayer.noStroke();
//   textLayer.pixelDensity(2);
//   textLayer.rect(0, 0, width, 35 * pixelMultiplier);
//   textLayer.fill(0);
//   textLayer.textAlign(LEFT, TOP);
//   textStyle(BOLD);
//   textLayer.textSize(3 * pixelMultiplier);
//   let topMargin = 6 * pixelMultiplier;
//   let leftMargin = 2 * pixelMultiplier;
//   textLayer.text("模拟结果", 10, -4 * pixelMultiplier + topMargin);
//   textStyle(NORMAL);
//   textLayer.textSize(2 * pixelMultiplier);
//   textLayer.text(
//     "总车位数 :  " + ends.length,
//     leftMargin,
//     pixelMultiplier + topMargin
//   );
//   textLayer.text(
//     "总户数 :  " + householdNumbers,
//     leftMargin,
//     4 * pixelMultiplier + topMargin
//   );
//   textLayer.text(
//     "总售出车位数 :  " +
//       (ends.length - realizations[maxSalesIndex].reduce((a, b) => a + b, 0)),
//     leftMargin,
//     7 * pixelMultiplier + topMargin
//   );
//   textLayer.text(
//     "车位售出率 :  " + round(percentages[maxSalesIndex] * 100) + "%",
//     leftMargin,
//     10 * pixelMultiplier + topMargin
//   );
//   textLayer.text(
//     "总销售额 :  " + round(totalSales[maxSalesIndex] / 10000) + "万元",
//     leftMargin,
//     13 * pixelMultiplier + topMargin
//   );
//   textLayer.text(
//     "单车位实现价格 :  " +
//       round(
//         totalSales[maxSalesIndex] /
//           (ends.length -
//             realizations[maxSalesIndex].reduce((a, b) => a + b, 0)) /
//           10000,
//         1
//       ) +
//       "万元",
//     leftMargin,
//     16 * pixelMultiplier + topMargin
//   );
//   textLayer.text(
//     "模拟客户总收入" + round(customersTotalIncome / 10000) + "万元",
//     leftMargin,
//     19 * pixelMultiplier + topMargin
//   );
//   // text ( '倍数' + round(customersTotalIncome/totalSales[maxSalesIndex], 3), leftMargin, 22 * pixelMultiplier)
//   textLayer.text(
//     "客户需求车位总数" + customers.length,
//     leftMargin,
//     22 * pixelMultiplier + topMargin
//   );
//   textLayer.text(
//     "出售比例要求下限 : " + percentageBar * 100 + "%",
//     leftMargin,
//     25 * pixelMultiplier + topMargin
//   );
// }

function printOutput() {
  console.log("模拟结果");
  console.log("总车位数 : " + combinedEnds.length);
  console.log("总户数 : " + householdNumbers);
  console.log(
    "总售出车位数 : " +
      (combinedEnds.length -
        realizations[maxSalesIndex].reduce((a, b) => a + b, 0))
  );
  console.log("车位售出率 : " + round(percentages[maxSalesIndex] * 100) + "%");
  console.log(
    "总销售额 : " + round(totalSales[maxSalesIndex] / 10000) + "万元"
  );
  console.log(
    "单车位实现价格 : " +
      round(
        totalSales[maxSalesIndex] /
          (combinedEnds.length -
            realizations[maxSalesIndex].reduce((a, b) => a + b, 0)) /
          10000,
        1
      ) +
      "万元"
  );
  console.log("模拟客户总收入" + round(customersTotalIncome / 10000) + "万元");
  // console.log('倍数' + round(customersTotalIncome/totalSales[maxSalesIndex], 3));
  console.log("客户需求车位总数" + customers.length);
  console.log("出售比例要求下限 : " + percentageBar * 100 + "%");
}

function saveTableFile() {
  let table = new p5.Table();
  table.addColumn("总车位数 totalLots");
  table.addColumn("总户数 totalHouseholds");
  table.addColumn("总售出车位数 totalSoldLots");
  table.addColumn("车位售出率 realizationPercentage");
  table.addColumn("总销售额 totalSales");
  table.addColumn("单车位实现价格 averagePrice");

  let newRow = table.addRow();
  newRow.setNum("总车位数 totalLots", combinedEnds.length);
  newRow.setNum("总户数 totalHouseholds", householdNumbers);
  newRow.setNum(
    "总售出车位数 totalSoldLots",
    combinedEnds.length - realizations[maxSalesIndex].reduce((a, b) => a + b, 0)
  );
  newRow.setNum(
    "车位售出率 realizationPercentage",
    round(percentages[maxSalesIndex] * 100)
  );
  newRow.setNum(
    "总销售额 totalSales",
    round(totalSales[maxSalesIndex] / 10000)
  );
  newRow.setNum(
    "单车位实现价格 averagePrice",
    round(
      totalSales[maxSalesIndex] /
        (combinedEnds.length -
          realizations[maxSalesIndex].reduce((a, b) => a + b, 0)) /
        10000,
      1
    )
  );
}

//to iterate pathfinding , clean up the grid and reset the start and end points
function resetGridJPS(grid) {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      grid[i][j].f = 0;
      grid[i][j].g = 0;
      grid[i][j].h = 0;
      grid[i][j].previous = undefined;
    }
  }
}

function findClusterCenter(cluster) {
  let xSum = 0;
  let ySum = 0;
  for (let i = 0; i < cluster.length; i++) {
    const tile = cluster[i];
    xSum += tile.x;
    ySum += tile.y;
  }
  const x = Math.round(xSum / cluster.length);
  const y = Math.round(ySum / cluster.length);
  return { x: x, y: y };
}

function getNeighbors(grid, tile) {
  const neighbors = [];
  const x = tile.x;
  const y = tile.y;
  if (x > 0) {
    neighbors.push(grid[x - 1][y]);
  }
  if (x < grid.length - 1) {
    neighbors.push(grid[x + 1][y]);
  }
  if (y > 0) {
    neighbors.push(grid[x][y - 1]);
  }
  if (y < grid[0].length - 1) {
    neighbors.push(grid[x][y + 1]);
  }
  return neighbors;
}

function removeFromArray(arr, elt) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === elt) {
      arr.splice(i, 1);
    }
  }
}

function getPositionOfCanvas() {
  const canvasContainer = document.getElementById("canvasContainer");
  if (canvasContainer) {
    const rect = canvasContainer.getBoundingClientRect();
    console.log("Canvas Position - X: " + rect.left + ", Y: " + rect.top);
    // Now you have the x and y position of the canvas
    // You can use rect.top as the canvas's Y position
    return { x: rect.left, y: rect.top };
  }
  return null;
}
