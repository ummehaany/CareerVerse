import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionCookie } from "@/lib/firebase/auth";
import { ensureUser } from "@/lib/firebase/firestore/users";
import { ensureCareerProfile } from "@/lib/firebase/firestore/careerProfiles";

const isProduction = process.env.NODE_ENV === "production";

/**
 * POST — verify the client's ID token, bootstrap the user's Firestore
 * documents (idempotent), and set the session cookie.
 */
export async function POST(request: Request) {
  let idToken: unknown;
  try {
    ({ idToken } = await request.json());
  } catch {
    return NextResponse.json(
      { error: { code: "invalid-request", message: "Malformed request body." } },
      { status: 400 },
    );
  }

  if (typeof idToken !== "string" || idToken.length === 0) {
    return NextResponse.json(
      { error: { code: "invalid-request", message: "Missing ID token." } },
      { status: 400 },
    );
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Account bootstrap: create users/{uid} + careerProfiles/{uid} if absent.
    await ensureUser({
      uid: decoded.uid,
      email: decoded.email ?? null,
      displayName: decoded.name ?? null,
      photoURL: decoded.picture ?? null,
    });
    await ensureCareerProfile(decoded.uid);

    const sessionCookie = await createSessionCookie(idToken);
    const response = NextResponse.json({ data: { uid: decoded.uid } });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: sessionCookie,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: { code: "auth-failed", message: "Could not create session." } },
      { status: 401 },
    );
  }
}

/** DELETE — clear the session cookie (sign out). */
export async function DELETE() {
  const response = NextResponse.json({ data: { success: true } });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
