import TopicLearningHub from '../page';

export default function NotesSubpage({ params }: { params: Promise<{ topicId: string }> }) {
  return <TopicLearningHub params={params} initialEngine="notes" />;
}
