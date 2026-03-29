/**
 * One-time / maintenance: regenerates docs/paso-response-rubrics.md
 * Run: node server/scripts/generatePasoRubrics.js
 */
const { writeFileSync } = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "../../docs/paso-response-rubrics.md");

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

function kw(kind) {
  const m = {
    self: "positionality, identity, bias, privilege, cultural humility, explicit teaching, students, reflection, specificity",
    learner: "readiness, data, evidence, differentiation, language, culture, families, next steps, patterns",
    teaching: "objectives, engagement, barriers, accommodations, humanizing pedagogy, pacing, environment",
    socio: "equity, access, multilingual learners, power, culture, grouping, representation",
    community: "relationships, greetings, participation, home language, families, rapport, relevance",
    advocacy: "equity, scaffolding, assessment, barriers, differentiation, families, systems",
    plan: "clear, measurable, aligned, complete, grade-appropriate, materials, sequence",
    district: "standards, policy, compliance, assessment, IEP, ELL, curriculum alignment",
  };
  return m[kind] || m.self;
}

function sample(kind) {
  const m = {
    self: "I name how my background shapes what I emphasize in this content, give one concrete lesson example, and connect it to how I will include every student.",
    learner: "I reference specific student data or observations, name groups or levels where relevant, and explain how that shapes my instructional move.",
    teaching: "I describe a concrete lesson element (task, routine, or check for understanding) and link it to student access and the learning goal.",
    socio: "I identify who might be advantaged or marginalized in this lesson and describe a strategy that improves equitable access with a brief rationale.",
    community: "I give specific moves (language, routines, or tasks) that honor student voice, culture, or home language during the lesson.",
    advocacy: "I state a clear equity or access commitment tied to this lesson, name one system or data source, and describe a realistic action.",
    plan: "The response is specific enough that another teacher could understand the lesson focus, level, and main flow without guessing.",
    district: "The response names actual standards or policy expectations and relates them to this lesson or assessment plan.",
  };
  return m[kind] || m.self;
}

function block(id, question, kind) {
  return `### ${id}\n**Question:** ${question}\n**Keywords:** ${kw(kind)}\n**Sample sufficient answer:** ${sample(kind)}\n\n`;
}

let md = `# Paso response rubrics\n\nUsed by the Coaching Caminos AI sufficiency review. Each block is keyed by \`stage|pasoN|section|fieldKey\` (header line after \`###\`). Stage \`any\` applies to all coaching stages for that field.\n\n`;

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
