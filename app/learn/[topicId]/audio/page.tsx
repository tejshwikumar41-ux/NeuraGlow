import TopicLearningHub from '../page';

export default function AudioSubpage({ params }: { params: Promise<{ topicId: string }> }) {
  return <TopicLearningHub params={params} initialEngine="audio" />;
}
