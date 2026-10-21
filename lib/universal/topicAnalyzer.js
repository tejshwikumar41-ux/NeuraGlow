import { callUniversalLLM } from '@/lib/ai/universalAI';

export async function analyzeTopicUniversal(rawTopic) {
  const cleanTopic = cleanUserTopicString(rawTopic);

  const systemPrompt = `You are an expert pedagogy architect analyzing how to teach ANY topic.
Your mission is to analyze this topic with ZERO domain bias.
A history topic must be recognized as history. A literature topic as literature. A programming topic as technology. A spiritual/philosophical text as philosophy/religion.

Return ONLY a strict raw JSON blueprint with this EXACT structure:
{
  "topic_normalized": "cleaned/corrected topic name",
  "domain": "science|history|mathematics|literature|technology|arts|philosophy|business|language|medicine|law|religion|psychology|social_science|skill|other",
  "sub_domain": "more specific field (e.g. 'medieval history', 'linear algebra', 'organic chemistry', 'classical literature', 'macroeconomics')",
  "topic_type": "concept|process|event|entity|theory|formula|method|skill|artifact|person|movement|phenomenon|system",
  "scope": "narrow|medium|broad",
  "requires": {
    "mathematical_formulas": false,
    "chemical_equations": false,
    "code_examples": false,
    "historical_timeline": false,
    "geographical_maps": false,
    "biological_diagrams": false,
    "physical_simulations": false,
    "data_visualizations": false,
    "comparative_analysis": false,
    "citations_evidence": false,
    "step_by_step_procedure": false,
    "cause_effect_chains": false,
    "character_analysis": false,
    "artistic_examples": false
  },
  "prerequisites": ["list of topics student should ideally know first"],
  "best_analogies_from": ["domains that provide good analogies for THIS topic"],
  "key_subtopics": [
    {
      "title": "Subtopic name",
      "importance": "critical|important|supplementary",
      "estimated_minutes": 15,
      "learning_order": 1
    }
  ],
  "common_misconceptions": ["things learners typically get wrong about this topic"],
  "real_world_applications": ["where this appears in real life or historical relevance"],
  "best_visualization_type": "diagram|graph|timeline|map|flowchart|animation|simulation|comparison_table|concept_map|photo|artwork|none",
  "best_simulation_type": "physics_engine|data_sliders|code_sandbox|historical_scenario|decision_tree|mathematical_plot|chemistry_builder|none",
  "appropriate_tone": "formal_academic|conversational|storytelling|technical|inspirational",
  "difficulty_spectrum": {
    "beginner_entry_point": "most intuitive way to introduce this",
    "advanced_depth": "deepest/most nuanced aspect"
  },
  "related_topics": ["topics to suggest for further learning"],
  "assessment_types_suitable": ["mcq", "numerical", "essay", "practical", "identification", "analysis"],
  "cultural_context_matters": false,
  "has_controversial_aspects": false,
  "typical_study_duration_hours": 2
}`;

  const prompt = `TOPIC TO ANALYZE: "${cleanTopic}"

Think step by step and return the pedagogical blueprint for this topic.
Adapt your analysis to the ACTUAL nature of "${cleanTopic}":
- A history topic (e.g. French Revolution, Mughal Empire) needs timeline=true, cause_effect_chains=true, simulations="historical_scenario", formulas=false, code=false.
- A math topic (e.g. Calculus) needs formulas=true, best_simulation="mathematical_plot".
- A tech/programming topic (e.g. Recursion, Binary Search) needs code_examples=true, best_simulation="code_sandbox".
- A biology topic (e.g. Photosynthesis, Mitosis) needs biological_diagrams=true, physical_simulations=true, formulas=false.
- A literature/arts topic (e.g. Hamlet, Sufi Poetry) needs character_analysis=true or artistic_examples=true, simulations="decision_tree" or "none".
Output strict raw JSON only.`;

  try {
    const blueprint = await callUniversalLLM({
      prompt,
      systemPrompt,
      json: true,
      temperature: 0.15,
    });

    if (blueprint && blueprint.domain && blueprint.topic_type) {
      return normalizeBlueprint(blueprint, cleanTopic);
    }
  } catch (err) {
    console.warn('[UniversalTopicAnalyzer] AI analysis failed, falling back to heuristic:', err.message);
  }

  return heuristicBlueprintFallback(cleanTopic);
}

function cleanUserTopicString(raw) {
  if (!raw || typeof raw !== 'string') return 'Educational Concept';
  let text = raw.trim()
    .replace(/^explain\s+(me\s+)?(how\s+)?/i, '')
    .replace(/^teach\s+(me\s+)?/i, '')
    .replace(/^what\s+is\s+/i, '')
    .replace(/\s+works?a?$/i, '');
  text = text.replace(/[^a-zA-Z0-9\s\-_'’]/g, '').trim();
  if (!text) return 'Educational Concept';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function normalizeBlueprint(bp, originalTopic) {
  return {
    topic_normalized: bp.topic_normalized || originalTopic,
    domain: bp.domain || 'general',
    sub_domain: bp.sub_domain || bp.domain || 'interdisciplinary',
    topic_type: bp.topic_type || 'concept',
    scope: bp.scope || 'medium',
    requires: {
      mathematical_formulas: !!bp.requires?.mathematical_formulas,
      chemical_equations: !!bp.requires?.chemical_equations,
      code_examples: !!bp.requires?.code_examples,
      historical_timeline: !!bp.requires?.historical_timeline,
      geographical_maps: !!bp.requires?.geographical_maps,
      biological_diagrams: !!bp.requires?.biological_diagrams,
      physical_simulations: !!bp.requires?.physical_simulations,
      data_visualizations: !!bp.requires?.data_visualizations,
      comparative_analysis: !!bp.requires?.comparative_analysis,
      citations_evidence: !!bp.requires?.citations_evidence,
      step_by_step_procedure: !!bp.requires?.step_by_step_procedure,
      cause_effect_chains: !!bp.requires?.cause_effect_chains,
      character_analysis: !!bp.requires?.character_analysis,
      artistic_examples: !!bp.requires?.artistic_examples,
    },
    prerequisites: Array.isArray(bp.prerequisites) ? bp.prerequisites : [],
    best_analogies_from: Array.isArray(bp.best_analogies_from) && bp.best_analogies_from.length > 0
      ? bp.best_analogies_from
      : ['Everyday physical interactions', 'Natural mechanisms'],
    key_subtopics: Array.isArray(bp.key_subtopics) ? bp.key_subtopics : [],
    common_misconceptions: Array.isArray(bp.common_misconceptions) ? bp.common_misconceptions : [],
    real_world_applications: Array.isArray(bp.real_world_applications) ? bp.real_world_applications : [],
    best_visualization_type: bp.best_visualization_type || 'diagram',
    best_simulation_type: bp.best_simulation_type || 'data_sliders',
    appropriate_tone: bp.appropriate_tone || 'conversational',
    difficulty_spectrum: bp.difficulty_spectrum || {
      beginner_entry_point: 'Intuitive foundation',
      advanced_depth: 'Advanced systemic nuances',
    },
    related_topics: Array.isArray(bp.related_topics) ? bp.related_topics : [],
    assessment_types_suitable: Array.isArray(bp.assessment_types_suitable) ? bp.assessment_types_suitable : ['mcq'],
    cultural_context_matters: !!bp.cultural_context_matters,
    has_controversial_aspects: !!bp.has_controversial_aspects,
    typical_study_duration_hours: Number(bp.typical_study_duration_hours) || 2,
  };
}

function heuristicBlueprintFallback(topic) {
  const t = topic.toLowerCase();
  const isHistory = /revolution|war|empire|dynasty|treaty|mughal|battle|century|historical|gandhi|napoleon|caesar/i.test(t);
  const isTech = /code|algorithm|python|react|binary|tree|graph|recursion|javascript|sql|data structure/i.test(t);
  const isMath = /calculus|matrix|derivative|integral|vector|algebra|geometry|theorem|probability/i.test(t);
  const isBio = /cell|photo|dna|gene|protein|organ|plant|mitosis|evolution|respiration/i.test(t);
  const isLit = /hamlet|poem|poetry|novel|shake|gita|philosophy|ethics|kant|stoic/i.test(t);

  let domain = 'science';
  let topic_type = 'concept';
  let best_simulation_type = 'data_sliders';
  let best_visualization_type = 'diagram';

  if (isHistory) {
    domain = 'history';
    topic_type = 'event';
    best_simulation_type = 'historical_scenario';
    best_visualization_type = 'timeline';
  } else if (isTech) {
    domain = 'technology';
    topic_type = 'method';
    best_simulation_type = 'code_sandbox';
    best_visualization_type = 'flowchart';
  } else if (isMath) {
    domain = 'mathematics';
    topic_type = 'formula';
    best_simulation_type = 'mathematical_plot';
    best_visualization_type = 'graph';
  } else if (isLit) {
    domain = 'literature';
    topic_type = 'artifact';
    best_simulation_type = 'decision_tree';
    best_visualization_type = 'concept_map';
  } else if (isBio) {
    domain = 'science';
    topic_type = 'process';
    best_simulation_type = 'data_sliders';
    best_visualization_type = 'diagram';
  }

  return {
    topic_normalized: topic,
    domain,
    sub_domain: domain,
    topic_type,
    scope: 'medium',
    requires: {
      mathematical_formulas: isMath,
      chemical_equations: false,
      code_examples: isTech,
      historical_timeline: isHistory,
      geographical_maps: isHistory,
      biological_diagrams: isBio,
      physical_simulations: !isHistory && !isTech && !isLit,
      data_visualizations: true,
      comparative_analysis: true,
      citations_evidence: isHistory || isLit,
      step_by_step_procedure: isTech || isBio,
      cause_effect_chains: isHistory || isBio,
      character_analysis: isLit,
      artistic_examples: isLit,
    },
    prerequisites: ['Foundational literacy in the domain'],
    best_analogies_from: ['Everyday real-world examples', 'Systemic cause-and-effect'],
    key_subtopics: [
      { title: 'Core Principles', importance: 'critical', estimated_minutes: 15, learning_order: 1 },
      { title: 'Mechanisms & Dynamics', importance: 'critical', estimated_minutes: 20, learning_order: 2 },
      { title: 'Impact & Applications', importance: 'important', estimated_minutes: 15, learning_order: 3 },
    ],
    common_misconceptions: [`Confusing surface observations with underlying drivers of ${topic}`],
    real_world_applications: [`Direct modern influence and practical importance of ${topic}`],
    best_visualization_type,
    best_simulation_type,
    appropriate_tone: isHistory ? 'storytelling' : isTech ? 'technical' : 'conversational',
    difficulty_spectrum: {
      beginner_entry_point: `Fundamental intuitive view of ${topic}`,
      advanced_depth: `Systemic complexity and theoretical limits of ${topic}`,
    },
    related_topics: [`Broader implications of ${topic}`],
    assessment_types_suitable: ['mcq', 'analysis'],
    cultural_context_matters: isHistory || isLit,
    has_controversial_aspects: isHistory,
    typical_study_duration_hours: 2,
  };
}
