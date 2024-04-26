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
        targetLayer.stroke(50); // Color for the line
        targetLayer.strokeWeight(0.5); // Line thickness
        targetLayer.noFill();

        if (
          (customer.firstCarMini && j === 0) ||
          (customer.secondCarMini && j === 1)
        ) {
          targetLayer.stroke(255, 200, 200);
        }

        if (customer.doubleAcceptance) {
          targetLayer.stroke(200, 255, 200);
        }

        // Draw the dashed line on the targetLayer
        dashLine(targetLayer, startX, startY, endX, endY);
      }
    }
  }
  incomePyramid();
}

function incomePyramid() {
  //draw a customer income pyramid diagram on targetLayer
  let targetLayer = basement1.customerLinesLayer;
  targetLayer.push();
  targetLayer.translate(0, 500);
  for (let i = 100000; i < 800000; i += 10000) {
    let count = 0;
    for (let j = 0; j < customers.length; j++) {
      if (customers[j].income >= i && customers[j].income < i + 10000) {
        count++;
      }
    }

    targetLayer.stroke(200, 200, 0);
    targetLayer.strokeWeight(5);
    if (count > 0) {
      targetLayer.line(100, 100 + i / 500, 100 + count * 10, 100 + i / 500);
    }
    targetLayer.noStroke();
    targetLayer.fill(0);
    targetLayer.text(
      "收入 " + round(i / 10000) + "万:   " + count + " 组",
      10,
      100 + i / 500
    );
  }
  targetLayer.pop();
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

//draw a key legend for lot markers
function drawLegend() {
  let legend = createGraphics(width, height);

  legend.noStroke();

  legend.fill(255);
  legend.textSize(5 * pixelMultiplier);
  legend.text("图例", 60, 40);
  legend.textSize(3 * pixelMultiplier);

  legend.text("常规车位", 60, 80);
  legend.text("子母车位", 60, 110);
  legend.text("微型车位", 60, 140);
  legend.text("难操作车位", 60, 170);

  legend.text("高价格", 60, 210);
  legend.text("低价格", 60, 300);

  legend.fill(0, 0, 255); //常规车位 regular
  legend.rect(30, 70, 20, 20);

  legend.fill(0, 160, 255); //子母车位 double
  legend.rect(30, 100, 20, 20);
  legend.fill(80, 80, 255); //微型车位 small
  legend.rect(30, 130, 20, 20);
  legend.fill(160, 0, 255); //难操作车位 narrow
  legend.rect(30, 160, 20, 20);

  const lowestColor = color(50, 0, 0);
  const highestColor = color(255, 0, 0);
  for (let y = 200; y < 300; y++) {
    // Interpolate between colorA and colorB
    let inter = map(y, 200, 300, 0, 1);
    let c = lerpColor(highestColor, lowestColor, inter);
    legend.stroke(c);
    legend.line(30, y, 50, y);
  }

  return legend;
}

function printOutput(textLayer) {
  textLayer.fill(255);
  textLayer.textAlign(LEFT, TOP);
  textStyle(BOLD);
  textLayer.push();
  textLayer.translate(10, 300);
  textLayer.textSize(5 * pixelMultiplier);
  let topMargin = 8 * pixelMultiplier;
  let leftMargin = 0 * pixelMultiplier;
  textLayer.text("模拟结果", 0, 40);
  textStyle(NORMAL);
  textLayer.textSize(3 * pixelMultiplier);
  textLayer.text(
    "总车位数 :  " + combinedEnds.length,
    leftMargin,
    11 * pixelMultiplier + topMargin
  );
  textLayer.text(
    "总户数 :  " + totalHouseholdNumber,
    leftMargin,
    15 * pixelMultiplier + topMargin
  );
  textLayer.text(
    "总售出车位数 :  " +
      (combinedEnds.length -
        realizations[maxSalesIndex].reduce((a, b) => a + b, 0)),
    leftMargin,
    19 * pixelMultiplier + topMargin
  );
  textLayer.text(
    "车位售出率 :  " + round(percentages[maxSalesIndex] * 100) + "%",
    leftMargin,
    23 * pixelMultiplier + topMargin
  );
  textLayer.text(
    "总销售额 :  " + round(totalSales[maxSalesIndex] / 10000) + "万元",
    leftMargin,
    27 * pixelMultiplier + topMargin
  );
  textLayer.text(
    "单车位实现价格 :  " +
      round(
        totalSales[maxSalesIndex] /
          (combinedEnds.length -
            realizations[maxSalesIndex].reduce((a, b) => a + b, 0)) /
          10000,
        1
      ) +
      "万元",
    leftMargin,
    31 * pixelMultiplier + topMargin
  );
  textLayer.text(
    "模拟客户总收入" + round(customersTotalIncome / 10000) + "万元",
    leftMargin,
    35 * pixelMultiplier + topMargin
  );
  // text ( '倍数' + round(customersTotalIncome/totalSales[maxSalesIndex], 3), leftMargin, 22 * pixelMultiplier)
  textLayer.text(
    "有需求客户总数" + customers.length,
    leftMargin,
    39 * pixelMultiplier + topMargin
  );
  textLayer.text(
    "出售比例要求下限 : " + percentageBar * 100 + "%",
    leftMargin,
    43 * pixelMultiplier + topMargin
  );
  textLayer.pop();
}

// function printOutput() {
//   console.log("模拟结果");
//   console.log("总车位数 : " + combinedEnds.length);
//   console.log("总户数 : " + householdNumbers);
//   console.log(
//     "总售出车位数 : " +
//       (combinedEnds.length -
//         realizations[maxSalesIndex].reduce((a, b) => a + b, 0))
//   );
//   console.log("车位售出率 : " + round(percentages[maxSalesIndex] * 100) + "%");
//   console.log(
//     "总销售额 : " + round(totalSales[maxSalesIndex] / 10000) + "万元"
//   );
//   console.log(
//     "单车位实现价格 : " +
//       round(
//         totalSales[maxSalesIndex] /
//           (combinedEnds.length -
//             realizations[maxSalesIndex].reduce((a, b) => a + b, 0)) /
//           10000,
//         1
//       ) +
//       "万元"
//   );
//   console.log("模拟客户总收入" + round(customersTotalIncome / 10000) + "万元");
//   // console.log('倍数' + round(customersTotalIncome/totalSales[maxSalesIndex], 3));
//   console.log("客户需求车位总数" + customers.length);
//   console.log("出售比例要求下限 : " + percentageBar * 100 + "%");
// }

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
  newRow.setNum("总户数 totalHouseholds", totalHouseholdNumber);
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
