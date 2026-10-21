'use client';

import React from 'react';
import TopicLearningHub from '../page';

export default function FlashcardsSubroute({
  params,
}: {
  params: Promise<{ topicId: string }> | { topicId: string };
}) {
  return <TopicLearningHub params={params} initialEngine="flashcards" />;
}
