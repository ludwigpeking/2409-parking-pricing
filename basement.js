class Basement {
  constructor(floor) {
    this.floor = floor;
    this.inputImage = null;
    this.img = null;
    this.textLayer = null;
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

    this.domElements = []; // Track created DOM elements
  }
  clearDOMElements() {
    this.domElements.forEach((el) => el.remove());
    this.domElements = []; // Reset the list
  }
}
