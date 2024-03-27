class Basement {
  constructor(series) {
    this.series = series;
    this.img = null;
    this.translate = { x: 0, y: 0 };
    this.grid = [];
    this.starts = []; // Cores
    this.coreClasses = [];
    this.detachedStarts = [];
    this.coreHouseholdNumbers = [];
    this.transfers = [];
    this.ends = []; // Parking lots
    this.exits = [];
    this.exitClasses = [];
    this.controlledLots = [];
    this.openLots = [];
    this.soldLots = [];
    this.clustersBlue = [];
    this.clustersRed = [];
    this.clustersYellow = [];
    this.clustersGreen = [];
    this.clustersCyan = [];
  }
}
let basement1 = new Basement(1);
let basement2 = new Basement(2);

//mouse events
let x1, y1, x2, y2;
let selection = false;
let confirmed = false;
let pixelMultiplier = 3;
let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let startDragX = 0;
let startDragY = 0;
let dragging = false;

function setup() {
  // Create a canvas and attach it to the 'canvasContainer' div
  let canvas = createCanvas(2000 * pixelMultiplier, 1000 * pixelMultiplier); // Start with a default size
  canvas.parent("canvasContainer");
  background(220); // Set a default background
  cursor("zoom-in");
  // Set up file input listeners
  document
    .getElementById("basement1Input")
    .addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        let file = e.target.files[0];
        loadImage(URL.createObjectURL(file), function (loadedImg) {
          basement1.img = loadedImg;
          processImage(basement1, basement1.img);
        });
      }
    });
  document
    .getElementById("basement2Input")
    .addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        let file = e.target.files[0];
        loadImage(URL.createObjectURL(file), function (loadedImg) {
          basement2.img = loadedImg;
          processImage(basement2, basement2.img);
        });
      }
    });

  // Event listener for the percentageBarInput
  const percentageBarInput = document.getElementById("percentageBarInput");
  percentageBarInput.addEventListener("input", function () {
    percentageBar = this.value;
  });

  document.addEventListener("DOMContentLoaded", function () {
    const resetButton = document.getElementById("resetButton");

    resetButton.addEventListener("click", function () {
      resetSalesControl();
    });
  });
}

function processImage(basement, img) {
  console.log("processImage", basement, img);
  makeGrid(basement, img);
}

function draw() {
  // Clear the background every frame
  clear();
  background(220);

  // Display the images if they are loaded

  translate(width / 2, height / 2); // Center the zoom effect
  scale(zoom);
  translate(-width / 2 + offsetX, -height / 2 + offsetY);

  if (basement1.img) {
    image(basement1.img, 0, 0);
  }
  if (basement2.img) {
    // Adjust the position of the second image
    let offsetX = basement1.img ? basement1.img.width : 0;
    image(basement2.img, offsetX, 0);
  }
}

function handleFileInput(event, callback) {
  if (event.target.files && event.target.files[0]) {
    let file = event.target.files[0];
    loadImage(URL.createObjectURL(file), callback);
  }
}

function run() {
  cleanDOM(); //destroy the inputs and select doms in the html, but keep the fileInput dom
  createCanvas(img.width * pixelMultiplier, img.height * pixelMultiplier);
  textLayer = createGraphics(
    img.width * pixelMultiplier,
    img.height * pixelMultiplier
  );

  background(200);
  noStroke();

  console.log("sizes:", width, "px *", height, "px"); //show the sizes of the image
  //makeGrid() returns a 2d array of tile objects, black tiles are walls, white tiles are walkable, red tiles are start point, blue tiles are end points yellow tiles are detached start points, green tiles are transfer points, cyan tiles are exit points of the complex
  grid = makeGrid(); //color detection

  clustersBlue = []; //parking lots
  clustersRed = []; //elevators in basement
  clustersYellow = []; //detached elevators
  clustersGreen = []; //transfer elevators
  clustersCyan = []; //exits

  // Define point types and corresponding actions in a configuration object
  const pointTypes = [
    { color: "bluePoint", clusterArray: clustersBlue },
    { color: "redPoint", clusterArray: clustersRed },
    { color: "yellowPoint", clusterArray: clustersYellow },
    { color: "greenPoint", clusterArray: clustersGreen },
    { color: "cyanPoint", clusterArray: clustersCyan },
  ];

  // Process each tile once, checking against all point types
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const tile = grid[i][j];

      // Check the tile against each point type
      pointTypes.forEach((type) => {
        if (tile[type.color]) {
          tile.walkable = true;
          tile[type.color] = false; // Disable the flag to avoid reprocessing
          const cluster = [tile];
          findCluster(grid, tile, cluster, type.color);
          type.clusterArray.push(cluster);
        }
      });
    }
  }

  //show the number of each cluster

  console.log("Parking Lot Nr: ", clustersBlue.length);
  console.log("Elevator Nr: ", clustersRed.length);
  console.log("Detached Elevator Nr: ", clustersYellow.length);
  console.log("Transfer Elevator Nr: ", clustersGreen.length);
  console.log("Exits Nr: ", clustersCyan.length);
  //define objects
  ends = [];
  starts = [];
  detachedStarts = [];
  transfers = [];
  exits = [];
  //find the clusterCenter of each cluster of blue points and make it a end point
  for (let i = 0; i < clustersBlue.length; i++) {
    const cluster = clustersBlue[i];
    const clusterCenter = findClusterCenter(cluster);
    const endPoint = grid[clusterCenter.x][clusterCenter.y];
    endPoint.end = true;
    ends.push(endPoint);
    endPoint.horizontal = findClusterSize(cluster).horizontal; //horizontal or not is for parking lot diretion
  }
  //duplicate ends to openLots array
  openLots = ends.slice();

  processClusters(clustersRed, starts, (point) => (point.start = true));
  processClusters(
    clustersYellow,
    detachedStarts,
    (point) => (point.detachedStart = true)
  );
  processClusters(clustersGreen, transfers, (point) => (point.transfer = true));
  processClusters(clustersCyan, exits, (point) => (point.exit = true));

  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    for (let j = 0; j < ends.length; j++) {
      const end = ends[j];
      // const path = findPathJPS(grid, start, end);
      const dist = simpleManhattanDistance(start, end);
      start.dists.push(dist);
    }
  }
  //find the manhattan dists from each detached starts to transfer points
  for (let i = 0; i < detachedStarts.length; i++) {
    detachedStarts[i].distsToTransfer = [];
    const detachedStart = detachedStarts[i];
    for (let j = 0; j < transfers.length; j++) {
      const transfer = transfers[j];
      const distToTransfer = simpleManhattanDistance(detachedStart, transfer);
      detachedStart.distsToTransfer.push(distToTransfer);
    }
  }
  //find the manhattan dists from each transfer points to ends
  for (let i = 0; i < transfers.length; i++) {
    const transfer = transfers[i];
    for (let j = 0; j < ends.length; j++) {
      const end = ends[j];
      const dist = simpleManhattanDistance(transfer, end);
      transfer.dists.push(dist);
    }
  }
  //detached starts' dists to ends is the minimum of dists to transfer points + dists from transfer points to ends, find the minimum and push it to the dists
  for (let i = 0; i < detachedStarts.length; i++) {
    const detachedStart = detachedStarts[i];
    detachedStart.dists = [];
    for (let j = 0; j < ends.length; j++) {
      const end = ends[j];
      let minDist = 100000;
      for (let k = 0; k < transfers.length; k++) {
        const transfer = transfers[k];
        const dist = detachedStart.distsToTransfer[k] + transfer.dists[j];
        if (dist < minDist) {
          minDist = dist;
        }
      }
      detachedStart.dists.push(minDist);
    }
  }

  //put all detached starts into the starts array, so all starts are in the same array
  for (let i = 0; i < detachedStarts.length; i++) {
    const detachedStart = detachedStarts[i];
    starts.push(detachedStart);
  }

  //calculate all manhattan dists from all starts to all exits, and push them to a new distsToExits array
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    start.distsToExits = [];
    for (let j = 0; j < exits.length; j++) {
      const exit = exits[j];
      const dist = simpleManhattanDistance(start, exit);
      start.distsToExits.push(dist);
    }
  }

  listOfExits = [
    "易得 easy", // 5 mins
    "中等 moderate", // 10 mins
    "困难 difficult", // 15 mins
  ];
  //add selection doms to the exit points in the canvas
  for (let i = 0; i < exits.length; i++) {
    const exit = exits[i];
    exit.metersLoss = 800;
    exitClasses[i] = 1; //default is moderate
    const select = createSelect();
    select.position(exit.x * pixelMultiplier, exit.y * pixelMultiplier + 60);
    select.option("易得 easy");
    select.option("中等 moderate");
    select.option("困难 difficult");
    select
      .style("font-size", "10px")
      .style("background-color", "transparent")
      .style("border", "none")
      .style("outline", "none")
      .style("color", "#cccccc")
      .value("中等 moderate");
    select.changed(mySelectEvent);
    // select.style('color', 'transparent');
    select.style("text-shadow", "2px 2px 0px black");
    // define the core class based on the selection

    function mySelectEvent() {
      exitClasses[i] = listOfExits.indexOf(select.value());
      exit.metersLoss = 80 * 5 * (1 + exitClasses[i]);
      //put text of the selection on the canvas near the exit point
    }
  }

  listOfCustomers = [
    "刚需 surviving",
    "首置 modest",
    "首改 comfortable",
    "再改 affluent",
    "高改 wealthy",
  ];
  //add selection doms to the start points in the canvas
  coreClasses = [];

  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const select = createSelect();
    select.position(start.x * pixelMultiplier, start.y * pixelMultiplier + 60);
    select.option("刚需 surviving");
    select.option("首置 modest");
    select.option("首改 comfortable");
    select.option("再改 affluent");
    select.option("高改 wealthy");
    select.style("font-size", "10px");
    select.style("background-color", "transparent");
    select.style("border", "none");
    select.style("outline", "none");
    select.style("color", "#cccccc");
    select.value("首改 comfortable"); //default is modest
    coreClasses[i] = 2; //this index follows the default value
    select.changed(mySelectEvent);

    //make the dom very small
    select.size(AUTO, AUTO);

    // select.style('color', 'transparent');
    select.style("text-shadow", "1px 1px 0px black");
    // define the core class based on the selection

    function mySelectEvent() {
      coreClasses[i] = listOfCustomers.indexOf(select.value());
      //put text of the selection on the canvas near start point
    }
  }

  //add number input doms to the start points in the canvas
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const input = createInput();
    input.position(
      start.x * pixelMultiplier - 10,
      start.y * pixelMultiplier + 75
    );
    input.size(15, 10);
    input.style("font-size", "10px");
    input.style("color", "black");
    input.style("background-color", "#ee6666");
    input.value(36);
    //add shadow to input cell not text
    coreHouseholdNumbers[i] = 36; //customized for Tsingtao
    input.input(myInputEvent);
    function myInputEvent() {
      coreHouseholdNumbers[i] = input.value();
    }
  }

  // const salesControlButton = createButton("请选择销控车位 sales control, ");
  // salesControlButton.position(img.width + 10, 10);
  // salesControlButton.mousePressed(salesControl);

  // //add a button to confirm the selection
  // const confirmButton = createButton("确认销控范围 confirm");
  // confirmButton.position(img.width + 10, 40);
  // confirmButton.mousePressed(confirmControlledLots);
}

function makeGrid(basement, img) {
  console.log("makeGrid", basement, img);
  basement.grid = [];
  for (let i = 0; i < img.width; i++) {
    basement.grid[i] = [];
    for (let j = 0; j < img.height; j++) {
      let c = img.get(i, j); // Get color of each pixel

      // Determine cell properties based on color
      const cellProps = determineCellProps(c);

      // Create grid cell with determined properties
      basement.grid[i].push({
        x: i,
        y: j,
        ...cellProps,
        dists: [], // Assuming dists is always an empty array initially
      });

      push();
      translate(
        basement.translate.x * pixelMultiplier,
        basement.translate.y * pixelMultiplier
      );
      // Draw the cell
      fill(cellProps.color);
      rect(
        i * pixelMultiplier,
        j * pixelMultiplier,
        pixelMultiplier,
        pixelMultiplier
      );

      pop();
    }
  }
  // Store the current canvas
  basement.img = get(0, 0, width, height);
}

function determineCellProps(color) {
  const [r, g, b] = color;
  const baseProps = {
    walkable: true,
    bluePoint: false,
    redPoint: false,
    yellowPoint: false,
    greenPoint: false,
    cyanPoint: false,
    color: [150, 150, 150], // Default color (grey)
  };

  if (r < 100 && g < 100 && b < 100) {
    return { ...baseProps, walkable: false, color: [0, 0, 0] }; // Black
  } else if (r - g > 100 && r - b > 100) {
    return {
      ...baseProps,
      redPoint: true,
      color: [255, 0, 0],
      level: round(g / 25),
    }; // Red
  } else if (r < 100 && g < 100 && b > 200) {
    return { ...baseProps, bluePoint: true, color: [0, 0, 255] }; // Blue
  } else if (r > 200 && g > 200 && b < 50) {
    return { ...baseProps, yellowPoint: true, color: [255, 255, 0] }; // Yellow
  } else if (r < 50 && g > 200 && b < 50) {
    return { ...baseProps, greenPoint: true, color: [0, 255, 0] }; // Green
  } else if (r < 50 && g > 200 && b > 200) {
    return { ...baseProps, cyanPoint: true, color: [0, 255, 255] }; // Cyan
  }

  return baseProps; // Default properties for other colors
}

function findCluster(grid, tile, cluster, color) {
  const neighbors = getNeighbors(grid, tile);
  for (let i = 0; i < neighbors.length; i++) {
    const neighbor = neighbors[i];
    if (neighbor[color]) {
      neighbor.walkable = true;
      neighbor[color] = false;
      cluster.push(neighbor);
      findCluster(grid, neighbor, cluster, color);
    }
  }
}

//calculate the average expands of the clusters in x and y directions
//NOT YET USED
function findClusterSize(cluster) {
  let xMin = 100000;
  let xMax = 0;
  let yMin = 100000;
  let yMax = 0;
  for (let i = 0; i < cluster.length; i++) {
    const tile = cluster[i];
    if (tile.x < xMin) {
      xMin = tile.x;
    }
    if (tile.x > xMax) {
      xMax = tile.x;
    }
    if (tile.y < yMin) {
      yMin = tile.y;
    }
    if (tile.y > yMax) {
      yMax = tile.y;
    }
  }
  const xSize = xMax - xMin;
  const ySize = yMax - yMin;
  //longer side is x, shorter side is y
  if (xSize > ySize) {
    return { xSize, ySize, horizontal: true };
  } else {
    return { xSize: ySize, ySize: xSize, horizontal: false };
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

function simpleManhattanDistance(start, end) {
  const d = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
  return d;
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

//draw all the doms' value on the textLayer at the doms' position

function startSelection() {
  selection = true;
  confirmed = false;
}

function confirmSelection() {
  if (selection) {
    confirmed = true;
    selection = false;
  }
}

// function mousePressed() {
//   if (selection) {
//     x1 = mouseX;
//     y1 = mouseY;
//   }
// }

// function mouseDragged() {
//   if (selection) {
//     x2 = mouseX;
//     y2 = mouseY;
//   }
// }

// function mouseReleased() {
//   if (selection) {
//     x2 = mouseX;
//     y2 = mouseY;
//     pushControlledLots();
//   }
// }

function mouseWheel(event) {
  // Zoom in or out
  let zoomIntensity = 2;
  zoom += event.delta * -0.001 * zoomIntensity;
  zoom = constrain(zoom, 0.5, 5); // Limit zoom to prevent inversion or excessive zoom
  return false; // Prevent default behavior
}

function mousePressed() {
  // Start dragging
  startDragX = mouseX - offsetX;
  startDragY = mouseY - offsetY;
  dragging = true;
  cursor(MOVE);
}

function mouseDragged() {
  if (dragging) {
    // Update offset based on drag
    offsetX = mouseX - startDragX;
    offsetY = mouseY - startDragY;
  }
}

function mouseReleased() {
  // Stop dragging
  dragging = false;
  cursor("zoom-in");
}

function confirmControlledLots() {
  confirmed = true;
  selection = false;
  salesControlActive = true;
}

function salesControl() {
  console.log("salesControl");
  selection = true;
  confirmed = false;
}

function pushControlledLots() {
  let pushed = 0;
  for (let i = 0; i < openLots.length; i++) {
    const end = openLots[i];
    if (
      end.x * pixelMultiplier > x1 &&
      end.x * pixelMultiplier < x2 &&
      end.y * pixelMultiplier > y1 &&
      end.y * pixelMultiplier < y2
    ) {
      end.controlled = true;
      //move end to controlledLots Array and remove it from ends Array
      controlledLots.push(end);
      removeFromArray(openLots, end);
      pushed++;
      //draw the pushed lots in light grey
      fill(220);
      noStroke();
      rectMode(CENTER);
      rect(
        end.x * pixelMultiplier,
        end.y * pixelMultiplier,
        end.horizontal * 2.5 * pixelMultiplier + 2.5 * pixelMultiplier,
        -end.horizontal * 2.5 * pixelMultiplier + 5 * pixelMultiplier
      );
    }
  }
  console.log(pushed, "pushed: ");
}

function resetSalesControl() {
  salesControlActive = false;
  customersLeft = customers.slice();
  customersUsed = [];
  openLots = ends.slice();
  //put controlledLots back to ends
  for (let i = 0; i < controlledLots.length; i++) {
    const controlledLot = controlledLots[i];
    openLots.push(controlledLot);
  }
  controlledLots = [];
  image(img, 0, 0);
}

function openControlledLots() {}

function processClusters(clusters, targetArray, propertySetter) {
  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    const clusterCenter = findClusterCenter(cluster);
    const point = grid[clusterCenter.x][clusterCenter.y];
    propertySetter(point); // Apply the passed function to set additional properties
    targetArray.push(point);
  }
}
