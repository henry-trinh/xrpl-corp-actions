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

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const action = getAction(params.id);
  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }
  return NextResponse.json(action);
}
