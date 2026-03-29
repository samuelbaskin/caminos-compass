/**
 * Generates docs/paso-high-score-examples.md — short example answers (target 90%+ with lenient scoring).
 * Run: node server/scripts/generatePasoHighScoreExamples.js
 */
const { writeFileSync } = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "../../docs/paso-high-score-examples.md");

const PASO1_PRE = [
  { key: "q1_positionality", label: "1. Positionality in Relation to Content" },
  { key: "q2_hiddenCurriculum", label: "2. The Hidden Curriculum" },
  { key: "q3_explicitTeaching", label: "3. Explicit Teaching for All Students" },
  { key: "q4_contentKnowledge", label: "4. Knowledge of Content" },
  { key: "q5_learningProcess", label: "5. Your Learning Process" },
  { key: "q6_studentRelationship", label: "6. Connection to Students and Culture" },
  { key: "q7_diversityAffirmation", label: "7. Acknowledging Positionality and Celebrating Diversity" },
  { key: "q8_learnerModeling", label: "8. Modeling as a Learner" },
  { key: "q9_growthMindset", label: "9. Growth Mindset and Mistakes" },
  { key: "q10_preparedness", label: "10. Preparation and Confidence" },
];
const PASO1_OBS = [
  { key: "q1_positionality", label: "1. What aspects of your knowledge of self are you working on through this lesson?" },
  { key: "q2_hiddenCurriculum", label: "2. What evidence can be gathered about your positionality in teaching?" },
  { key: "q3_explicitTeaching", label: "3. What components of the lesson are informed by your knowledge of self?" },
];
const PASO1_POST = [
  { key: "q1_positionality", label: "1. How did your positionality play a role in lesson delivery?" },
  { key: "q2_hiddenCurriculum", label: "2. What did you learn about the content through teaching this lesson?" },
  { key: "q3_explicitTeaching", label: "3. What did you learn about how students learn this content?" },
  { key: "q4_contentKnowledge", label: "4. Where did you succeed in this lesson?" },
  { key: "q5_learningProcess", label: "5. What would you adjust or do differently next time?" },
];

const PASO2_PRE = [
  { key: "q1_studentReadiness", label: "1. Student Readiness" },
  { key: "q2_priorKnowledge", label: "2. Prior Knowledge Assessment" },
  { key: "q3_retentionCheck", label: "3. Retention of Prior Skills" },
  { key: "q4_academicSkills", label: "4. Academic Skills" },
  { key: "q5_skillPatterns", label: "5. Patterns in Academic Skills" },
  { key: "q6_differentiation", label: "6. Differentiation Preparation" },
  { key: "q7_languageProficiency", label: "7. Language Proficiency Support" },
  { key: "q8_fundsOfKnowledge", label: "8. Funds of Knowledge" },
  { key: "q9_familyDynamics", label: "9. Parents and Family Dynamics" },
  { key: "q10_backgroundKnowledge", label: "10. Background Knowledge" },
];
const PASO2_OBS = [
  { key: "q1_studentReadiness", label: "1. Which students should be observed during the lesson?" },
  { key: "q2_priorKnowledge", label: "2. What data can be collected about student performance?" },
  { key: "q3_retentionCheck", label: "3. How can patterns in student academic performance be investigated?" },
];
const PASO2_POST = [
  { key: "q1_studentReadiness", label: "1. What additional information did you learn about student readiness?" },
  { key: "q2_priorKnowledge", label: "2. In what ways were students successful?" },
  { key: "q3_retentionCheck", label: "3. Where did students struggle or need support?" },
  { key: "q4_academicSkills", label: "4. What does the data suggest about next steps?" },
];

const PASO3_PRE = [
  { key: "q1_humanizingPedagogy", label: "1. Humanizing Pedagogy" },
  { key: "q2_presentLearningObjective", label: "2. Presenting Learning Objective" },
  { key: "q3_barriers", label: "3. Barriers" },
  { key: "q4_accommodations", label: "4. Accommodations or Modifications" },
  { key: "q5_resourcesMaterials", label: "5. Resources or Materials" },
  { key: "q6_studentEngagement", label: "6. Student Engagement" },
  { key: "q7_classroomEnvironment", label: "7. Physical Classroom Environment" },
  { key: "q8_relateToLives", label: "8. Relating to Students' Lives" },
  { key: "q9_backgroundKnowledge", label: "9. Background Knowledge or Skills" },
];
const PASO3_OBS = [
  { key: "q1_humanizingPedagogy", label: "1. What should the observer focus on (student engagement, delivery, discourse, wait time)?" },
  { key: "q2_presentLearningObjective", label: "2. How will student success with the learning objective be monitored?" },
  { key: "q3_barriers", label: "3. How will pacing and engagement be evaluated?" },
];
const PASO3_POST = [
  { key: "q1_humanizingPedagogy", label: "1. How did the lesson go overall?" },
  { key: "q2_presentLearningObjective", label: "2. What would you do differently next time?" },
  { key: "q3_barriers", label: "3. What are your next steps for improving instruction?" },
];

const PASO3_PLAN = [
  { key: "lessonTitle", label: "Lesson Title" },
  { key: "gradeLevel", label: "Grade Level" },
  { key: "subjectArea", label: "Subject Area" },
  { key: "lessonObjectives", label: "Lesson Objectives" },
  { key: "lessonStructure", label: "Lesson Structure" },
  { key: "materialsResources", label: "Materials & Resources" },
];

const PASO4_PRE = [
  { key: "q1_equitableAccess", label: "1. Equitable Access to Learning" },
  { key: "q2_supportingEnglishLearners", label: "2. Supporting English Learners" },
  { key: "q3_homeLanguageSupport", label: "3. Home Language Support" },
  { key: "q4_culturalRelevance", label: "4. Cultural Relevance" },
  { key: "q5_engagementRepresentation", label: "5. Engagement, Representation, and Expression" },
  { key: "q6_groupingForEquity", label: "6. Grouping for Equity" },
  { key: "q7_essentialQuestionRelevance", label: "7. Essential Question Relevance" },
];
const PASO4_OBS = [
  { key: "q1_equitableAccess", label: "1. What data will show whether students have equitable access to learning?" },
  { key: "q2_supportingEnglishLearners", label: "2. What data will show classroom power dynamics among students?" },
  { key: "q3_homeLanguageSupport", label: "3. Which groups of students should be focused on for additional support?" },
];
const PASO4_POST = [
  { key: "q1_equitableAccess", label: "1. Did all students have equitable access to learning?" },
  { key: "q2_supportingEnglishLearners", label: "2. Were any groups marginalized or excluded?" },
  { key: "q3_homeLanguageSupport", label: "3. How effective were strategies to support equity?" },
];

const PASO4_GUIDE = [
  { key: "districtStandards", label: "District Standards" },
  { key: "curriculumRequirements", label: "Curriculum Requirements" },
  { key: "assessmentGuidelines", label: "Assessment Guidelines" },
  { key: "accommodationPolicies", label: "Accommodation Policies" },
  { key: "additionalNotes", label: "Additional Notes" },
];

const PASO5_PRE = [
  { key: "q1_partnerConnect", label: "1. How will you partner and connect with your students through this lesson?" },
  { key: "q2_greetStudents", label: "2. What are ways to greet students as they enter the classroom?" },
  { key: "q3_comfortableParticipate", label: "3. How can students feel comfortable and eager to participate?" },
  { key: "q4_teamBuilding", label: "4. How can team-building activities help students know each other better?" },
  { key: "q5_getToKnowStudents", label: "5. How will you get to know students' interests, culture, language, and family backgrounds?" },
  { key: "q6_topicRelevant", label: "6. How can you make the topic interesting and relevant for all students?" },
  { key: "q7_learningModalities", label: "7. How are you incorporating various learning modalities to address learning preferences?" },
  { key: "q8_activitiesToLearn", label: "8. What activities will you use to learn more about your students?" },
];
const PASO5_OBS = [
  { key: "q1_partnerConnect", label: "1. How can engagement levels be observed for each student or group?" },
  { key: "q2_greetStudents", label: "2. What evidence shows students connecting with the content?" },
  { key: "q3_comfortableParticipate", label: "3. How can classroom relationships and rapport be observed?" },
];
const PASO5_POST = [
  { key: "q1_partnerConnect", label: "1. How did you connect with students during the lesson?" },
  { key: "q2_greetStudents", label: "2. What additional information did you learn about students' backgrounds?" },
  { key: "q3_comfortableParticipate", label: "3. How did students use their home languages to access the content?" },
  { key: "q4_teamBuilding", label: "4. How did the lesson build relationships?" },
];

const PASO6_PRE = [
  { key: "q1_advocateEquity", label: "1. How will you advocate for equity and social justice in this lesson or unit?" },
  { key: "q2_scaffolding", label: "2. What approach will you take to scaffolding student learning?" },
  { key: "q3_fitWithinUnit", label: "3. How does this lesson fit within a larger unit or learning goal?" },
  { key: "q4_assessmentData", label: "4. What assessment data informed the focus of this lesson?" },
  { key: "q5_barriersChallenges", label: "5. What barriers or challenges might arise and how will you plan for them?" },
  { key: "q6_showLearningWays", label: "6. How can you create opportunities for students to show learning in different ways?" },
];
const PASO6_OBS = [
  { key: "q1_advocateEquity", label: "1. What evidence will show advocacy for equitable learning opportunities?" },
  { key: "q2_scaffolding", label: "2. How can teacher talk support marginalized groups?" },
  { key: "q3_fitWithinUnit", label: "3. How can equitable participation be observed?" },
];
const PASO6_POST = [
  { key: "q1_advocateEquity", label: "1. What did you learn about student learning needs?" },
  { key: "q2_scaffolding", label: "2. How will you advocate for support for students?" },
  { key: "q3_fitWithinUnit", label: "3. How will you communicate with families about learning?" },
  { key: "q4_assessmentData", label: "4. What supports do you need moving forward?" },
];

/** Short answers that hit 2+ rubric-keyword concepts (or synonyms); designed for lenient 90%+ scoring. */
function exampleResponse(id, label, kind) {
  const key = id.split("|").pop();

  if (kind === "plan") {
    const plan = {
      lessonTitle: "Comparing fractions with unlike denominators.",
      gradeLevel: "Grade 4",
      subjectArea: "Mathematics",
      lessonObjectives: "Students will compare two fractions using a visual model; goal is clear and measurable.",
      lessonStructure: "Warm-up, mini-lesson, partner practice, exit ticket—in that sequence.",
      materialsResources: "Fraction strips, whiteboards, and exit slips—everything needed is listed.",
    };
    return plan[key] || `Clear, measurable goal; materials and sequence fit the grade.`;
  }

  if (kind === "district") {
    const g = {
      districtStandards: "Aligns to TEKS 4.3D; standards drive the task.",
      curriculumRequirements: "Uses district-adopted curriculum unit 3; compliance with scope.",
      assessmentGuidelines: "Exit ticket matches district assessment policy for formative checks.",
      accommodationPolicies: "IEP and ELL accommodations followed per district handbook.",
      additionalNotes: "None beyond standard policy alignment.",
    };
    return g[key] || `Policy and standards alignment noted for this lesson.`;
  }

  const byKind = {
    self: {
      default:
        "My identity shapes how I teach this; I reflect on bias and use explicit teaching so every student can access the lesson.",
      q1_positionality:
        "My background influences what I emphasize; I stay aware of privilege and keep students’ perspectives central.",
      q2_hiddenCurriculum:
        "The hidden curriculum here is ‘speed equals smart’; I name that bias and reframe success for students.",
      q3_explicitTeaching:
        "I explicitly teach the steps and vocabulary first so every student gets the same baseline before the task.",
      q4_contentKnowledge:
        "I know the core ideas cold and can explain them simply—enough content knowledge to support misconceptions.",
      q5_learningProcess:
        "I learned it by doing examples; that shapes how I scaffold practice for students who struggle.",
      q6_studentRelationship:
        "I build on relationships and students’ culture by referencing what they care about in the warm-up.",
      q7_diversityAffirmation:
        "I name my positionality and celebrate diverse identities with inclusive language and student stories.",
      q8_learnerModeling:
        "I model being a learner when I try a problem aloud and show mistakes with a growth mindset.",
      q9_growthMindset:
        "I normalize mistakes and model perseverance so students see reflection and improvement as normal.",
      q10_preparedness:
        "I need one more dry run of the demo; preparation builds my confidence with the content.",
      obs_q1:
        "I’m working on cultural humility in feedback during this lesson—evidence will be my conferring notes.",
      obs_q2:
        "Observers can note my wait time and whose voices dominate—positionality shows in participation patterns.",
      obs_q3:
        "My awareness of privilege informed which texts I chose and how I framed discussion for students.",
      post_q1:
        "My background led me to over-scaffold; I adjusted mid-lesson for student voice.",
      post_q2:
        "Teaching it showed gaps in my own content knowledge I’ll fix before next time.",
      post_q3:
        "Students learn this faster with visuals; I learned they need more concrete models.",
      post_q4:
        "Success: clear objective and engagement; students stayed on task.",
      post_q5:
        "Next time I’ll shorten my talk and add more partner processing—straightforward tweak.",
    },
    learner: {
      default:
        "Exit tickets show readiness patterns; I’ll differentiate language supports using that data for families’ kids too.",
      q1_studentReadiness: "Most are ready on fractions; a few need visuals first—readiness data from yesterday’s exit slip.",
      q2_priorKnowledge: "I used a quick probe and discussion to assess prior knowledge before the lesson.",
      q3_retentionCheck: "I’ll start with two review problems to check retention of last week’s skill.",
      q4_academicSkills: "Reading is stronger than writing for several; I’ll pair skills with sentence frames.",
      q5_skillPatterns: "Patterns show a middle group needs fluency practice; others are ready to extend.",
      q6_differentiation: "I tiered the worksheet and added a challenge task—differentiation matches those patterns.",
      q7_languageProficiency: "ELs get visuals and partner talk before writing; supports match proficiency levels.",
      q8_fundsOfKnowledge: "Students bring cooking and sports examples; I’ll connect those funds of knowledge to the word problem.",
      q9_familyDynamics: "I know several parents work nights; I communicate by text when possible.",
      q10_backgroundKnowledge: "They know area models from last unit; I’ll build background with one quick review image.",
      obs_q1: "Observe Ana and the small group at table 2—they represent our emerging readers.",
      obs_q2: "Collect work samples and oral responses as evidence of performance during the task.",
      obs_q3: "Sort responses by misconception to see patterns in student performance.",
      post_q1: "I learned several students weren’t ready for abstract symbols; I’ll reteach with models.",
      post_q2: "Most succeeded on the partner task; success showed in their explanations.",
      post_q3: "Word problems tripped them up; they need support with reading, not just math.",
      post_q4: "Data says next step is small-group reteach on vocabulary before the quiz.",
    },
    teaching: {
      default:
        "Learning objective is posted; barriers include reading load, so I add visuals and pacing checks for engagement.",
      q1_humanizingPedagogy: "Students share strategies first; I honor their thinking—humanizing pedagogy in the launch.",
      q2_presentLearningObjective: "I state the objective in kid-friendly language and have them repeat it—clear goal.",
      q3_barriers: "Time and vocabulary are barriers; I shorten text and pre-teach three words.",
      q4_accommodations: "Graphic organizer and read-aloud are accommodations for IEP and EL students.",
      q5_resourcesMaterials: "Charts, cubes, and slides ready—materials match each part of the lesson.",
      q6_studentEngagement: "Turn-and-talk and whiteboards keep engagement up during practice.",
      q7_classroomEnvironment: "Desks in groups, anchor charts up—environment supports collaboration today.",
      q8_relateToLives: "I use a local sports example so the math relates to students’ lives.",
      q9_backgroundKnowledge: "They need the definition of numerator; I verify that background skill at the start.",
      obs_q1: "Please watch engagement during discussion, my wait time, and how I deliver the mini-lesson.",
      obs_q2: "Success means most can restate the goal; I’ll monitor with thumbs and a quick prompt.",
      obs_q3: "Note pacing on the timer and student engagement during independent work.",
      post_q1: "Overall it worked; engagement was high in the first half.",
      post_q2: "I’d give clearer directions earlier—simple fix next time.",
      post_q3: "Next steps: more formative checks and shorter chunks of instruction.",
    },
    socio: {
      default:
        "Equity and access: ELs sit with peers who model language; grouping balances power so culture is represented.",
      q1_equitableAccess: "Materials are at every seat; equitable access means no one waits for a book.",
      q2_supportingEnglishLearners: "Sentence frames and visuals support English learners during the discussion.",
      q3_homeLanguageSupport: "They may discuss in Spanish first; home language supports understanding.",
      q4_culturalRelevance: "I picked a context that reflects students’ cultures to boost relevance.",
      q5_engagementRepresentation: "Multiple ways to respond—oral, written, drawing—for representation and expression.",
      q6_groupingForEquity: "Mixed-ability groups with assigned roles—grouping chosen for equity, not tracking.",
      q7_essentialQuestionRelevance: "The essential question ties to students’ community issues—relevance for all.",
      obs_q1: "Track participation turns to see if access to the task is equitable for multilingual learners.",
      obs_q2: "Note who speaks first in groups—signals power dynamics among students.",
      obs_q3: "Focus extra support on newcomers and students with IEPs in this lesson.",
      post_q1: "Yes—everyone could reach the materials; access felt fair.",
      post_q2: "No group was excluded; a few were quiet but not marginalized intentionally.",
      post_q3: "Sentence frames helped; equity strategies mostly worked today.",
    },
    community: {
      default:
        "I greet each student at the door and use home language greetings where I can to build rapport and participation.",
      q1_partnerConnect: "I’ll partner with students by co-creating one success criterion before we start.",
      q2_greetStudents: "Hello at the door plus name—simple greetings to welcome everyone.",
      q3_comfortableParticipate: "Low-stakes partner practice first so students feel comfortable participating aloud.",
      q4_teamBuilding: "Two-minute partner interview—team-building so they know one fact about each other.",
      q5_getToKnowStudents: "Interest survey Monday; I use results to connect culture and family backgrounds to tasks.",
      q6_topicRelevant: "I link the topic to jobs they know—relevance for all, not just one group.",
      q7_learningModalities: "Visual, auditory, and kinesthetic options—modalities so preferences are honored.",
      q8_activitiesToLearn: "Exit ticket ‘one question you wish I asked’—activity to learn more about students.",
      obs_q1: "Watch body language and on-task time to gauge engagement by student.",
      obs_q2: "Look for students referencing the task in their own words—evidence of connection to content.",
      obs_q3: "Listen for laughter and turn-taking as signs of relationships and rapport.",
      post_q1: "I connected through turn-and-talk and checking in at tables.",
      post_q2: "Learned more about families’ jobs and hobbies students shared—backgrounds matter.",
      post_q3: "They used Spanish to clarify the prompt before answering in English.",
      post_q4: "Partner work and shared goals built trust quickly—relationships grew.",
    },
    advocacy: {
      default:
        "I’ll advocate for equity using assessment data, scaffolding, and differentiated tasks for barriers students face.",
      q1_advocateEquity: "I push for fair access to tech at home—advocacy for equity in this unit.",
      q2_scaffolding: "I scaffold with models then fade support as students show readiness.",
      q3_fitWithinUnit: "This lesson fits the unit goal of comparing fractions—bigger learning goal clear.",
      q4_assessmentData: "Last quiz data showed gaps; assessment data drove today’s reteach focus.",
      q5_barriersChallenges: "Attendance and language are barriers; I plan alternate assignments and check-ins.",
      q6_showLearningWays: "Choice board: write, draw, or record—different ways to show learning.",
      obs_q1: "Look for me redirecting resources so marginalized students get equal talk time.",
      obs_q2: "My prompts and praise should scaffold marginalized groups into the discussion.",
      obs_q3: "Equitable participation means balanced turns and supported responses.",
      post_q1: "Several need vocabulary support; that’s the main learning need I saw.",
      post_q2: "I’ll ask the coach for structured language frames and push for EL services.",
      post_q3: "I’ll text families a photo of the rubric and one strength—simple family communication.",
      post_q4: "I need time to co-plan with the ESL teacher—that’s the support I need.",
    },
  };

  const k = byKind[kind];
  if (!k) return byKind.self.default;

  const stage = id.split("|")[0];
  const field = id.split("|").pop();
  if (kind === "self" && stage === "observation") {
    if (field === "q1_positionality") return k.obs_q1;
    if (field === "q2_hiddenCurriculum") return k.obs_q2;
    if (field === "q3_explicitTeaching") return k.obs_q3;
  }
  if (kind === "self" && stage === "post") {
    if (field === "q1_positionality") return k.post_q1;
    if (field === "q2_hiddenCurriculum") return k.post_q2;
    if (field === "q3_explicitTeaching") return k.post_q3;
    if (field === "q4_contentKnowledge") return k.post_q4;
    if (field === "q5_learningProcess") return k.post_q5;
  }
  if (kind === "learner" && stage === "observation") {
    if (field === "q1_studentReadiness") return k.obs_q1;
    if (field === "q2_priorKnowledge") return k.obs_q2;
    if (field === "q3_retentionCheck") return k.obs_q3;
  }
  if (kind === "learner" && stage === "post") {
    if (field === "q1_studentReadiness") return k.post_q1;
    if (field === "q2_priorKnowledge") return k.post_q2;
    if (field === "q3_retentionCheck") return k.post_q3;
    if (field === "q4_academicSkills") return k.post_q4;
  }
  if (kind === "teaching" && stage === "observation") {
    if (field === "q1_humanizingPedagogy") return k.obs_q1;
    if (field === "q2_presentLearningObjective") return k.obs_q2;
    if (field === "q3_barriers") return k.obs_q3;
  }
  if (kind === "teaching" && stage === "post") {
    if (field === "q1_humanizingPedagogy") return k.post_q1;
    if (field === "q2_presentLearningObjective") return k.post_q2;
    if (field === "q3_barriers") return k.post_q3;
  }
  if (kind === "socio" && stage === "observation") {
    if (field === "q1_equitableAccess") return k.obs_q1;
    if (field === "q2_supportingEnglishLearners") return k.obs_q2;
    if (field === "q3_homeLanguageSupport") return k.obs_q3;
  }
  if (kind === "socio" && stage === "post") {
    if (field === "q1_equitableAccess") return k.post_q1;
    if (field === "q2_supportingEnglishLearners") return k.post_q2;
    if (field === "q3_homeLanguageSupport") return k.post_q3;
  }
  if (kind === "community" && stage === "observation") {
    if (field === "q1_partnerConnect") return k.obs_q1;
    if (field === "q2_greetStudents") return k.obs_q2;
    if (field === "q3_comfortableParticipate") return k.obs_q3;
  }
  if (kind === "community" && stage === "post") {
    if (field === "q1_partnerConnect") return k.post_q1;
    if (field === "q2_greetStudents") return k.post_q2;
    if (field === "q3_comfortableParticipate") return k.post_q3;
    if (field === "q4_teamBuilding") return k.post_q4;
  }
  if (kind === "advocacy" && stage === "observation") {
    if (field === "q1_advocateEquity") return k.obs_q1;
    if (field === "q2_scaffolding") return k.obs_q2;
    if (field === "q3_fitWithinUnit") return k.obs_q3;
  }
  if (kind === "advocacy" && stage === "post") {
    if (field === "q1_advocateEquity") return k.post_q1;
    if (field === "q2_scaffolding") return k.post_q2;
    if (field === "q3_fitWithinUnit") return k.post_q3;
    if (field === "q4_assessmentData") return k.post_q4;
  }

  return k[field] || k.default;
}

function block(id, label, kind) {
  const text = exampleResponse(id, label, kind);
  return `### ${id}\n**Question:** ${label}\n**Example (target 90%+):** ${text}\n\n`;
}

let md = `# Paso high-score example responses\n\nShort, straightforward answers aligned with the **lenient** sufficiency rules in \`server/services/gemini.js\` (at least two rubric keywords or synonyms; length not required). Keys match \`docs/paso-response-rubrics.md\`. Regenerate with \`node server/scripts/generatePasoHighScoreExamples.js\`.\n\n`;

function emitPaso1() {
  for (const { key, label } of PASO1_PRE) md += block(`pre|paso1|main|${key}`, label, "self");
  for (const { key, label } of PASO1_OBS) md += block(`observation|paso1|main|${key}`, label, "self");
  for (const { key, label } of PASO1_POST) md += block(`post|paso1|main|${key}`, label, "self");
}

function emitPaso2() {
  for (const { key, label } of PASO2_PRE) md += block(`pre|paso2|general|${key}`, label, "learner");
  for (const { key, label } of PASO2_OBS) md += block(`observation|paso2|general|${key}`, label, "learner");
  for (const { key, label } of PASO2_POST) md += block(`post|paso2|general|${key}`, label, "learner");
}

function emitPaso3() {
  for (const { key, label } of PASO3_PRE) md += block(`pre|paso3|general|${key}`, label, "teaching");
  for (const { key, label } of PASO3_OBS) md += block(`observation|paso3|general|${key}`, label, "teaching");
  for (const { key, label } of PASO3_POST) md += block(`post|paso3|general|${key}`, label, "teaching");
  for (const { key, label } of PASO3_PLAN) md += block(`any|paso3|plan|${key}`, label, "plan");
}

function emitPaso4() {
  for (const { key, label } of PASO4_PRE) md += block(`pre|paso4|general|${key}`, label, "socio");
  for (const { key, label } of PASO4_OBS) md += block(`observation|paso4|general|${key}`, label, "socio");
  for (const { key, label } of PASO4_POST) md += block(`post|paso4|general|${key}`, label, "socio");
  for (const { key, label } of PASO4_GUIDE) md += block(`any|paso4|guidelines|${key}`, label, "district");
}

function emitPaso5() {
  for (const { key, label } of PASO5_PRE) md += block(`pre|paso5|main|${key}`, label, "community");
  for (const { key, label } of PASO5_OBS) md += block(`observation|paso5|main|${key}`, label, "community");
  for (const { key, label } of PASO5_POST) md += block(`post|paso5|main|${key}`, label, "community");
}

function emitPaso6() {
  for (const { key, label } of PASO6_PRE) md += block(`pre|paso6|advocacy|${key}`, label, "advocacy");
  for (const { key, label } of PASO6_OBS) md += block(`observation|paso6|advocacy|${key}`, label, "advocacy");
  for (const { key, label } of PASO6_POST) md += block(`post|paso6|advocacy|${key}`, label, "advocacy");
}

emitPaso1();
emitPaso2();
emitPaso3();
emitPaso4();
emitPaso5();
emitPaso6();

writeFileSync(OUT, md, "utf8");
console.log("Wrote", OUT);
