class Basement {
  constructor(floor) {
    this.floor = floor;
    this.inputImage = null;
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

//gl
let pixelMultiplier = 5;
//mouse events
let x1, y1, x2, y2;
let selection = false;
let confirmed = false;
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
          basement1.inputImage = loadedImg;
          processImage(basement1, basement1.inputImage);
        });
      }
    });
  document
    .getElementById("basement2Input")
    .addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        let file = e.target.files[0];
        loadImage(URL.createObjectURL(file), function (loadedImg) {
          basement2.inputImage = loadedImg;
          processImage(basement2, basement2.inputImage);
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
    basement2.translate.x = basement1.inputImage
      ? basement1.inputImage.width
      : 0;
    image(basement2.img, basement2.translate.x * pixelMultiplier, 0);
  }
  // for (let basement of [basement1, basement2]) {
  //   basement.starts.forEach((start, index) => {
  //     const selectElement = document.getElementById(
  //       `selectIdForBasement${basement.floor}Start${index}`
  //     );
  //     if (selectElement) {
  //       updateDOMPosition(
  //         selectElement,
  //         (start.x + basement.translate.x) * pixelMultiplier,
  //         start.y * pixelMultiplier
  //       );
  //     }
  //     const inputElement = document.getElementById(
  //       `inputIdForBasement${basement.floor}Start${index}`
  //     );
  //     if (inputElement) {
  //       updateDOMPosition(
  //         inputElement,
  //         (start.x + basement.translate.x) * pixelMultiplier,
  //         start.y * pixelMultiplier
  //       );
  //     }
  //   });
  //   basement.exits.forEach((exit, index) => {
  //     const selectElement = document.getElementById(
  //       `selectIdForBasement${basement.floor}Exit${index}`
  //     );
  //     if (selectElement) {
  //       updateDOMPosition(
  //         selectElement,
  //         (exit.x + basement.translate.x) * pixelMultiplier,
  //         exit.y * pixelMultiplier
  //       );
  //     }
  //   });
  // }
  // updateDOMPositionsForBasement(basement1);
  // updateDOMPositionsForBasement(basement2);
}

function processImage(basement, inputImage) {
  console.log("processImage", basement.floor, inputImage);
  basement.grid = makeGrid(basement, inputImage);
  if (basement.floor === 2) {
    basement.translate.x = basement1.inputImage.width;
    console.log("translate x", basement.translate.x);
  }

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
  for (let i = 0; i < basement.clustersBlue.length; i++) {
    const cluster = basement.clustersBlue[i];
    const clusterCenter = findClusterCenter(cluster);
    const endPoint = basement.grid[clusterCenter.x][clusterCenter.y];
    endPoint.end = true;
    basement.ends.push(endPoint);
    endPoint.horizontal = findClusterSize(cluster).horizontal; //horizontal or not is for parking lot diretion
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

  for (let i = 0; i < basement.starts.length; i++) {
    const start = basement.starts[i];
    for (let j = 0; j < basement.ends.length; j++) {
      const end = basement.ends[j];
      const dist = simpleManhattanDistance(start, end); // Manhattan distance, Pathfinding not implemented
      start.dists.push(dist);
    }
  }
  //find the manhattan dists from each detached starts to transfer points
  for (let i = 0; i < basement.detachedStarts.length; i++) {
    basement.detachedStarts[i].distsToTransfer = [];
    const detachedStart = basement.detachedStarts[i];
    for (let j = 0; j < basement.transfers.length; j++) {
      const transfer = basement.transfers[j];
      const distToTransfer = simpleManhattanDistance(detachedStart, transfer);
      detachedStart.distsToTransfer.push(distToTransfer);
    }
  }
  //find the manhattan dists from each transfer points to ends
  for (let i = 0; i < basement.transfers.length; i++) {
    const transfer = basement.transfers[i];
    for (let j = 0; j < basement.ends.length; j++) {
      const end = basement.ends[j];
      const dist = simpleManhattanDistance(transfer, end);
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
  //calculate all manhattan dists from all starts to all exits, and push them to a new distsToExits array
  for (let i = 0; i < basement.starts.length; i++) {
    const start = basement.starts[i];
    start.distsToExits = [];
    for (let j = 0; j < basement.exits.length; j++) {
      const exit = basement.exits[j];
      const dist = simpleManhattanDistance(start, exit);
      start.distsToExits.push(dist);
    }
  }

  //add selection doms to the exit points in the canvas
  for (let i = 0; i < basement.exits.length; i++) {
    const exit = basement.exits[i];
    exit.metersLoss = 800;
    basement.exitClasses[i] = 1; //default is moderate
    const select = createSelect();
    select.id(`selectIdForBasement${basement.floor}Exit${i}`);

    const xTranslate = (exit.x + basement.translate.x) * pixelMultiplier;
    console.log("xTranslate", xTranslate);
    select.position(xTranslate, exit.y * pixelMultiplier + 60);
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
      exit.metersLoss = 80 * 5 * (1 + exitClasses[i]);
      //put text of the selection on the canvas near the exit point
    }
  }

  //add selection doms to the start points in the canvas
  basement.coreClasses = [];
  const listOfCustomers = [
    "刚需 surviving",
    "首置 modest",
    "首改 comfortable",
    "再改 affluent",
    "高改 wealthy",
  ];
  for (let i = 0; i < basement.starts.length; i++) {
    const start = basement.starts[i];
    const select = createSelect();
    select.id(`selectIdForBasement${basement.floor}Start${i}`);
    console.log("start translate", start.x + basement.translate.x);
    select.position(
      (start.x + basement.translate.x) * pixelMultiplier,
      start.y * pixelMultiplier + 60
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
      //put text of the selection on the canvas near start point
    }
  }

  //add number input doms to the start points in the canvas
  for (let i = 0; i < basement.starts.length; i++) {
    const start = basement.starts[i];
    const input = createInput();
    input.id(`inputIdForBasement${basement.floor}Start${i}`);
    input.position(
      (start.x + basement.translate.x) * pixelMultiplier - 10,
      start.y * pixelMultiplier + 75
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
        dists: [], // Assuming dists is always an empty array initially
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

function processClusters(basement, clusters, targetArray, propertySetter) {
  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    const clusterCenter = findClusterCenter(cluster);
    const point = basement.grid[clusterCenter.x][clusterCenter.y];
    propertySetter(point); // Apply the passed function to set additional properties
    targetArray.push(point);
  }
}
// function updateDOMPositionsForBasement(basement) {
//   const canvasContainer = document.getElementById("canvasContainer");
//   const canvasRect = canvasContainer.getBoundingClientRect();

//   basement.starts.forEach((start, index) => {
//     updateSelectPosition(basement, start, index, "Start");
//   });

//   basement.exits.forEach((exit, index) => {
//     updateSelectPosition(basement, exit, index, "Exit");
//   });
// }

// function updateSelectPosition(basement, point, index, type) {
//   const selectId = `selectIdForBasement${basement.floor}${type}${index}`;
//   const selectElement = document.getElementById(selectId);
//   if (selectElement) {
//     const newPos = calculateDOMPosition(point, basement);
//     selectElement.style.left = `${newPos.x}px`;
//     selectElement.style.top = `${newPos.y}px`;
//   }
// }

// function calculateDOMPosition(point, basement) {
//   // Ensure canvasContainer's rect is fetched fresh to accommodate any layout changes
//   const canvasRect = document
//     .getElementById("canvasContainer")
//     .getBoundingClientRect();

//   // Apply translation for the basement image, then scale with pixelMultiplier, apply zoom and adjust by offsets and canvasRect's position
//   const transformedX =
//     (point.x + basement.translate.x) * pixelMultiplier * zoom +
//     offsetX +
//     canvasRect.left;
//   const transformedY =
//     (point.y + basement.translate.y) * pixelMultiplier * zoom +
//     offsetY +
//     canvasRect.top;

//   return { x: transformedX, y: transformedY };
// }

// // Ensure you call updateDOMPositionsForBasement for both basements after any transformations (zoom, drag) or on initial setup to keep DOM elements aligned.
