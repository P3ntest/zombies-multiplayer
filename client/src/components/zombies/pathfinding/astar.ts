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
    zombieWidth: number = 40
  ) {
    const obstacles = getObstacles();
    const grid = generateObstaclePathFindingGrid(levelBounds);
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
        zombieWidth
      ).length === 0
    ) {
      pointsICanSee.push(pathPoints[furthestVisiblePoint]);
      furthestVisiblePoint++;
      if (furthestVisiblePoint >= pathPoints.length) {
        break;
      }
    }

    const nextPoint = grid.mapGridToPoint(pathPoints[furthestVisiblePoint]);
    printPathFindingGrid(
      grid.data,
      pointsICanSee,
      startGridPoint,
      endGridPoint
    );
    return nextPoint;
  };
}

export function printPathFindingGrid(
  grid: number[][],
  pathPoints: { x: number; y: number }[],
  startGridPoint: { x: number; y: number },
  endGridPoint: { x: number; y: number }
) {
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
  startGridPoint: { x: number; y: number },
  depth: number = 0
) {
  if (depth > 3) {
    return startGridPoint;
  }
  if (grid[startGridPoint.x][startGridPoint.y] === 0) {
    return startGridPoint;
  }
  const immediateNeighbors = [
    { x: startGridPoint.x + 1, y: startGridPoint.y },
    { x: startGridPoint.x - 1, y: startGridPoint.y },
    { x: startGridPoint.x, y: startGridPoint.y + 1 },
    { x: startGridPoint.x, y: startGridPoint.y - 1 },
  ].filter(
    (point) =>
      point.x >= 0 &&
      point.x < grid.length &&
      point.y >= 0 &&
      point.y < grid[0].length
  );
  const closestWalkablePoint = immediateNeighbors.find(
    (point) => grid[point.x][point.y] === 0
  );
  if (closestWalkablePoint) {
    return closestWalkablePoint;
  }
  return findClosestWalkablePoint(grid, immediateNeighbors[0], depth + 1);
}
