import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  const classroom = google.classroom({ version: 'v1', auth: oauth2Client });

  try {
    const res = await classroom.courses.list({
      courseStates: ['ACTIVE'],
    });

    const courses = res.data.courses || [];
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching Google Classroom courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
