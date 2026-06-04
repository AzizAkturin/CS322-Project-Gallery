import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Project } from '@/lib/types';

const DB = 'cs322gallery';
const COLL = 'projects';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const client = await clientPromise();
    const project = await client
      .db(DB)
      .collection<Project>(COLL)
      .findOne({ _id: new ObjectId(id) });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (err) {
    console.error('GET /api/projects/[id] error:', err);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const passphrase = request.headers.get('x-admin-passphrase') ?? '';
  const correct = process.env.ADMIN_PASSPHRASE;
  if (!correct || passphrase !== correct) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const client = await clientPromise();
    const result = await client
      .db(DB)
      .collection<Project>(COLL)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status: 'approved' } },
        { returnDocument: 'after' }
      );

    if (!result) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('PATCH /api/projects/[id] error:', err);
    return NextResponse.json({ error: 'Failed to approve project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const passphrase = request.headers.get('x-admin-passphrase') ?? '';
  const correct = process.env.ADMIN_PASSPHRASE;
  if (!correct || passphrase !== correct) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const client = await clientPromise();
    const result = await client
      .db(DB)
      .collection<Project>(COLL)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/projects/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
