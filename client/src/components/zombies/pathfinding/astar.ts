import PF from "pathfinding";
import { generateObstaclePathFindingGrid } from "./grid";
import { getObstacles } from "../zombieLogic";
import Matter from "matter-js";
import { usePaddedLevelBounds } from "../../level/levelContext";

export function useCalculateNextPointPathFinding() {
  const levelBounds = usePaddedLevelBounds();
  return function calculateNextPointPathFinding(
    start: { x: number; y: number },
    end: { x: number; y: number },
    zombieSizeMultiplier: number
  ) {
    const obstacles = getObstacles();
    const grid = generateObstaclePathFindingGrid(
      levelBounds,
      zombieSizeMultiplier
    );
    const startGridPoint = findClosestWalkablePoint(
      grid.data,
      grid.mapPointToGrid(start) ?? grid.mapPointToGrid(grid.centerCoordinates)!
    );
    const endGridPoint = findClosestWalkablePoint(
      grid.data,
      grid.mapPointToGrid(end) ?? grid.mapPointToGrid(grid.centerCoordinates)!
    );

    const finder = new PF.AStarFinder({
      heuristic: PF.Heuristic.euclidean,
    });

    const pathPoints = finder
      .findPath(
        startGridPoint.y, // y and x are flipped in the grid, so we need to flip them here
        startGridPoint.x,
        endGridPoint.y,
        endGridPoint.x,
        new PF.Grid(grid.data)
      )
      .map(([y, x]) => ({ x, y }));

    if (pathPoints.length === 0) {
      console.log("No path found");
      return null;
    }

    const pointsICanSee = [];

    let furthestVisiblePoint = 0;
    while (
      Matter.Query.ray(
        obstacles,
        start,
        grid.mapGridToPoint(pathPoints[furthestVisiblePoint]),
        40 * 2 * zombieSizeMultiplier
      ).length === 0
    ) {
      pointsICanSee.push(pathPoints[furthestVisiblePoint]);
      furthestVisiblePoint++;
      if (furthestVisiblePoint >= pathPoints.length - 1) {
        break;
      }
    }

    const nextPoint = grid.mapGridToPoint(pathPoints[furthestVisiblePoint]);
    printPathFindingGrid(
      grid.data,
      pointsICanSee,
      startGridPoint,
      endGridPoint,
      {
        O: grid.mapPointToGrid(start)!,
        D: grid.mapPointToGrid(end)!,
      }
    );
    return nextPoint;
  };
}

export function printPathFindingGrid(
  grid: number[][],
  pathPoints: { x: number; y: number }[],
  startGridPoint: { x: number; y: number },
  endGridPoint: { x: number; y: number },
  otherPoints: {
    [key: string]: {
      x: number;
      y: number;
    };
  }
) {
  return;
  const otherPointIndex = Object.entries(otherPoints).reduce(
    (acc, [key, value]) => {
      const { x, y } = value;
      acc[x + ":" + y] = key;
      return acc;
    },
    {} as {
      [key: string]: string;
    }
  );
  // log out the map to see the path
  let total = "";
  for (let y = 0; y < grid[0].length; y++) {
    let row = "";
    for (let x = 0; x < grid.length; x++) {
      if (x === startGridPoint.x && y === startGridPoint.y) {
        row += "S";
      } else if (x === endGridPoint.x && y === endGridPoint.y) {
        row += "E";
      } else if (pathPoints.find((point) => point.x === x && point.y === y)) {
        row += "x";
      } else if (otherPointIndex[x + ":" + y]) {
        row += otherPointIndex[x + ":" + y];
      } else {
        row += grid[x][y] === 1 ? "#" : " ";
      }
    }
    total += row + "\n";
  }
  console.log("%c" + total, "font-family: monospace;");
}

/**
 * Searches the neighboring points of a grid point for the closest walkable point
 */
function findClosestWalkablePoint(
  grid: number[][],
  startGridPoint: { x: number; y: number }
) {
  if (grid[startGridPoint.x]?.[startGridPoint.y] === 0) {
    return startGridPoint;
  }
  for (let radius: number = 1; radius < 100; radius++) {
    for (
      let y = startGridPoint.y - radius;
      y <= startGridPoint.y + radius;
      y++
    ) {
      for (
        let x = startGridPoint.x - radius;
        x <= startGridPoint.x + radius;
        x++
      ) {
        if (grid[x]?.[y] === 0) {
          // check if the point is outside of the grid
          if (x < 0 || y < 0 || x >= grid.length || y >= grid[0].length) {
            continue;
          }
          return { x, y };
        }
      }
    }
  }
  return startGridPoint;
}
