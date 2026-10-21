import TopicLearningHub from '../page';

export default function SlidesSubpage({ params }: { params: Promise<{ topicId: string }> }) {
  return <TopicLearningHub params={params} initialEngine="slides" />;
}
