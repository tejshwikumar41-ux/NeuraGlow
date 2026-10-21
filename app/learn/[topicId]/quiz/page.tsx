import TopicLearningHub from '../page';

export default function QuizSubpage({ params }: { params: Promise<{ topicId: string }> }) {
  return <TopicLearningHub params={params} initialEngine="quiz" />;
}
