function saveBasementState() {
  const state = {};
  if (basement1.img && basement1.img.canvas) {
    state.basement1 = {
      img: basement1.img.canvas.toDataURL(),
      floor: basement1.floor,
      textLayer: basement1.textLayer,
      translate: basement1.translate,
      grid: basement1.grid,
      starts: basement1.starts,
      coreClasses: basement1.coreClasses,
      detachedStarts: basement1.detachedStarts,
      coreHouseholdNumbers: basement1.coreHouseholdNumbers,
      transfers: basement1.transfers,
      ends: basement1.ends,
      exits: basement1.exits,
      exitClasses: basement1.exitClasses,
      controlledLots: basement1.controlledLots,
      openLots: basement1.openLots,
      soldLots: basement1.soldLots,
      domElements: basement1.domElements.map((el) => ({
        id: el.id,
        type: el.tagName.toLowerCase(),
        value: el.value,
        position: { x: el.style.left, y: el.style.top },
      })),
    };
  }
  if (basement2.img && basement2.img.canvas) {
    state.basement2 = {
      img: basement2.img.canvas.toDataURL(),
      floor: basement2.floor,
      textLayer: basement2.textLayer,
      translate: basement2.translate,
      grid: basement2.grid,
      starts: basement2.starts,
      coreClasses: basement2.coreClasses,
      detachedStarts: basement2.detachedStarts,
      coreHouseholdNumbers: basement2.coreHouseholdNumbers,
      transfers: basement2.transfers,
      ends: basement2.ends,
      exits: basement2.exits,
      exitClasses: basement2.exitClasses,
      controlledLots: basement2.controlledLots,
      openLots: basement2.openLots,
      soldLots: basement2.soldLots,
      domElements: basement2.domElements.map((el) => ({
        id: el.id,
        type: el.tagName.toLowerCase(),
        value: el.value,
        position: { x: el.style.left, y: el.style.top },
      })),
    };
  }

  const dataStr =
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
  const dlAnchorElem = document.createElement("a");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "basement-state.json");
  dlAnchorElem.click();
}
