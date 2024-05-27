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
