import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

/**
 * Serves the global exercise library from src/data/exercises.json
 * Used by the admin dashboard workout plans to allow adding exercises from the LifeSet library
 */
export async function GET() {
  try {
    const exercisesPath = path.join(process.cwd(), "..", "src", "data", "exercises.json");
    const data = fs.readFileSync(exercisesPath, "utf-8");
    const exercises = JSON.parse(data);
    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error loading exercises:", error);
    return NextResponse.json([], { status: 200 });
  }
}
