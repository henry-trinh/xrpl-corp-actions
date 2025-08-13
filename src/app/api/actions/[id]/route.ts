// src/app/api/actions/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAction } from "@/lib/dev-store";

// TODO: Replace with Firebase Firestore doc query
// const docRef = doc(db, 'actions', params.id)
// const docSnap = await getDoc(docRef)
// if (!docSnap.exists()) {
//   return NextResponse.json({ error: 'Action not found' }, { status: 404 })
// }
// const action = { id: docSnap.id, ...docSnap.data() }

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const action = getAction(id);
  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }
  return NextResponse.json(action);
}