import { NextRequest, NextResponse } from "next/server";
import { deleteBffSession } from "@/server/bffSessionStore";

export async function POST(request: NextRequest) {
  const sid = request.cookies.get("dd_sid")?.value;

  if (sid) {
    deleteBffSession(sid);
  }

  const response = NextResponse.json({ message: "logged out" });

  response.cookies.set("dd_sid", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

