const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let ai = null;
function getAI() {
  if (!ai) {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return ai;
}

async function generateLessonPlan(paso1to5Data) {
  const client = getAI();

  const prompt = buildLessonPlanPrompt(paso1to5Data);

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
}

async function evaluateWritingSample(writingSampleText, studentContext) {
  const client = getAI();

  const prompt = `You are an experienced educational evaluator assisting teachers of multilingual learners.

Student context:
- Name: ${studentContext.firstName} ${studentContext.lastName}
- Grade: ${studentContext.grade || "N/A"}
- Home Language: ${studentContext.demographics?.homeLanguage || "N/A"}
- ELP Level: ${studentContext.demographics?.elpLevel || "N/A"}

Please evaluate the following writing sample. Provide:
1. Overall assessment of writing proficiency
2. Strengths demonstrated in the writing
3. Areas needing improvement
4. Specific, actionable recommendations for the teacher
5. Suggested instructional strategies for this student's language level

Writing sample:
"""
${writingSampleText}
"""

Provide your evaluation in a clear, structured format.`;

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
}

function buildLessonPlanPrompt(data) {
  const { paso1, paso2General, paso2Students, paso3General, paso3, paso4General, paso4, paso5, paso6 } = data;

  return `You are an expert educational consultant specializing in culturally responsive pedagogy for multilingual learners. Based on the following teacher reflection data from the Coaching Caminos 6-Paso framework, generate a comprehensive, actionable lesson plan.

=== PASO 1: KNOWLEDGE OF SELF ===
1. Positionality in relation to content: ${paso1?.q1_positionality?.response || "Not provided"}
2. The "hidden curriculum": ${paso1?.q2_hiddenCurriculum?.response || "Not provided"}
3. Explicit teaching for all students: ${paso1?.q3_explicitTeaching?.response || "Not provided"}
4. Knowledge of the content: ${paso1?.q4_contentKnowledge?.response || "Not provided"}
5. Learning process and teaching approach: ${paso1?.q5_learningProcess?.response || "Not provided"}
6. Connection/relationship to students and their culture: ${paso1?.q6_studentRelationship?.response || "Not provided"}
7. Acknowledging positionality and celebrating diversity: ${paso1?.q7_diversityAffirmation?.response || "Not provided"}
8. Modeling as a learner: ${paso1?.q8_learnerModeling?.response || "Not provided"}
9. Growth mindset and handling mistakes: ${paso1?.q9_growthMindset?.response || "Not provided"}
10. Preparation and confidence: ${paso1?.q10_preparedness?.response || "Not provided"}

=== PASO 2 SECTION 1: GENERAL QUESTIONS ABOUT STUDENTS ===
1. Student readiness for lesson: ${paso2General?.q1_studentReadiness?.response || "Not provided"}
2. Assessment of prior knowledge: ${paso2General?.q2_priorKnowledge?.response || "Not provided"}
3. Checking retention of prior skills: ${paso2General?.q3_retentionCheck?.response || "Not provided"}
4. Reading, language, writing, or math skills: ${paso2General?.q4_academicSkills?.response || "Not provided"}
5. Patterns in academic skills: ${paso2General?.q5_skillPatterns?.response || "Not provided"}
6. Lesson differentiation: ${paso2General?.q6_differentiation?.response || "Not provided"}
7. Language proficiency support: ${paso2General?.q7_languageProficiency?.response || "Not provided"}
8. Funds of knowledge: ${paso2General?.q8_fundsOfKnowledge?.response || "Not provided"}
9. Parents/family dynamics: ${paso2General?.q9_familyDynamics?.response || "Not provided"}
10. Background knowledge: ${paso2General?.q10_backgroundKnowledge?.response || "Not provided"}

=== PASO 2 SECTION 2: INDIVIDUAL STUDENT PROFILES ===
${(paso2Students || [])
  .map(
    (s, i) =>
      `Student ${i + 1}: ${s.student?.firstName || ""} ${s.student?.lastName || ""}
  Grade: ${s.student?.grade || "N/A"}
  Home Language: ${s.student?.demographics?.homeLanguage || "N/A"}
  ELP Level: ${s.student?.demographics?.elpLevel || "N/A"}
  Knowledge of Other: ${s.submission?.knowledgeOfOther || "N/A"}
  Learning Goals: ${s.submission?.learningGoals || "N/A"}
  Support Needs: ${s.submission?.supportNeeds || "N/A"}`
  )
  .join("\n\n")}

=== PASO 3 SECTION 1: GENERAL QUESTIONS (PRACTICE OF TEACHING) ===
1. Humanizing pedagogy: ${paso3General?.q1_humanizingPedagogy?.response || "Not provided"}
2. Presenting learning objective: ${paso3General?.q2_presentLearningObjective?.response || "Not provided"}
3. Barriers students might encounter: ${paso3General?.q3_barriers?.response || "Not provided"}
4. Accommodations or modifications: ${paso3General?.q4_accommodations?.response || "Not provided"}
5. Resources or materials: ${paso3General?.q5_resourcesMaterials?.response || "Not provided"}
6. Student engagement: ${paso3General?.q6_studentEngagement?.response || "Not provided"}
7. Physical classroom environment: ${paso3General?.q7_classroomEnvironment?.response || "Not provided"}
8. Relating to students' lives: ${paso3General?.q8_relateToLives?.response || "Not provided"}
9. Background knowledge or skills: ${paso3General?.q9_backgroundKnowledge?.response || "Not provided"}

=== PASO 3 SECTION 2: PRELIMINARY LESSON PLAN ===
Title: ${paso3?.lessonTitle || "Not provided"}
Grade Level: ${paso3?.gradeLevel || "Not provided"}
Subject: ${paso3?.subjectArea || "Not provided"}
Objectives: ${paso3?.lessonObjectives || "Not provided"}
Structure: ${paso3?.lessonStructure || "Not provided"}
Materials: ${paso3?.materialsResources || "Not provided"}

=== PASO 4 SECTION 1: GENERAL QUESTIONS (KNOWLEDGE OF SOCIOPOLITICAL DYNAMICS) ===
1. Equitable access to learning: ${paso4General?.q1_equitableAccess?.response || "Not provided"}
2. Supporting English learners: ${paso4General?.q2_supportingEnglishLearners?.response || "Not provided"}
3. Home language support: ${paso4General?.q3_homeLanguageSupport?.response || "Not provided"}
4. Cultural relevance: ${paso4General?.q4_culturalRelevance?.response || "Not provided"}
5. Engagement, representation, expression: ${paso4General?.q5_engagementRepresentation?.response || "Not provided"}
6. Grouping for equity: ${paso4General?.q6_groupingForEquity?.response || "Not provided"}
7. Essential question relevance: ${paso4General?.q7_essentialQuestionRelevance?.response || "Not provided"}

=== PASO 4 SECTION 2: DISTRICT GUIDELINES ===
Standards: ${paso4?.districtStandards || "Not provided"}
Curriculum Requirements: ${paso4?.curriculumRequirements || "Not provided"}
Assessment Guidelines: ${paso4?.assessmentGuidelines || "Not provided"}
Accommodation Policies: ${paso4?.accommodationPolicies || "Not provided"}

=== PASO 5: PRACTICE OF KNOWING LEARNERS, FAMILIES & COMMUNITIES ===
1. Partner and connect with students: ${paso5?.q1_partnerConnect || "Not provided"}
2. Greeting students: ${paso5?.q2_greetStudents || "Not provided"}
3. Comfortable and eager to participate: ${paso5?.q3_comfortableParticipate || "Not provided"}
4. Team-building activities: ${paso5?.q4_teamBuilding || "Not provided"}
5. Get to know students' interests, culture, language, family: ${paso5?.q5_getToKnowStudents || "Not provided"}
6. Make topic interesting and relevant: ${paso5?.q6_topicRelevant || "Not provided"}
7. Learning modalities: ${paso5?.q7_learningModalities || "Not provided"}
8. Activities to learn about students: ${paso5?.q8_activitiesToLearn || "Not provided"}

=== PASO 6: PRACTICE OF ADVOCACY ===
1. Advocate for equity and social justice: ${paso6?.q1_advocateEquity || "Not provided"}
2. Scaffolding student learning: ${paso6?.q2_scaffolding || "Not provided"}
3. Fit within larger unit or learning goal: ${paso6?.q3_fitWithinUnit || "Not provided"}
4. Assessment data that informed the lesson: ${paso6?.q4_assessmentData || "Not provided"}
5. Barriers or challenges and planning: ${paso6?.q5_barriersChallenges || "Not provided"}
6. Opportunities to show learning in different ways: ${paso6?.q6_showLearningWays || "Not provided"}

---

Generate a detailed lesson plan that:
1. Incorporates the teacher's self-reflection and awareness from Paso 1
2. Uses the teacher's general knowledge of student readiness, skills, and differentiation strategies from Paso 2 Section 1
3. Addresses each student's individual needs, linguistic backgrounds, and learning goals from Paso 2 Section 2
4. Uses the teacher's practice-of-teaching reflections from Paso 3 Section 1 and builds upon the preliminary lesson structure from Paso 3 Section 2
5. Uses sociopolitical dynamics reflections from Paso 4 Section 1 and aligns with district standards from Paso 4 Section 2
6. Integrates knowing learners, families & communities strategies from Paso 5
7. Incorporates advocacy and equity strategies from Paso 6
8. Includes differentiated instruction strategies for multilingual learners
9. Provides specific language scaffolding techniques
10. Includes assessment methods appropriate for varying proficiency levels

Format the lesson plan with clear sections: Overview, Objectives, Materials, Procedures (with timing), Differentiation Strategies, Assessment, and Family/Community Connections.`;
}

module.exports = { generateLessonPlan, evaluateWritingSample };
