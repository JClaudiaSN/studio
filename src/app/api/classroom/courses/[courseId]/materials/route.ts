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
  const { imageDataUri, altText, audioDataUri, description } = await request.json();

  if (!imageDataUri || (!altText && !audioDataUri)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });

    // 1. Upload image to Google Drive
    const mimeType = imageDataUri.match(/data:(.*);base64,/)?.[1] || 'image/png';
    const base64Data = imageDataUri.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const stream = Readable.from(buffer);

    const driveResponse = await drive.files.create({
      requestBody: {
        name: `Generated Image - ${Date.now()}.png`,
        mimeType: mimeType,
      },
      media: {
        mimeType: mimeType,
        body: stream,
      },
    });

    const driveFileId = driveResponse.data.id;
    if (!driveFileId) {
      throw new Error('Failed to upload file to Google Drive');
    }
    
    // 2. Make the file publicly accessible so students can see it
    await drive.permissions.create({
        fileId: driveFileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    let materialRequestBody: any = {};
    // 3. Create a new material in Google Classroom
    if (audioDataUri && description) {
      // 2a. Upload audio file to Google Drive
      const audioMimeType = audioDataUri.match(/data:(.*);base64,/)?.[1] || 'audio/webm';
      const audioBase64Data = audioDataUri.split(',')[1];
      const audioBuffer = Buffer.from(audioBase64Data, 'base64');
      const audioStream = Readable.from(audioBuffer);

      const audioDriveResponse = await drive.files.create({
          requestBody: { name: `Audio Summary - ${Date.now()}.mp3`, mimeType: audioMimeType },
          media: { mimeType: audioMimeType, body: audioStream },
      });

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

    const classroomResponse = await classroom.courses.courseWorkMaterials.create({
      courseId: courseId,
      requestBody: materialRequestBody,
    });

    return NextResponse.json(classroomResponse.data);
  } catch (error: any) {
    console.error('Error creating Google Classroom material:', error);
    const errorMessage = error.response?.data?.error?.message || 'Failed to create material';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
