import { NextResponse } from "next/server";

/** Browser voice transcription uses paid Whisper, which is intentionally disabled. */
export async function POST() {
  return NextResponse.json(
    { error: "Browser voice transcription is currently unavailable." },
    { status: 503 },
  );
}
