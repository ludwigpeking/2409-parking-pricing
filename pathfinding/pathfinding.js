const distanceScale = 0.5; // 0.5 meters per pixel
// Assuming processImage already populates starts, ends, and possibly walls

// Utility function to calculate Manhattan distance
function manhattanDistance(node1, node2) {
  const dist = Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y);
  return dist * distanceScale;
}

// Initialize pathfinding nodes and graph
function initializePathfindingNodes(basement) {
  // Combine all relevant points into a single array for processing
  const nodes = [...basement.starts, ...basement.ends, ...basement.transfers];
  nodes.forEach((node, index) => {
    if (!node.id) {
      node.id = `node-${index}`; // Assign a unique ID if none exists
    }
  });
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
      .slice(0, 15); // Get the closest 15 nodes NOTE!!!!!

    // Validate and refine distances considering walls
    distances.forEach((distance) => {
      // if (isValidPath(node, distance.node, basement.grid)) {
      basement.graph[node.id].edges.push({
        to: distance.node,
        cost: distance.distance,
      });
      // }
    });
  });
}

function aStarSearch(start, goal, graph) {
  // console.log("A* Search Start");
  if (!start || !goal) {
    console.error("Start or goal node is undefined.");
    return "Failure due to undefined start or goal";
  }

  if (!graph[start.id] || !graph[goal.id]) {
    console.error("Start or goal node not in graph.");
    return "Failure due to start or goal node not present in graph";
  }

  // console.log("Graph structure:", graph);

  let openSet = new Set([start.id]);
  let cameFrom = new Map();

  let gScore = {};
  let fScore = {};

  // Initialize scores for all nodes in the graph
  Object.keys(graph).forEach((nodeId) => {
    gScore[nodeId] = Infinity;
    fScore[nodeId] = Infinity;
  });

  gScore[start.id] = 0;
  fScore[start.id] = manhattanDistance(start, goal);

  while (openSet.size > 0) {
    let currentId = [...openSet].reduce((a, b) =>
      fScore[a] < fScore[b] ? a : b
    );
    let current = graph[currentId].node;

    if (current.id === goal.id) {
      const path = reconstructPath(cameFrom, current);
      const distance = pathDistance(path);
      // console.log("Path found with distance:", distance);
      return distance;
    }

    openSet.delete(current.id);

    if (!graph[current.id] || !graph[current.id].edges) {
      console.error("Current node has no edges:", current);
      continue;
    }

    graph[current.id].edges.forEach((edge) => {
      let neighbor = edge.to;
      let tentativeGScore = gScore[current.id] + edge.cost;

      if (!gScore.hasOwnProperty(neighbor.id)) {
        gScore[neighbor.id] = Infinity; // Ensure every node has a gScore
      }

      if (tentativeGScore < gScore[neighbor.id]) {
        cameFrom.set(neighbor.id, current);
        gScore[neighbor.id] = tentativeGScore;
        fScore[neighbor.id] =
          tentativeGScore + manhattanDistance(neighbor, goal);

        if (!openSet.has(neighbor.id)) {
          openSet.add(neighbor.id);
        }
      }
    });
  }

  console.error("Failed to find a path.");
  return "Failure to find path";
}

function reconstructPath(cameFrom, current) {
  let totalPath = [current];
  while (cameFrom.has(current.id)) {
    current = cameFrom.get(current.id);
    totalPath.unshift(current);
  }
  return totalPath;
}

function pathDistance(path) {
  let distance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    distance += manhattanDistance(path[i], path[i + 1]);
  }
  return distance;
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
