import type { LevelDefinition } from "./types";

const floorColor = "#202726";
const shelfColor = "#2a3431";

export const LEVELS: LevelDefinition[] = [
  {
    id: 1,
    name: "Drop Zone",
    bombs: 3,
    thrower: { x: 105, y: 518 },
    objects: [
      { id: "e1", kind: "enemy", pos: { x: 680, y: 417 }, radius: 25, color: "#ff5a5f" },
      { id: "e2", kind: "enemy", pos: { x: 744, y: 417 }, radius: 25, color: "#ff5a5f" },
      { id: "c1", kind: "crate", pos: { x: 608, y: 420 }, radius: 22, mass: 0.75, color: "#f3b33d" },
    ],
    terrain: [
      { id: "home", skin: "floor", x: 48, y: 532, width: 230, height: 34, color: floorColor },
      { id: "shelf", skin: "floor", x: 565, y: 434, width: 235, height: 32, color: shelfColor },
    ],
  },
  {
    id: 2,
    name: "Bank Shot",
    bombs: 3,
    thrower: { x: 103, y: 523 },
    objects: [
      { id: "e1", kind: "enemy", pos: { x: 725, y: 377 }, radius: 25, color: "#ff5a5f" },
      { id: "e2", kind: "enemy", pos: { x: 802, y: 377 }, radius: 25, color: "#ff5a5f" },
      { id: "c1", kind: "crate", pos: { x: 560, y: 394 }, radius: 24, mass: 0.7, color: "#38bdf8" },
      { id: "c2", kind: "crate", pos: { x: 610, y: 394 }, radius: 24, mass: 0.7, color: "#f3b33d" },
    ],
    terrain: [
      { id: "home", skin: "floor", x: 45, y: 536, width: 230, height: 34, color: floorColor },
      { id: "blocker", skin: "floating-wall", x: 396, y: 350, width: 56, height: 196, color: floorColor },
      { id: "bank", skin: "floor", x: 486, y: 410, width: 176, height: 32, color: shelfColor },
      { id: "enemy-shelf", skin: "floor", x: 690, y: 394, width: 220, height: 32, color: shelfColor },
    ],
  },
  {
    id: 3,
    name: "Chain Lift",
    bombs: 4,
    thrower: { x: 107, y: 524 },
    objects: [
      { id: "e1", kind: "enemy", pos: { x: 626, y: 488 }, radius: 25, color: "#ff5a5f" },
      { id: "e2", kind: "enemy", pos: { x: 770, y: 354 }, radius: 25, color: "#ff5a5f" },
      { id: "e3", kind: "enemy", pos: { x: 835, y: 354 }, radius: 25, color: "#ff5a5f" },
      { id: "c1", kind: "crate", pos: { x: 543, y: 489 }, radius: 24, mass: 0.8, color: "#2dd4bf" },
      { id: "c2", kind: "crate", pos: { x: 690, y: 355 }, radius: 24, mass: 0.8, color: "#f3b33d" },
    ],
    terrain: [
      { id: "home", skin: "floor", x: 48, y: 536, width: 230, height: 34, color: floorColor },
      { id: "low", skin: "floor", x: 500, y: 505, width: 165, height: 32, color: shelfColor },
      { id: "high-right-wall", skin: "floor-wall-right", x: 660, y: 286, width: 278, height: 130, color: shelfColor },
    ],
  },
  {
    id: 4,
    name: "Heavy Guard",
    bombs: 4,
    thrower: { x: 107, y: 524 },
    objects: [
      { id: "e1", kind: "enemy", pos: { x: 690, y: 398 }, radius: 32, mass: 1.85, color: "#d946ef" },
      { id: "e2", kind: "enemy", pos: { x: 900, y: 333 }, radius: 25, mass: 1.25, color: "#ff5a5f" },
      { id: "c1", kind: "crate", pos: { x: 584, y: 405 }, radius: 25, mass: 0.9, color: "#f3b33d" },
      { id: "c2", kind: "crate", pos: { x: 636, y: 405 }, radius: 25, mass: 0.9, color: "#f3b33d" },
      { id: "c3", kind: "crate", pos: { x: 840, y: 334 }, radius: 24, mass: 0.9, color: "#f3b33d" },
    ],
    terrain: [
      { id: "home", skin: "floor", x: 48, y: 536, width: 230, height: 34, color: floorColor },
      { id: "lower-shelf", skin: "floor", x: 548, y: 422, width: 205, height: 34, color: shelfColor },
      { id: "upper-shelf", skin: "floor", x: 810, y: 350, width: 140, height: 34, color: shelfColor },
    ],
  },
  {
    id: 5,
    name: "Last Bounce",
    bombs: 4,
    thrower: { x: 107, y: 524 },
    objects: [
      { id: "e1", kind: "enemy", pos: { x: 520, y: 336 }, radius: 24, color: "#ff5a5f" },
      { id: "e2", kind: "enemy", pos: { x: 720, y: 438 }, radius: 25, color: "#ff5a5f" },
      { id: "e3", kind: "enemy", pos: { x: 830, y: 337 }, radius: 25, color: "#ff5a5f" },
      { id: "c1", kind: "crate", pos: { x: 600, y: 439 }, radius: 24, mass: 0.75, color: "#38bdf8" },
      { id: "c2", kind: "crate", pos: { x: 780, y: 338 }, radius: 24, mass: 0.75, color: "#f3b33d" },
    ],
    terrain: [
      { id: "home", skin: "floor", x: 48, y: 536, width: 230, height: 34, color: floorColor },
      { id: "top-left-wall", skin: "floor-wall-left", x: 450, y: 284, width: 165, height: 110, color: shelfColor },
      { id: "middle", skin: "floor", x: 565, y: 455, width: 200, height: 32, color: shelfColor },
      { id: "top-right-wall", skin: "floor-wall-right", x: 760, y: 269, width: 190, height: 132, color: shelfColor },
    ],
  },
];
