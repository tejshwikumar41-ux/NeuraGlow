'use client';

import React from 'react';
import TopicLearningHub from '../page';

export default function QuestionsSubroute({
  params,
}: {
  params: Promise<{ topicId: string }> | { topicId: string };
}) {
  return <TopicLearningHub params={params} initialEngine="questions" />;
}
