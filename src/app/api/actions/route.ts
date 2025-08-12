import { NextResponse } from "next/server"
import { mockActions } from "@/lib/mock-data"

export async function GET() {
  // TODO: Replace with Firebase Firestore query
  // const actionsRef = collection(db, 'actions')
  // const snapshot = await getDocs(actionsRef)
  // const actions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  return NextResponse.json(mockActions)
}

export async function POST(request: Request) {
  const body = await request.json()

  // TODO: Replace with Firebase Firestore add
  // const docRef = await addDoc(collection(db, 'actions'), {
  //   ...body,
  //   createdAt: new Date().toISOString(),
  //   status: 'draft'
  // })

  const newAction = {
    id: `action-${Date.now()}`,
    ...body,
    createdAt: new Date().toISOString(),
    status: "draft",
    memoHex: Buffer.from(JSON.stringify(body.memoJson)).toString("hex"),
  }

  return NextResponse.json(newAction, { status: 201 })
}
