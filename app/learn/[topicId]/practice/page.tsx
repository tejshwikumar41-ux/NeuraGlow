import TopicLearningHub from '../page';

export default function PracticeSubpage({ params }: { params: Promise<{ topicId: string }> }) {
  return <TopicLearningHub params={params} initialEngine="practice" />;
}
