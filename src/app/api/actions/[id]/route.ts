import { NextResponse } from "next/server"
import { mockActions } from "@/lib/mock-data"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // TODO: Replace with Firebase Firestore doc query
  // const docRef = doc(db, 'actions', params.id)
  // const docSnap = await getDoc(docRef)
  // if (!docSnap.exists()) {
  //   return NextResponse.json({ error: 'Action not found' }, { status: 404 })
  // }
  // const action = { id: docSnap.id, ...docSnap.data() }

  const action = mockActions.find((a) => a.id === params.id)

  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 })
  }

  return NextResponse.json(action)
}
