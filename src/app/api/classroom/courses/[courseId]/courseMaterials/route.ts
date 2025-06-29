import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sub } from 'date-fns';

export async function POST(request: Request, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId } = await params;
  const { studyMaterials, evaluations, quizzes , subject} = await request.json();

  if (!studyMaterials && !evaluations && !quizzes) {
    return NextResponse.json({ error: 'No material content provided' }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });
    const results: any = {};

    let topicId = null;
    if (subject) {
      try {
        const topicResponse = await classroom.courses.topics.create({
          courseId: courseId,
          requestBody: {
            name: subject
          }
        })
        // console.log(topicResponse)
        topicId = topicResponse.data.topicId;
      } catch (error: any) {
        console.error('Error creating subject:', error);
      }
    }
    // Create Study Materials (CourseWorkMaterial)
    if (studyMaterials) {
      try {
        const materialResponse = await classroom.courses.courseWorkMaterials.create({
          courseId: courseId,
          requestBody: {
            title: 'Study Materials', // You might want to make this more dynamic
            description: studyMaterials,
            state: 'PUBLISHED',
            topicId: topicId
          },
        });
        results.studyMaterials = materialResponse.data;
      } catch (error: any) {
        console.error('Error creating study materials:', error);
        results.studyMaterials = { error: error.message || 'Failed to create study materials' };
      }
    }

    // Create Evaluations (CourseWork - Assignment)
    if (evaluations) {
      try {
        const assignmentResponse = await classroom.courses.courseWork.create({
          courseId: courseId,
          requestBody: {
            title: 'Evaluations', // You might want to make this more dynamic
            description: evaluations,
            workType: 'ASSIGNMENT',
            state: 'PUBLISHED',
            topicId: topicId
          },
        });
        results.evaluations = assignmentResponse.data;
      } catch (error: any) {
        console.error('Error creating evaluations:', error);
        results.evaluations = { error: error.message || 'Failed to create evaluations' };
      }
    }

    // Create Quizzes (CourseWork - Quiz)
    if (quizzes) {
      try {
        const regex = /Q: (.*)\? Opt1: (.*) Opt2: (.*) Opt3: (.*) Opt4: (.*)/;
        const matches = quizzes.match(regex);

        let question: string = "";
        let Opt1: string = "";
        let Opt2: string = "";
        let Opt3: string = "";
        let Opt4: string = "";
        
        if (matches) {
          question = matches[1]?.trim() + '?';
          Opt1 = matches[2]?.trim();
          Opt2 = matches[3]?.trim();
          Opt3 = matches[4]?.trim();
          Opt4 = matches[5]?.trim();
        }

        const quizResponse = await classroom.courses.courseWork.create({
          courseId: courseId,
          requestBody: {
            title: 'Quizzes', // You might want to make this more dynamic
            description: question,
            workType: 'MULTIPLE_CHOICE_QUESTION', // Or 'MULTIPLE_CHOICE_QUESTION' depending on quiz format
            state: 'PUBLISHED',
            topicId: topicId,
            multipleChoiceQuestion: {
              choices: [Opt1, Opt2, Opt3, Opt4]
            }
          },
        });
        results.quizzes = quizResponse.data;
      } catch (error: any) {
        console.error('Error creating quizzes:', error);
        results.quizzes = { error: error.message || 'Failed to create quizzes' };
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error processing course material generation:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}