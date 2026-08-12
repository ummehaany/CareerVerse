/**
 * Self-contained QR Code generator — no dependencies.
 * Adapted from Nayuki's public-domain / MIT QR Code generator reference.
 * Byte (UTF-8) mode, automatic version + mask selection. Returns a boolean
 * module matrix (true = dark). Sufficient for URLs; supports versions 1–40.
 */

export type Ecl = "L" | "M" | "Q" | "H";

const ECL_FORMATBITS: Record<Ecl, number> = { L: 1, M: 0, Q: 3, H: 2 };

const MIN_VERSION = 1;
const MAX_VERSION = 40;
const PENALTY_N1 = 3;
const PENALTY_N2 = 3;
const PENALTY_N3 = 40;
const PENALTY_N4 = 10;

// [ecl][version] — indexed 1..40 (index 0 unused).
const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  // L
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  // M
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  // Q
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  // H
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];

const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
  // L
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  // M
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  // Q
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  // H
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];

function eclOrdinal(ecl: Ecl): number {
  return { L: 0, M: 1, Q: 2, H: 3 }[ecl];
}

function getBit(x: number, i: number): boolean {
  return ((x >>> i) & 1) !== 0;
}

/* ── Reed–Solomon over GF(256) ────────────────────────────────────────────── */

function reedSolomonMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function reedSolomonComputeDivisor(degree: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < degree - 1; i++) result.push(0);
  result.push(1);
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = reedSolomonMultiply(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = reedSolomonMultiply(root, 0x02);
  }
  return result;
}

function reedSolomonComputeRemainder(data: number[], divisor: number[]): number[] {
  const result = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ result.shift()!;
    result.push(0);
    divisor.forEach((coef, i) => {
      result[i] ^= reedSolomonMultiply(coef, factor);
    });
  }
  return result;
}

/* ── Capacity helpers ─────────────────────────────────────────────────────── */

function getNumRawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

export function getNumDataCodewords(ver: number, ecl: Ecl): number {
  const e = eclOrdinal(ecl);
  return (
    Math.floor(getNumRawDataModules(ver) / 8) -
    ECC_CODEWORDS_PER_BLOCK[e][ver] * NUM_ERROR_CORRECTION_BLOCKS[e][ver]
  );
}

export function getAlignmentPatternPositions(ver: number, size: number): number[] {
  if (ver === 1) return [];
  const numAlign = Math.floor(ver / 7) + 2;
  const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result: number[] = [6];
  for (let pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
  return result;
}

/* ── Encoder ──────────────────────────────────────────────────────────────── */

function toUtf8(str: string): number[] {
  const out: number[] = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0)!;
    if (cp < 0x80) out.push(cp);
    else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    else if (cp < 0x10000) out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    else out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
  }
  return out;
}

interface BitBuffer {
  bits: number[];
}
function appendBits(bb: BitBuffer, val: number, len: number): void {
  for (let i = len - 1; i >= 0; i--) bb.bits.push((val >>> i) & 1);
}

/** Build the QR module matrix (true = dark). `forceMask` (0–7) is for testing. */
export function buildQr(text: string, ecl: Ecl = "M", forceMask = -1) {
  const dataBytes = toUtf8(text);

  // Choose the smallest version that fits a byte segment.
  let version = MIN_VERSION;
  let dataCapacityBits = 0;
  for (; ; version++) {
    if (version > MAX_VERSION) throw new Error("Data too long for QR");
    const usableBits = getNumDataCodewords(version, ecl) * 8;
    const ccBits = version <= 9 ? 8 : 16;
    const neededBits = 4 + ccBits + dataBytes.length * 8;
    if (neededBits <= usableBits) {
      dataCapacityBits = usableBits;
      break;
    }
  }

  // Segment: byte mode.
  const bb: BitBuffer = { bits: [] };
  appendBits(bb, 0x4, 4); // byte mode indicator
  appendBits(bb, dataBytes.length, version <= 9 ? 8 : 16);
  for (const b of dataBytes) appendBits(bb, b, 8);

  // Terminator + bit/byte padding.
  appendBits(bb, 0, Math.min(4, dataCapacityBits - bb.bits.length));
  appendBits(bb, 0, (8 - (bb.bits.length % 8)) % 8);
  for (let padByte = 0xec; bb.bits.length < dataCapacityBits; padByte ^= 0xec ^ 0x11) appendBits(bb, padByte, 8);

  // Pack bits into codewords.
  const dataCodewords: number[] = new Array(bb.bits.length / 8).fill(0);
  bb.bits.forEach((bit, i) => {
    dataCodewords[i >>> 3] |= bit << (7 - (i & 7));
  });

  const size = version * 4 + 17;
  const modules: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));

  const setFunction = (x: number, y: number, dark: boolean) => {
    modules[y][x] = dark;
    isFunction[y][x] = true;
  };

  const drawFinder = (x: number, y: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const xx = x + dx;
        const yy = y + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) setFunction(xx, yy, dist !== 2 && dist !== 4);
      }
    }
  };

  const drawAlignment = (x: number, y: number) => {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        setFunction(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  };

  // Draw function patterns.
  for (let i = 0; i < size; i++) {
    setFunction(6, i, i % 2 === 0);
    setFunction(i, 6, i % 2 === 0);
  }
  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);

  const alignPositions = getAlignmentPatternPositions(version, size);
  const numAlign = alignPositions.length;
  for (let i = 0; i < numAlign; i++) {
    for (let j = 0; j < numAlign; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === numAlign - 1) || (i === numAlign - 1 && j === 0)) continue;
      drawAlignment(alignPositions[i], alignPositions[j]);
    }
  }

  // Reserve format/version areas as function modules (values drawn later).
  const drawFormatBits = (mask: number) => {
    const data = (ECL_FORMATBITS[ecl] << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    for (let i = 0; i <= 5; i++) setFunction(8, i, getBit(bits, i));
    setFunction(8, 7, getBit(bits, 6));
    setFunction(8, 8, getBit(bits, 7));
    setFunction(7, 8, getBit(bits, 8));
    for (let i = 9; i < 15; i++) setFunction(14 - i, 8, getBit(bits, i));
    for (let i = 0; i < 8; i++) setFunction(size - 1 - i, 8, getBit(bits, i));
    for (let i = 8; i < 15; i++) setFunction(8, size - 15 + i, getBit(bits, i));
    setFunction(8, size - 8, true); // always-dark module
  };

  const drawVersion = () => {
    if (version < 7) return;
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = getBit(bits, i);
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunction(a, b, bit);
      setFunction(b, a, bit);
    }
  };

  drawFormatBits(0); // reserve; real bits set after masking
  drawVersion();

  // Error correction + interleaving.
  const e = eclOrdinal(ecl);
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[e][version];
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[e][version];
  const rawCodewords = Math.floor(getNumRawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);

  const blocks: number[][] = [];
  const rsDiv = reedSolomonComputeDivisor(blockEccLen);
  let k = 0;
  for (let i = 0; i < numBlocks; i++) {
    const datLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
    const dat = dataCodewords.slice(k, k + datLen);
    k += datLen;
    const ecc = reedSolomonComputeRemainder(dat.slice(), rsDiv);
    if (i < numShortBlocks) dat.push(0);
    blocks.push(dat.concat(ecc));
  }

  const finalCodewords: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    for (let j = 0; j < blocks.length; j++) {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) finalCodewords.push(blocks[j][i]);
    }
  }

  // Place data bits (zigzag, upward/downward columns; skip the timing column).
  let idx = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let jj = 0; jj < 2; jj++) {
        const x = right - jj;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x] && idx < finalCodewords.length * 8) {
          modules[y][x] = getBit(finalCodewords[idx >>> 3], 7 - (idx & 7));
          idx++;
        }
      }
    }
  }

  // Masking.
  const applyMask = (mask: number) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (isFunction[y][x]) continue;
        let invert = false;
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break;
          case 1: invert = y % 2 === 0; break;
          case 2: invert = x % 3 === 0; break;
          case 3: invert = (x + y) % 3 === 0; break;
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          case 7: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
        }
        if (invert) modules[y][x] = !modules[y][x];
      }
    }
  };

  const penalty = (): number => {
    let result = 0;
    // Rows/cols runs.
    for (let y = 0; y < size; y++) {
      let runColor = false;
      let runX = 0;
      const runHistory = [0, 0, 0, 0, 0, 0, 0];
      for (let x = 0; x < size; x++) {
        if (modules[y][x] === runColor) {
          runX++;
          if (runX === 5) result += PENALTY_N1;
          else if (runX > 5) result++;
        } else {
          finderPenaltyAddHistory(runX, runHistory, size);
          if (!runColor) result += finderPenaltyCountPatterns(runHistory) * PENALTY_N3;
          runColor = modules[y][x];
          runX = 1;
        }
      }
      result += finderPenaltyTerminateAndCount(runColor, runX, runHistory, size) * PENALTY_N3;
    }
    for (let x = 0; x < size; x++) {
      let runColor = false;
      let runY = 0;
      const runHistory = [0, 0, 0, 0, 0, 0, 0];
      for (let y = 0; y < size; y++) {
        if (modules[y][x] === runColor) {
          runY++;
          if (runY === 5) result += PENALTY_N1;
          else if (runY > 5) result++;
        } else {
          finderPenaltyAddHistory(runY, runHistory, size);
          if (!runColor) result += finderPenaltyCountPatterns(runHistory) * PENALTY_N3;
          runColor = modules[y][x];
          runY = 1;
        }
      }
      result += finderPenaltyTerminateAndCount(runColor, runY, runHistory, size) * PENALTY_N3;
    }
    // 2x2 blocks.
    for (let y = 0; y < size - 1; y++) {
      for (let x = 0; x < size - 1; x++) {
        const c = modules[y][x];
        if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) result += PENALTY_N2;
      }
    }
    // Dark ratio.
    let dark = 0;
    for (const row of modules) for (const v of row) if (v) dark++;
    const total = size * size;
    const k2 = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    result += k2 * PENALTY_N4;
    return result;
  };

  function finderPenaltyCountPatterns(rh: number[]): number {
    const n = rh[1];
    const core = n > 0 && rh[2] === n && rh[3] === n * 3 && rh[4] === n && rh[5] === n;
    return (core && rh[0] >= n * 4 && rh[6] >= n ? 1 : 0) + (core && rh[6] >= n * 4 && rh[0] >= n ? 1 : 0);
  }
  function finderPenaltyTerminateAndCount(currentColor: boolean, currentRun: number, rh: number[], sz: number): number {
    if (currentColor) {
      finderPenaltyAddHistory(currentRun, rh, sz);
      currentRun = 0;
    }
    currentRun += sz;
    finderPenaltyAddHistory(currentRun, rh, sz);
    return finderPenaltyCountPatterns(rh);
  }
  function finderPenaltyAddHistory(currentRunLength: number, rh: number[], sz: number): void {
    if (rh[0] === 0) currentRunLength += sz;
    rh.pop();
    rh.unshift(currentRunLength);
  }

  let chosenMask = forceMask;
  if (chosenMask === -1) {
    let minPenalty = Infinity;
    for (let m = 0; m < 8; m++) {
      applyMask(m);
      drawFormatBits(m);
      const p = penalty();
      if (p < minPenalty) {
        minPenalty = p;
        chosenMask = m;
      }
      applyMask(m); // undo
    }
  }
  applyMask(chosenMask);
  drawFormatBits(chosenMask);

  return { modules, isFunction, version, size, mask: chosenMask, finalCodewords, dataCodewords, blocks, blockEccLen };
}

export function qrMatrix(text: string, ecl: Ecl = "M"): boolean[][] {
  return buildQr(text, ecl).modules;
}
