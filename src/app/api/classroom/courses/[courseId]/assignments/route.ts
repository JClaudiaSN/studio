import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId } = params;
  const { title, description } = await request.json();

  if (!title || !description) {
    return NextResponse.json({ error: 'Missing title or description' }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const docs = google.docs({ version: 'v1', auth: oauth2Client });
    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });

    // 1. Create a Google Doc with the quiz content
    const docResponse = await docs.documents.create({
      requestBody: {
        title: title,
      },
    });

    const docId = docResponse.data.documentId;
    if (!docId) {
      throw new Error('Failed to create Google Doc');
    }

    await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
            requests: [
                {
                    insertText: {
                        text: description,
                        location: {
                            index: 1,
                        },
                    },
                },
            ],
        },
    });

    // We don't need to make the doc public like the image, as Classroom will handle permissions when attaching it.

    // 2. Create a new assignment in Google Classroom
    const assignment = {
      title: title,
      description: 'Please complete the quiz in the attached Google Doc.',
      workType: 'ASSIGNMENT',
      materials: [
        {
          driveFile: {
            driveFile: {
              id: docId,
            },
            shareMode: 'STUDENT_COPY', // Give each student their own copy to edit
          },
        },
      ],
      state: 'PUBLISHED',
    };

    const classroomResponse = await classroom.courses.courseWork.create({
      courseId: courseId,
      requestBody: assignment,
    });

    return NextResponse.json(classroomResponse.data);
  } catch (error: any) {
    console.error('Error creating Google Classroom assignment:', error);
    const errorMessage = error.response?.data?.error?.message || 'Failed to create assignment';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
