import { create } from 'zustand'

export const useLearningStore = create((set) => ({
  topic: '',
  cleanTopic: '',
  category: 'GENERAL',
  fullData: null,
  activeEngine: 'slides',
  deepDiveOpen: false,
  deepDiveContext: null,
  chatHistory: [],

  setTopic: (topic) => set({ topic }),
  setFullData: (fullData, topic) => set({
    fullData,
    topic: topic || fullData?.cleanTopic || '',
    cleanTopic: topic || fullData?.cleanTopic || '',
    category: fullData?.category || 'GENERAL',
  }),
  setActiveEngine: (activeEngine) => set({ activeEngine }),

  openDeepDive: (context) => set({
    deepDiveOpen: true,
    deepDiveContext: context,
    chatHistory: [],
  }),

  closeDeepDive: () => set({ deepDiveOpen: false, deepDiveContext: null }),

  addMessage: (message) => set((state) => ({
    chatHistory: [
      ...state.chatHistory,
      typeof message === 'object'
        ? { timestamp: Date.now(), ...message }
        : { role: 'user', content: String(message), timestamp: Date.now() }
    ]
  })),

  addChatMessage: (role, content, counterQuestion, suggestions) => set((state) => ({
    chatHistory: [
      ...state.chatHistory,
      { role, content, counterQuestion, suggestions, timestamp: Date.now() }
    ]
  })),

  clearChat: () => set({ chatHistory: [] }),
  resetLearningState: () => set({
    topic: '',
    cleanTopic: '',
    category: 'GENERAL',
    fullData: null,
    deepDiveOpen: false,
    deepDiveContext: null,
    chatHistory: [],
  }),
}))

