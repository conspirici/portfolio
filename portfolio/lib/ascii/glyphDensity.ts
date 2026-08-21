import { DENSITY_GROUPS, EDGE_HORIZONTAL, EDGE_VERTICAL, EDGE_DIAGONAL_UP, EDGE_DIAGONAL_DN, EDGE_NONE } from './types';

// Given brightness (0-255), edge magnitude (0-255), edge angle (0-255 maps to 0-180°),
// and saturation (0-255), returns the best glyphIndex and densityGroup.
export function selectGlyph(brightness: number, edgeMagnitude: number, edgeAngle: number, saturation: number): { glyphIndex: number; densityGroup: number } {
  // Find appropriate density group
  let densityGroup = 0;
  for (let i = 0; i < DENSITY_GROUPS.length; i++) {
    if (brightness >= DENSITY_GROUPS[i].brightnessRange[0] && brightness <= DENSITY_GROUPS[i].brightnessRange[1]) {
      densityGroup = i;
      break;
    }
  }

  const group = DENSITY_GROUPS[densityGroup];
  if (!group || group.indices.length === 0) {
    return { glyphIndex: 0, densityGroup: 0 };
  }
  
  let glyphIndex = group.indices[Math.floor(Math.random() * group.indices.length)];

  if (edgeMagnitude > 80) {
    const edgeType = classifyEdge(edgeMagnitude, edgeAngle);
    
    const getPreferred = (preferredIndices: number[]) => {
      const available = group.indices.filter(idx => preferredIndices.includes(idx));
      if (available.length > 0) return available[Math.floor(Math.random() * available.length)];
      return null;
    };

    let edgeChoice = null;
    if (edgeType === EDGE_HORIZONTAL) edgeChoice = getPreferred([7, 19, 8]);
    else if (edgeType === EDGE_VERTICAL) edgeChoice = getPreferred([10, 9, 11]);
    else if (edgeType === EDGE_DIAGONAL_UP) edgeChoice = getPreferred([13, 15]);
    else if (edgeType === EDGE_DIAGONAL_DN) edgeChoice = getPreferred([14, 16]);

    if (edgeChoice !== null) {
      glyphIndex = edgeChoice;
    }
  } else {
    // Within brightness band, prefer rounder glyphs ('o','O','0') for high saturation areas
    if (saturation > 100) {
      const availableRound = group.indices.filter(idx => [24, 32, 33].includes(idx));
      if (availableRound.length > 0) {
        glyphIndex = availableRound[Math.floor(Math.random() * availableRound.length)];
      }
    }
  }

  return { glyphIndex, densityGroup };
}

export function getRandomSwap(densityGroup: number, currentIndex: number): number {
  const group = DENSITY_GROUPS[densityGroup];
  if (group.indices.length <= 1) return currentIndex;
  let idx = currentIndex;
  let attempts = 0;
  while (idx === currentIndex && attempts < 10) {
    idx = group.indices[Math.floor(Math.random() * group.indices.length)];
    attempts++;
  }
  return idx;
}

export function getAdjacentSwap(densityGroup: number, currentIndex: number): number {
  const adjGroupIndices = [densityGroup];
  if (densityGroup > 0) adjGroupIndices.push(densityGroup - 1);
  if (densityGroup < DENSITY_GROUPS.length - 1) adjGroupIndices.push(densityGroup + 1);
  
  const targetGroupIdx = adjGroupIndices[Math.floor(Math.random() * adjGroupIndices.length)];
  const group = DENSITY_GROUPS[targetGroupIdx];
  return group.indices[Math.floor(Math.random() * group.indices.length)];
}

export function classifyEdge(edgeMagnitude: number, edgeAngle: number): number {
  if (edgeMagnitude <= 80) return EDGE_NONE;
  // edgeAngle is 0-255 mapping to 0-180°
  const degrees = (edgeAngle * 180) / 255;
  if (degrees < 22.5 || degrees >= 157.5) return EDGE_HORIZONTAL;
  if (degrees >= 22.5 && degrees < 67.5) return EDGE_DIAGONAL_UP;
  if (degrees >= 67.5 && degrees < 112.5) return EDGE_VERTICAL;
  if (degrees >= 112.5 && degrees < 157.5) return EDGE_DIAGONAL_DN;
  return EDGE_NONE;
}
