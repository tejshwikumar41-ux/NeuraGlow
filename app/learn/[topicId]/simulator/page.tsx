import TopicLearningHub from '../page';

export default function SimulatorSubpage({ params }: { params: Promise<{ topicId: string }> }) {
  return <TopicLearningHub params={params} initialEngine="simulator" />;
}
