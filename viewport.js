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

// function mouseWheel(event) {
//   // Zoom in or out
//   let zoomIntensity = 2;
//   zoom += event.delta * -0.001 * zoomIntensity;
//   zoom = constrain(zoom, 0.5, 5); // Limit zoom to prevent inversion or excessive zoom
//   return false; // Prevent default behavior
// }

// function mousePressed() {
//   // Start dragging
//   startDragX = mouseX - offsetX;
//   startDragY = mouseY - offsetY;
//   dragging = true;
//   cursor(MOVE);
// }

// function mouseDragged() {
//   if (dragging) {
//     // Update offset based on drag
//     offsetX = mouseX - startDragX;
//     offsetY = mouseY - startDragY;
//   }
// }

// function mouseReleased() {
//   // Stop dragging
//   dragging = false;
//   cursor("zoom-in");
// }
