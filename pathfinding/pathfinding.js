// Assuming processImage already populates starts, ends, and possibly walls

// Utility function to calculate Manhattan distance
function manhattanDistance(node1, node2) {
  return Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y);
}

// Initialize pathfinding nodes and graph
function initializePathfindingNodes(basement) {
  // Combine all relevant points into a single array for processing
  const nodes = [
    ...basement.starts,
    ...basement.ends,
    ...basement.transfers,
    ...basement.detachedStarts,
  ];

  // Object to hold the graph
  basement.graph = {};

  nodes.forEach((node) => {
    basement.graph[node.id] = {
      node: node,
      edges: [],
    };

    // Find potential neighbors by Manhattan distance
    let distances = nodes
      .map((other) => ({
        node: other,
        distance: manhattanDistance(node, other),
      }))
      .filter((item) => item.node !== node) // Exclude self
      .sort((a, b) => a.distance - b.distance) // Sort by distance
      .slice(0, 15); // Get the closest 15 nodes

    // Validate and refine distances considering walls
    distances.forEach((distance) => {
      if (isValidPath(node, distance.node, basement.grid)) {
        basement.graph[node.id].edges.push({
          to: distance.node,
          cost: distance.distance,
        });
      }
    });
  });
}

// Example A* search algorithm setup
function aStarSearch(start, goal, graph) {
  let openSet = [start];
  let cameFrom = new Map();

  let gScore = {};
  gScore[start.id] = 0;

  let fScore = {};
  fScore[start.id] = manhattanDistance(start, goal);

  while (openSet.length > 0) {
    let current = openSet.reduce((a, b) =>
      fScore[a.id] < fScore[b.id] ? a : b
    );

    if (current === goal) {
      return reconstructPath(cameFrom, current);
    }

    openSet = openSet.filter((node) => node !== current);

    graph[current.id].edges.forEach((neighbor) => {
      let tentativeGScore = gScore[current.id] + neighbor.cost;
      if (tentativeGScore < (gScore[neighbor.node.id] || Infinity)) {
        cameFrom.set(neighbor.node.id, current);
        gScore[neighbor.node.id] = tentativeGScore;
        fScore[neighbor.node.id] =
          tentativeGScore + manhattanDistance(neighbor.node, goal);
        if (!openSet.includes(neighbor.node)) {
          openSet.push(neighbor.node);
        }
      }
    });
  }

  return "Failure to find path";
}

// Reconstruct path from A* search
function reconstructPath(cameFrom, current) {
  let totalPath = [current];
  while (cameFrom.has(current.id)) {
    current = cameFrom.get(current.id);
    totalPath.unshift(current);
  }
  return totalPath;
}

// Example usage
function setupPathfinding(basement) {
  processImage(basement, basement.inputImage); // Assuming this populates starts and ends
  initializePathfindingNodes(basement);
  // Example: Path from first start to first end
  let path = aStarSearch(basement.starts[0], basement.ends[0], basement.graph);
  console.log("Found path:", path);
}

// Call this function in setup or where appropriate
// setupPathfinding(basement); // Assuming basement1 is already populated

// Helper function to check if a grid cell is walkable
function isWalkable(x, y, grid) {
  return grid[x] && grid[x][y] && grid[x][y].walkable;
}

// Bresenham's line algorithm to check path validity
function isValidPath(from, to, grid) {
  let x0 = from.x;
  let y0 = from.y;
  let x1 = to.x;
  let y1 = to.y;
  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let e2;

  while (true) {
    // Check if the current grid cell is walkable
    if (!isWalkable(x0, y0, grid)) {
      return false; // There's an obstacle in the path
    }
    if (x0 === x1 && y0 === y1) break;
    e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
  return true;
}

// Initialize pathfinding nodes and graph with valid paths only
function initializePathfindingNodes(basement) {
  const nodes = [...basement.starts, ...basement.ends];
  basement.graph = {};

  nodes.forEach((node) => {
    basement.graph[node.id] = {
      node: node,
      edges: [],
    };

    let distances = nodes
      .map((other) => ({
        node: other,
        distance: manhattanDistance(node, other),
      }))
      .filter((item) => item.node !== node)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 15);

    distances.forEach((distance) => {
      if (isValidPath(node, distance.node, basement.grid)) {
        basement.graph[node.id].edges.push({
          to: distance.node,
          cost: distance.distance,
        });
      }
    });
  });
}
