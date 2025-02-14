let basement1 = new Basement(1);
let basement2 = new Basement(2);

let pixelMultiplier = 4;
//mouse events
let x1, y1, x2, y2; //mouse positions
let selection = false;
let confirmed = false;
let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let startDragX = 0;
let startDragY = 0;
let dragging = false;
//legend graphics
let legend;

const listOfCustomers = [
  "刚需 surviving",
  "首置 modest",
  "首改 comfortable",
  "再改 affluent",
  "高改 wealthy",
];

function setup() {
  // Create a canvas and attach it to the 'canvasContainer' div
  let canvas = createCanvas(2000 * pixelMultiplier, 800 * pixelMultiplier); // Start with a default size

  canvas.parent("canvasContainer"); //this is to get the canvas position
  background(220); // Set a default background
  legend = drawLegend();
  // cursor("zoom-in");
  // Set up file input listeners
  const defaultBasement1Image = "./inputs/V2.png"; // Replace with actual path or URL
  loadImage(defaultBasement1Image, function (loadedImg) {
    basement1.inputImage = loadedImg;
    processImage(basement1, basement1.inputImage);
    combineEnds(basement1, basement2);
    mergeCommonStarts(basement1, basement2);
    // Additional setup if needed
  });
  document
    .getElementById("basement1Input")
    .addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        basement1.clearDOMElements();
        basement1 = new Basement(1);
        let file = e.target.files[0];
        loadImage(URL.createObjectURL(file), function (loadedImg) {
          basement1.inputImage = loadedImg;
          processImage(basement1, basement1.inputImage);
          combineEnds(basement1, basement2);
          mergeCommonStarts(basement1, basement2);
          // a13Values(); // for A13 specific
          projectData(panjin);
        });
      }
    });
  document
    .getElementById("basement2Input")
    .addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        basement2.clearDOMElements();
        basement2 = new Basement(2);
        let file = e.target.files[0];
        loadImage(URL.createObjectURL(file), function (loadedImg) {
          basement2.inputImage = loadedImg;
          processImage(basement2, basement2.inputImage);
          combineEnds(basement1, basement2);
          mergeCommonStarts(basement1, basement2);
        });
      }
    });

  // Event listener for the percentageBarInput
  const percentageBarInput = document.getElementById("percentageBarInput");
  percentageBarInput.addEventListener("input", function () {
    percentageBar = this.value;
  });

  const occupancyRateInput = document.getElementById("occupancyRateInput");
  occupancyRateInput.addEventListener("input", function () {
    occupancyRate = this.value;
  });

  document.addEventListener("DOMContentLoaded", function () {
    const resetButton = document.getElementById("resetButton");

    resetButton.addEventListener("click", function () {
      resetSalesControl();
    });
  });
}

function draw() {
  // Clear the background every frame
  frameRate(1);
  clear();
  background(220);

  // Display the images if they are loaded

  if (basement1.img) {
    image(basement1.img, 0, 0);
  }
  if (basement1.textLayer) {
    image(basement1.textLayer, 0, 0); // Render basement1's textLayer
  }

  if (basement2.img) {
    // Adjust the position of the second image
    basement2.translate.x = basement1.inputImage
      ? basement1.inputImage.width
      : 0;
    image(basement2.img, basement2.translate.x * pixelMultiplier, 0);
  }
  if (basement2.textLayer) {
    image(basement2.textLayer, basement2.translate.x * pixelMultiplier, 0);
  }
  if (basement1.customerLinesLayer) {
    // drawCustomerLotLines(maxSalesIndex);
  }
  if (drawCustomerLotLineBool) {
    image(basement1.customerLinesLayer, 0, 0);
    if (basement2.customerLinesLayer) {
      image(
        basement2.customerLinesLayer,
        basement2.translate.x * pixelMultiplier,
        0
      );
    }
  }

  image(legend, 0, 0);
  //// to check graph nodes
  if (drawWalkNodesBool) {
    if (basement1.graph) drawGraph(basement1);
    if (basement2.graph) drawGraph(basement2);
  }
}

function processImage(basement, inputImage) {
  //
  console.log("processImage", "basement", basement.floor, inputImage);
  basement.grid = makeGrid(basement, inputImage);
  if (basement.floor === 2) {
    basement.translate.x = basement1.inputImage.width;
  }
  basement.clustersBlue = [];
  basement.clustersRed = [];
  basement.clustersYellow = [];
  basement.clustersGreen = [];
  basement.clustersCyan = [];
  basement.clustersOrange = [];
  const pointTypes = [
    {
      color: "bluePoint",
      clusterArray: basement.clustersBlue,
      propertySetter: (point) => (point.parking = true),
    },
    {
      color: "redPoint",
      clusterArray: basement.clustersRed,
      propertySetter: (point) => (point.core = true),
    },
    {
      color: "yellowPoint",
      clusterArray: basement.clustersYellow,
      propertySetter: (point) => (point.detachedCore = true),
    },
    {
      color: "greenPoint",
      clusterArray: basement.clustersGreen,
      propertySetter: (point) => (point.transfer = true),
    },
    {
      color: "cyanPoint",
      clusterArray: basement.clustersCyan,
      propertySetter: (point) => (point.exit = true),
    },
    {
      color: "orangePoint",
      clusterArray: basement.clustersOrange,
      propertySetter: (point) => (point.walkNode = true),
    },
  ];
  for (let i = 0; i < basement.grid.length; i++) {
    for (let j = 0; j < basement.grid[i].length; j++) {
      const tile = basement.grid[i][j];

      // Check the tile against each point type
      pointTypes.forEach((type) => {
        if (tile[type.color]) {
          tile.walkable = true;
          tile[type.color] = false; // Disable the flag to avoid reprocessing
          const cluster = [tile];
          findCluster(basement.grid, tile, cluster, type.color);
          type.clusterArray.push(cluster);
          type.propertySetter(tile); // Set additional properties based on cluster type
        }
      });
    }
  }
  console.log("Parking Lot Nr: ", basement.clustersBlue.length);
  console.log("Elevator Nr: ", basement.clustersRed.length);
  console.log("Detached Elevator Nr: ", basement.clustersYellow.length);
  console.log("Transfer Elevator Nr: ", basement.clustersGreen.length);
  console.log("Exits Nr: ", basement.clustersCyan.length);

  basement.ends = [];
  basement.starts = [];
  basement.detachedStarts = [];
  basement.transfers = [];
  basement.exits = [];
  basement.walkNodes = [];
  //TODO: classify the ends into normal parking lots (0,0,255), mini parking lots (50,0,255), double parking lots(0,50,255),
  for (let i = 0; i < basement.clustersBlue.length; i++) {
    const cluster = basement.clustersBlue[i];
    const clusterCenter = findClusterCenter(cluster);
    const endPoint = basement.grid[clusterCenter.x][clusterCenter.y];
    endPoint.end = true;
    endPoint.horizontal = findClusterSize(cluster).horizontal; //horizontal or not is for parking lot
    endPoint.angle = findClusterSize(cluster).angle;
    endPoint.xSize = findClusterSize(cluster).xSize;
    if (endPoint.xSize < 6) {
      endPoint.small = true;
    }
    if (endPoint.xSize > 13) {
      endPoint.double = true;
    }
    basement.ends.push(endPoint);
  }
  basement.openLots = basement.ends.slice();

  processClusters(
    basement,
    basement.clustersRed,
    basement.starts,
    (point) => (point.start = true)
  );
  processClusters(
    basement,

    basement.clustersYellow,
    basement.detachedStarts,
    (point) => (point.detachedStart = true)
  );
  processClusters(
    basement,

    basement.clustersGreen,
    basement.transfers,
    (point) => (point.transfer = true)
  );
  processClusters(
    basement,
    basement.clustersCyan,
    basement.exits,
    (point) => (point.exit = true)
  );
  processClusters(
    basement,
    basement.clustersOrange,
    basement.walkNodes,
    (point) => (point.walkNode = true)
  );

  initializePathfindingNodes(basement);

  for (let i = 0; i < basement.starts.length; i++) {
    const start = basement.starts[i];
    for (let j = 0; j < basement.ends.length; j++) {
      const end = basement.ends[j];
      // const dist = manhattanDistance(start, end);
      // console.log("start astar", i, j, start, end, basement.graph);
      const dist = aStarSearch(start, end, basement.graph, basement.img);
      // console.log("dist = ", dist, ", exit astar");
      start.dists.push(dist);
    }
  }
  //find the manhattan dists from each detached starts to transfer points
  for (let i = 0; i < basement.detachedStarts.length; i++) {
    basement.detachedStarts[i].distsToTransfer = [];
    const detachedStart = basement.detachedStarts[i];
    for (let j = 0; j < basement.transfers.length; j++) {
      const transfer = basement.transfers[j];
      const distToTransfer = manhattanDistance(detachedStart, transfer) + 120;
      detachedStart.distsToTransfer.push(distToTransfer);
    }
  }
  //find the manhattan dists from each transfer points to ends
  for (let i = 0; i < basement.transfers.length; i++) {
    const transfer = basement.transfers[i];
    for (let j = 0; j < basement.ends.length; j++) {
      const end = basement.ends[j];
      const dist = aStarSearch(transfer, end, basement.graph, basement.img);
      transfer.dists.push(dist);
    }
  }
  //detached starts' dists to ends is the minimum of dists to transfer points + dists from transfer points to ends, find the minimum and push it to the dists
  for (let i = 0; i < basement.detachedStarts.length; i++) {
    const detachedStart = basement.detachedStarts[i];
    detachedStart.dists = [];
    for (let j = 0; j < basement.ends.length; j++) {
      const end = basement.ends[j];
      let minDist = 100000;
      for (let k = 0; k < basement.transfers.length; k++) {
        const transfer = basement.transfers[k];
        const dist = detachedStart.distsToTransfer[k] + transfer.dists[j];
        if (dist < minDist) {
          minDist = dist;
        }
      }
      detachedStart.dists.push(minDist);
    }
  }
  //put all detached starts into the starts array, so all starts are in the same array
  for (let i = 0; i < basement.detachedStarts.length; i++) {
    const detachedStart = basement.detachedStarts[i];
    basement.starts.push(detachedStart);
  }
  //re-order the starts by x position, if they have same x position, order them by y position
  basement.starts.sort((a, b) => {
    if (a.x === b.x) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });
  //calculate all manhattan dists from all starts to all exits, and push them to a new distsToExits array
  for (let i = 0; i < basement.starts.length; i++) {
    const start = basement.starts[i];
    start.distsToExits = [];
    for (let j = 0; j < basement.exits.length; j++) {
      const exit = basement.exits[j];
      const dist = manhattanDistance(start, exit);
      start.distsToExits.push(dist);
    }
  }

  const canvasPosition = getPositionOfCanvas();
  //add selection doms to the exit points in the canvas
  const listOfExits = ["易得 easy", "中等 moderate", "困难 difficult"];

  for (let i = 0; i < basement.exits.length; i++) {
    const exit = basement.exits[i];
    exit.metersLoss = 800;
    basement.exitClasses[i] = 1; //default is moderate
    const select = createSelect();
    basement.domElements.push(select);
    select.id(`selectIdForBasement${basement.floor}Exit${i}`);

    const xTranslate = (exit.x + basement.translate.x) * pixelMultiplier;
    console.log("xTranslate", xTranslate);
    //adjust y position of the select dom, align with the canvas position
    select.position(xTranslate, exit.y * pixelMultiplier + canvasPosition.y);
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
      basement.exitClasses[i] = listOfExits.indexOf(select.value());
      //change the value in the other basement at the same time
      const otherBasement = basement.floor === 1 ? basement2 : basement1;
      otherBasement.exitClasses[i] = listOfExits.indexOf(select.value());

      exit.metersLoss = 80 * 5 * (1 + basement.exitClasses[i]);
      otherBasement.exits[i].metersLoss = exit.metersLoss;
      //put text of the selection on the canvas near the exit point
    }
  }

  //add selection doms to the start points in the canvas
  basement.coreClasses = [];

  for (let i = 0; i < basement.starts.length; i++) {
    const start = basement.starts[i];
    const select = createSelect();
    basement.domElements.push(select);
    select.id(`selectIdForBasement${basement.floor}Start${i}`);
    // console.log("start translate", start.x + basement.translate.x);
    select.position(
      (start.x + basement.translate.x) * pixelMultiplier,
      start.y * pixelMultiplier + canvasPosition.y
    );
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
    basement.coreClasses[i] = 2; //this index follows the default value
    select.changed(mySelectEvent);

    //make the dom very small
    select.size(AUTO, AUTO);

    // select.style('color', 'transparent');
    select.style("text-shadow", "1px 1px 0px black");
    // define the core class based on the selection

    function mySelectEvent() {
      basement.coreClasses[i] = listOfCustomers.indexOf(select.value());
      console.log(basement.coreClasses[i]);
      //put text of the selection on the canvas near start point
    }
  }

  //add number input doms to the start points in the canvas
  for (let i = 0; i < basement.starts.length; i++) {
    const start = basement.starts[i];
    const input = createInput();
    basement.domElements.push(input);
    input.id(`inputIdForBasement${basement.floor}Start${i}`);
    input.position(
      (start.x + basement.translate.x) * pixelMultiplier - 20,
      start.y * pixelMultiplier + canvasPosition.y
    );
    input.size(15, 10);
    input.style("font-size", "10px");
    input.style("color", "black");
    input.style("background-color", "#ee6666");
    input.value(36);
    //add shadow to input cell not text
    basement.coreHouseholdNumbers[i] = 36; //customized for Tsingtao
    input.input(myInputEvent);
    function myInputEvent() {
      basement.coreHouseholdNumbers[i] = input.value();
    }
  }
}

//make a start array to accommodate the starts from both basements without duplication, check their coordinates and make them the same if they are the very close (less than 2 pixels)
function checkSameStarts() {}

function handleFileInput(event, callback) {
  if (event.target.files && event.target.files[0]) {
    let file = event.target.files[0];
    loadImage(URL.createObjectURL(file), callback);
  }
}

function makeGrid(basement, inputImage) {
  console.log("makeGrid", basement, inputImage, inputImage.width);

  // Create an off-screen graphics buffer
  let offscreen = createGraphics(
    inputImage.width * pixelMultiplier,
    inputImage.height * pixelMultiplier
  );

  basement.grid = [];
  for (let i = 0; i < inputImage.width; i++) {
    basement.grid[i] = [];
    for (let j = 0; j < inputImage.height; j++) {
      let c = inputImage.get(i, j); // Get color of each pixel
      const cellProps = determineCellProps(c);

      basement.grid[i].push({
        x: i,
        y: j,
        ...cellProps,
        dists: [],
      });

      offscreen.noStroke();
      offscreen.fill(cellProps.color);
      offscreen.rect(
        i * pixelMultiplier,
        j * pixelMultiplier,
        pixelMultiplier,
        pixelMultiplier
      );
    }
  }
  basement.img = offscreen;
  return basement.grid;
}
function determineCellProps(color) {
  const [r, g, b] = color;
  const baseProps = {
    walkable: true,
    whitePoint: false, // open space
    bluePoint: false, // parking (<200,<200,255) basic blue indicator
    regularColorPoint: false, // regular parking
    advantagedColorPoint: false, // advantaged parking
    miniColorPoint: false, // mini parking
    doubleColorPoint: false, // double parking
    narrowColorPoint: false, // narrow parking,
    deadEndPoint: false, // dead end
    disadvantagedColorPoint: false, // disadvantage parking
    housedColorPoint: false, // housed parking
    redPoint: false, // core
    yellowPoint: false, // detached core
    greenPoint: false, // transfer
    cyanPoint: false, // exit
    orangePoint: false, // walk node
    color: [150, 150, 150], // Default color (grey)
  };

  // Non-walkable (black)
  if (r < 100 && g < 100 && b < 100) {
    baseProps.walkable = false;
    baseProps.color = [0, 0, 0]; //black walls
  }

  if (r > 200 && g > 200 && b > 200) {
    baseProps.walkable = true; //no use
    baseProps.whitePoint = true;
    // baseProps.color = [255, 255, 255]; //white, open space
  }

  // Red
  if (r > 200 && g < 50 && b < 50) {
    baseProps.redPoint = true; //[255,0,0]
    baseProps.color = [255, 0, 0];
  }

  // Yellow
  if (r > 200 && g > 200 && b < 50) {
    baseProps.yellowPoint = true; //[255,255,0]
    baseProps.color = [255, 255, 0];
  }

  // Green
  if (r < 50 && g > 200 && b < 50) {
    baseProps.greenPoint = true; //[0,255,0]
    baseProps.color = [0, 255, 0];
  }

  // Cyan
  if (r < 50 && g > 200 && b > 200) {
    baseProps.cyanPoint = true; //[0,255,255]
    baseProps.color = [0, 255, 255];
  }

  // Orange
  if (r > 200 && g > 120 && g < 180 && b < 50) {
    baseProps.orangePoint = true; //[255,150,0]
    baseProps.color = [255, 150, 0];
  }

  //blue
  //the blue color space carry many layers of meanings
  //R: 0-255, G: 0-199; B: 201-255
  if (g < 200 && b > 200) {
    baseProps.bluePoint = true;
    baseProps.color[0] = 0;
    baseProps.color[2] = 255;
    if (g < 50) {
      baseProps.regularColorPoint = true; //[0,0,255]
      baseProps.color[1] = 0;
    }
    if (g >= 50 && g < 125) {
      baseProps.miniColorPoint = true; //[R,80,255], since small parking is detected by the length, this is not used, only for visual legibility
      baseProps.color[1] = 80;
    }
    if (g >= 125 && g < 170) {
      baseProps.doubleColorPoint = true; //[R,160,255], since double parking is detected by the length, this is not used, only for visual legibility
      baseProps.color[1] = 160;
    }
    if (g >= 170) {
      baseProps.housedColorPoint = true; //[100,199,255]
      baseProps.color[0] = 100;
      baseProps.color[1] = 199;
    }
    if (r > 80 && r < 120) {
      baseProps.advantagedColorPoint = true; //[100, G, 255]
      baseProps.color[0] = 100;
    }
    if (r > 200 && r < 250) {
      baseProps.disadvantagedColorPoint = true; //[200,G,255]
      baseProps.color[0] = 200;
    }

    if (r > 100 && r < 200) {
      baseProps.narrowColorPoint = true; //[150, G, 255]
      baseProps.color[0] = 150;
    }
    if (r >= 250) {
      baseProps.deadEndPoint = true; //[255,G,255]
      baseProps.color[0] = 255;
    }
  }
  return baseProps;
  // Narrow Parking: Check first because it can overlap with others
  // large and vip lot [100,G,255], disadvantage lot [200,G,255]
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
  let xSum = 0,
    ySum = 0;
  let xMin = Infinity,
    xMax = 0,
    yMin = Infinity,
    yMax = 0;

  // First, calculate sums and min/max to find centroid and size
  cluster.forEach((tile) => {
    xSum += tile.x;
    ySum += tile.y;
    if (tile.x < xMin) xMin = tile.x;
    if (tile.x > xMax) xMax = tile.x;
    if (tile.y < yMin) yMin = tile.y;
    if (tile.y > yMax) yMax = tile.y;
  });

  const n = cluster.length;
  const xMean = xSum / n;
  const yMean = ySum / n;
  const xSize = xMax - xMin;
  const ySize = yMax - yMin;

  // Compute covariances
  let sXX = 0,
    sYY = 0,
    sXY = 0;
  cluster.forEach((tile) => {
    sXX += (tile.x - xMean) ** 2;
    sYY += (tile.y - yMean) ** 2;
    sXY += (tile.x - xMean) * (tile.y - yMean);
  });

  sXX /= n;
  sYY /= n;
  sXY /= n;

  // Calculate the angle in radians
  const angle = 0.5 * Math.atan2(2 * sXY, sXX - sYY);

  return {
    xSize: xSize > ySize ? xSize : ySize,
    ySize: xSize > ySize ? ySize : xSize,
    horizontal: xSize > ySize,
    angle: angle, // Convert radians to degrees
  };
}

function processClusters(basement, clusters, targetArray, propertySetter) {
  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    const clusterCenter = findClusterCenter(cluster);
    const point = basement.grid[clusterCenter.x][clusterCenter.y];
    propertySetter(point); // Apply the passed function to set additional properties
    targetArray.push(point);
  }
}
