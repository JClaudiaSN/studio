import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId } = await params;
  const { type, content } = await request.json();

  if (!type || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });
    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });

    let responseData;

    if (type === 'reading') {
      const materialRequestBody = {
        title: `Reading Material - ${new Date().toLocaleDateString()}`,
        description: content,
        state: 'PUBLISHED',
      };
      const classroomResponse = await classroom.courses.courseWorkMaterials.create({
        courseId: courseId,
        requestBody: materialRequestBody,
      });
      responseData = classroomResponse.data;
    } else if (type === 'assignment') {
      const assignmentRequestBody = {
        title: `Assignment - ${new Date().toLocaleDateString()}`,
        description: content,
        workType: 'ASSIGNMENT',
        state: 'PUBLISHED',
      };
      const classroomResponse = await classroom.courses.courseWork.create({
        courseId: courseId,
        requestBody: assignmentRequestBody,
      });
      responseData = classroomResponse.data;
    } else if (type === 'quiz') {
      // For quizzes, you might typically create a Google Form and link it.
      // For this example, we'll create a CourseWork with a description containing the quiz content.
      // A more complete implementation would involve Google Forms API or similar.
      const quizRequestBody = {
        title: `Quiz - ${new Date().toLocaleDateString()}`,
        description: content,
        workType: 'ASSIGNMENT', // Using ASSIGNMENT for simplicity to include description
        state: 'PUBLISHED',
      };
      const classroomResponse = await classroom.courses.courseWork.create({
        courseId: courseId,
        requestBody: quizRequestBody,
      });
      responseData = classroomResponse.data;
    } else {
      return NextResponse.json({ error: 'Invalid material type' }, { status: 400 });
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Error creating Google Classroom material:', error);
    const errorMessage = error.response?.data?.error?.message || 'Failed to create material';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// This part of the original code seems to be for handling image/audio uploads,
// which is different from the current request to handle text-based course materials.
// I'm commenting it out or removing it as it doesn't fit the new requirements.
/*
    // Original logic for image/audio upload - commented out
      const audioDriveFileId = audioDriveResponse.data.id;
      if (!audioDriveFileId) throw new Error('Failed to upload audio to Google Drive');

      await drive.permissions.create({ fileId: audioDriveFileId, requestBody: { role: 'reader', type: 'anyone' } });
      
      // 2b. Assemble material with both image and audio
      materialRequestBody = {
          title: `Material with Audio Summary`,
          description: description,
          materials: [
              { driveFile: { driveFile: { id: driveFileId }, shareMode: 'VIEW' } },
              { driveFile: { driveFile: { id: audioDriveFileId }, shareMode: 'VIEW' } },
          ],
          state: 'PUBLISHED',
      };
    } else {
        // This is the original logic for an image with alt text
        materialRequestBody = {
            title: `AI Generated Image`,
            description: altText,
            materials: [{ driveFile: { driveFile: { id: driveFileId }, shareMode: 'VIEW' } }],
            state: 'PUBLISHED',
        };
    }
*/