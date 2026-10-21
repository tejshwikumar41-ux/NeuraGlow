export const ENGINE_CONFIG = {
  ppt: {
    name: "Presentation Deck",
    icon: "Presentation",
    description: "Gamma-style visual slide deck",
    component: "PPTEngine"
  },
  slides: {
    name: "Presentation Deck",
    icon: "Presentation",
    description: "Slide-by-slide lesson",
    component: "PPTEngine"
  },
  interactive_simulator: {
    name: "Interactive Simulator",
    icon: "Zap",
    description: "PhET & PythonTutor interactive model",
    component: "InteractiveSimulatorEngine"
  },
  simulator: {
    name: "Interactive Simulator",
    icon: "Zap",
    description: "PhET & PythonTutor interactive model",
    component: "InteractiveSimulatorEngine"
  },
  knowledge_map: {
    name: "Knowledge Map",
    icon: "GitBranch",
    description: "Visual concept breakdown",
    component: "KnowledgeMapEngine"
  },
  steps: {
    name: "Step-by-Step Guide",
    icon: "ListOrdered",
    description: "Learn progressively",
    component: "StepsEngine"
  },
  practice: {
    name: "Practice & Quiz",
    icon: "HelpCircle",
    description: "Test your understanding",
    component: "PracticeEngine"
  },
  audio: {
    name: "Audio Lesson",
    icon: "Headphones",
    description: "Listen and learn",
    component: "AudioLessonEngine"
  },
  tutor: {
    name: "AI Tutor",
    icon: "MessageSquare",
    description: "Ask follow-up questions",
    component: "TutorEngine"
  },
  deep_guide: {
    name: "Deep Research Guide",
    icon: "BookOpen",
    description: "Complete detailed guide",
    component: "DeepGuideEngine"
  }
};

export const getEngineName = (key) => ENGINE_CONFIG[key]?.name || key;
export const getEngineIcon = (key) => ENGINE_CONFIG[key]?.icon || "Circle";
