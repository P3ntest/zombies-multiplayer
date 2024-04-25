import { mapRouter } from "./../../../../../server/src/trpc/mapRouter";
import Matter from "matter-js";
import { getObstacles } from "../zombieLogic";
import PF from "pathfinding";

export type PathFindingGrid = {
  width: number;
  height: number;
  data: number[][];
  pfGrid: PF.Grid;
  mapPointToGrid: (point: {
    x: number;
    y: number;
  }) => { x: number; y: number } | null;
  mapGridToPoint: (gridPoint: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  centerCoordinates: { x: number; y: number };
};

let cachedGridHash: string | null = null;
let cachedGrid: PathFindingGrid | null = null;

// we generate an image
export function generateObstaclePathFindingGrid(minSize?: {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}) {
  const obstacles = getObstacles();

  const verticesHash = obstacles
    .map((body) =>
      body.vertices
        .map((vertex) => Math.round(vertex.x) + ":" + Math.round(vertex.y))
        .join(",")
    )
    .join(";");

  if (cachedGridHash === verticesHash) {
    return cachedGrid!;
  }

  // find the min and max x and y
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  obstacles.forEach((body) => {
    body.vertices.forEach((vertex) => {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
    });
  });

  if (minSize) {
    minX = Math.min(minSize.minX, minX);
    minY = Math.min(minSize.minY, minY);
    maxX = Math.max(minSize.maxX, maxX);
    maxY = Math.max(minSize.maxY, maxY);
  }

  const resolution = 0.01; // grid fields per pixel

  // add two fields of padding

  minX -= 2 / resolution;
  minY -= 2 / resolution;
  maxX += 2 / resolution;
  maxY += 2 / resolution;

  const width = Math.ceil((maxX - minX) * resolution);
  const height = Math.ceil((maxY - minY) * resolution);
  const grid = new Array(width).fill(null).map(() => new Array(height).fill(0));

  const paddedObstacles = obstacles.map((body) => {
    const PADDING = 200;
    // we want to add padding around the vertices
    const middle = Matter.Vertices.centre(body.vertices);
    const paddedVertices = body.vertices.map((vertex) => {
      const angle = Math.atan2(vertex.y - middle.y, vertex.x - middle.x);
      return {
        x: vertex.x + Math.cos(angle) * PADDING,
        y: vertex.y + Math.sin(angle) * PADDING,
      };
    });
    return paddedVertices;
  });

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const point = {
        x: minX + x / resolution,
        y: minY + y / resolution,
      };

      const isObstacle = paddedObstacles.some((vertices) =>
        Matter.Vertices.contains(vertices, point)
      );

      grid[x][y] = isObstacle ? 1 : 0;
    }
  }

  const mapPointToGrid = (point: { x: number; y: number }) => {
    // check if the point is outside of the grid
    if (point.x < minX || point.y < minY || point.x > maxX || point.y > maxY) {
      return null;
    }
    return {
      x: Math.round((point.x - minX) * resolution),
      y: Math.round((point.y - minY) * resolution),
    };
  };

  const mapGridToPoint = (gridPoint: { x: number; y: number }) => ({
    x: minX + gridPoint.x / resolution,
    y: minY + gridPoint.y / resolution,
  });

  cachedGridHash = verticesHash;
  cachedGrid = {
    width,
    height,
    data: grid,
    pfGrid: new PF.Grid(grid),
    mapPointToGrid,
    mapGridToPoint,
    centerCoordinates: {
      x: minX + width / 2 / resolution,
      y: minY + height / 2 / resolution,
    },
  };

  return cachedGrid!;
}
