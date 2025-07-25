import { server } from "../main";
import { players } from "./server";

const colors: string[] = ["#ff0000", "#ffff00", "#008000", "#0000ff"] as const;
let availableColors = [...colors];
let inUseColors: string[] = [];

const TICKRATE = 20;
const TICK_DURATION = BigInt(1_000_000_000) / BigInt(TICKRATE);
let last: bigint = BigInt(Bun.nanoseconds());

export let stats = {
  min: 0,
  max: 0,
  avg: 0,
  ticks: 0
}

export function getColor(): string | undefined {
  if (availableColors.length === 0) return undefined;
  const color = availableColors.shift()!;
  inUseColors.push(color);
  return color;
}

export function releaseColor(color: string): void {
  const index = inUseColors.indexOf(color);
  if (index !== -1) {
    inUseColors.splice(index, 1);
    availableColors.push(color);
  }
}

export async function timeLoop(): Promise<void> {
  const now: bigint = BigInt(Bun.nanoseconds());
  const delta: bigint = now - last;

  gameLoop();

  last = now;

  const duration: bigint = BigInt(Bun.nanoseconds()) - now;
  const delay: bigint = TICK_DURATION - duration;

  // update some stats
  stats.ticks += 1;



  if (delay > 0) {
    const delayMs: number = Number(delay) / 1_000_000; // ns -> ms
    setTimeout(() => void timeLoop(), delayMs);
  } else {
    setImmediate(() => void timeLoop());
  }

}

export function gameLoop(): void {
  // stop game loop if no one is playing...
  if (players.length === 0) return;

  // Handle movement...
  players.forEach((player) => {
    if (player.key === "w" && player.position.y > 0) player.position.y -= 1;
    if (player.key === "s" && player.position.y < 63) player.position.y += 1;
    if (player.key === "a" && player.position.x > 0) player.position.x -= 1;
    if (player.key === "d" && player.position.x < 63) player.position.x += 1;
  })

  const gameState: any = [];

  players.forEach((player) => {
    const obj = {
      color: player.color,
      position: player.position
    }
    gameState.push(obj);
  })

  server.publish("players", JSON.stringify({
    type: "GAME",
    data: gameState
  }))
}