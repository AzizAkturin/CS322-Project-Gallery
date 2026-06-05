import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Project } from '@/lib/types';

const DB = 'cs322gallery';
const COLL = 'projects';

// Escape regex metacharacters so user search is treated as a literal string,
// preventing ReDoS via crafted patterns like (a+)+
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isSafeUrl(value: unknown): boolean {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? '';
    const topic = searchParams.get('topic') ?? '';

    const client = await clientPromise();
    const conditions: Record<string, unknown>[] = [
      { $or: [{ status: 'approved' }, { status: { $exists: false } }] },
    ];
    if (search) {
      const safe = escapeRegex(search.slice(0, 200));
      conditions.push({
        $or: [
          { title: { $regex: safe, $options: 'i' } },
          { studentName: { $regex: safe, $options: 'i' } },
          { description: { $regex: safe, $options: 'i' } },
        ],
      });
    }
    if (topic) {
      conditions.push({ topic: String(topic).slice(0, 100) });
    }
    const filter = conditions.length === 1 ? conditions[0] : { $and: conditions };

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

    // Explicit string cast prevents object injection via JSON body
    const classPassphrase = typeof body.classPassphrase === 'string' ? body.classPassphrase : '';
    const correctClassPass = process.env.CLASS_PASSPHRASE;
    if (correctClassPass && classPassphrase !== correctClassPass) {
      return NextResponse.json({ error: 'Incorrect class passphrase.' }, { status: 401 });
    }

    const { title, studentName, linkedinUrl, tagline, description, topic,
            techStack, aiToolsUsed, repoUrl, videoUrl, imageUrl } = body;

    if (typeof title !== 'string' || typeof studentName !== 'string' ||
        typeof description !== 'string' || typeof repoUrl !== 'string') {
      return NextResponse.json({ error: 'Invalid field types.' }, { status: 400 });
    }

    if (!title.trim() || !studentName.trim() || !description.trim() || !repoUrl.trim()) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (!isSafeUrl(repoUrl)) {
      return NextResponse.json({ error: 'Repository URL must be a valid http/https URL.' }, { status: 400 });
    }
    if (linkedinUrl && !isSafeUrl(linkedinUrl)) {
      return NextResponse.json({ error: 'LinkedIn URL must be a valid http/https URL.' }, { status: 400 });
    }
    if (videoUrl && !isSafeUrl(videoUrl)) {
      return NextResponse.json({ error: 'Video URL must be a valid http/https URL.' }, { status: 400 });
    }
    if (imageUrl && !isSafeUrl(imageUrl)) {
      return NextResponse.json({ error: 'Image URL must be a valid http/https URL.' }, { status: 400 });
    }

    const safeStack: string[] = Array.isArray(techStack)
      ? techStack.filter((t): t is string => typeof t === 'string').map((t) => t.trim()).filter(Boolean)
      : [];

    const project: Project = {
      title: title.trim().slice(0, 200),
      studentName: studentName.trim().slice(0, 200),
      linkedinUrl: linkedinUrl?.trim() || undefined,
      tagline: typeof tagline === 'string' ? tagline.trim().slice(0, 200) || undefined : undefined,
      description: description.trim().slice(0, 5000),
      topic: typeof topic === 'string' ? topic.trim().slice(0, 100) || 'Other' : 'Other',
      techStack: safeStack,
      aiToolsUsed: typeof aiToolsUsed === 'string' ? aiToolsUsed.trim().slice(0, 1000) : '',
      repoUrl: repoUrl.trim(),
      videoUrl: videoUrl?.trim() || undefined,
      imageUrl: imageUrl?.trim() || undefined,
      createdAt: new Date(),
      status: 'pending',
    };

    const client = await clientPromise();
    const result = await client.db(DB).collection<Project>(COLL).insertOne(project);

    return NextResponse.json({ ...project, _id: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
