function determineCellProps(color) {
  const [r, g, b] = color;
  const baseProps = {
    walkable: true,
    bluePoint: false, // parking (<200,<200,255) basic blue indicator
    regularColorPoint: false, // regular parking
    miniColorPoint: false, // mini parking
    doubleColorPoint: false, // double parking
    narrowColorPoint: false, // narrow parking,
    redPoint: false, // core
    yellowPoint: false, // detached core
    greenPoint: false, // transfer
    cyanPoint: false, // exit
    color: [150, 150, 150], // Default color (grey)
  };

  // Non-walkable (black)
  if (r < 100 && g < 100 && b < 100) {
    baseProps.walkable = false;
    baseProps.color = [0, 0, 0]; //black walls
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

  // Narrow Parking: Check first because it can overlap with others
  if (r > 100 && r < 200 && g < 200 && b > 200) {
    baseProps.narrowColorPoint = true; //[150, 0-200, 255]
    baseProps.color[0] = 150;
    baseProps.bluePoint = true;
    baseProps.color[2] = 255;
  }

  if (r < 200 && g < 200 && b > 200) {
    baseProps.bluePoint = true;
    baseProps.color[2] = 255;
    if (g < 50) {
      baseProps.regularColorPoint = true; //[<200,<50,255]
      baseProps.color[1] = 0;
    }
    if (g >= 50 && g < 125) {
      baseProps.miniColorPoint = true; //[<200,80,255]
      baseProps.color[1] = 80;
    }
    if (g >= 125) {
      baseProps.doubleColorPoint = true; //[<200,160,255]
      baseProps.color[1] = 160;
    }
  }

  return baseProps;
}

//used in makeGrid function
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
