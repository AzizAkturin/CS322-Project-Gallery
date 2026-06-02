import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Project } from '@/lib/types';

const DB = 'cs322gallery';
const COLL = 'projects';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? '';
    const topic = searchParams.get('topic') ?? '';

    const client = await clientPromise;
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (topic) {
      filter.topic = topic;
    }

    const projects = await client
      .db(DB)
      .collection<Project>(COLL)
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json(projects);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, studentName, linkedinUrl, description, topic,
      techStack, aiToolsUsed, repoUrl, videoUrl, imageUrl,
    } = body;

    if (!title?.trim() || !studentName?.trim() || !description?.trim() || !repoUrl?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const project: Project = {
      title: title.trim(),
      studentName: studentName.trim(),
      linkedinUrl: linkedinUrl?.trim() || undefined,
      description: description.trim(),
      topic: topic?.trim() || 'Other',
      techStack: Array.isArray(techStack) ? techStack : [],
      aiToolsUsed: (aiToolsUsed ?? '').trim(),
      repoUrl: repoUrl.trim(),
      videoUrl: videoUrl?.trim() || undefined,
      imageUrl: imageUrl?.trim() || undefined,
      createdAt: new Date(),
    };

    const client = await clientPromise;
    const result = await client.db(DB).collection<Project>(COLL).insertOne(project);

    return NextResponse.json({ ...project, _id: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
