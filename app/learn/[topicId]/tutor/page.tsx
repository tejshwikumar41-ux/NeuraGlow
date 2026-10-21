import TopicLearningHub from '../page';

export default function TutorSubpage({ params }: { params: Promise<{ topicId: string }> }) {
  return <TopicLearningHub params={params} initialEngine="tutor" />;
}
