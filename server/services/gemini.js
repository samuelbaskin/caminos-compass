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
  const { paso1, paso2Students, paso3, paso4, paso5 } = data;

  return `You are an expert educational consultant specializing in culturally responsive pedagogy for multilingual learners. Based on the following teacher reflection data from the Coaching Caminos 6-Paso framework, generate a comprehensive, actionable lesson plan.

=== PASO 1: KNOWLEDGE OF SELF ===
Positionality: ${paso1?.positionality?.response || "Not provided"}
Assumptions: ${paso1?.assumptions?.response || "Not provided"}
Relationship to Students: ${paso1?.relationshipToStudents?.response || "Not provided"}
Awareness of Bias: ${paso1?.awarenessOfBias?.response || "Not provided"}
Instructional Intention: ${paso1?.instructionalIntention?.response || "Not provided"}

=== PASO 2: STUDENT PROFILES ===
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

=== PASO 3: PRELIMINARY LESSON PLAN ===
Title: ${paso3?.lessonTitle || "Not provided"}
Grade Level: ${paso3?.gradeLevel || "Not provided"}
Subject: ${paso3?.subjectArea || "Not provided"}
Objectives: ${paso3?.lessonObjectives || "Not provided"}
Structure: ${paso3?.lessonStructure || "Not provided"}
Materials: ${paso3?.materialsResources || "Not provided"}

=== PASO 4: DISTRICT GUIDELINES ===
Standards: ${paso4?.districtStandards || "Not provided"}
Curriculum Requirements: ${paso4?.curriculumRequirements || "Not provided"}
Assessment Guidelines: ${paso4?.assessmentGuidelines || "Not provided"}
Accommodation Policies: ${paso4?.accommodationPolicies || "Not provided"}

=== PASO 5: PARTNERING WITH STUDENTS & FAMILIES ===
Home Language Support: ${paso5?.homeLanguageSupport || "Not provided"}
Equitable Treatment: ${paso5?.equitableTreatment || "Not provided"}
Engagement at Proficiency Level: ${paso5?.engagementAtProficiencyLevel || "Not provided"}
Partner with Students & Families: ${paso5?.partnerWithStudentsAndFamilies || "Not provided"}

---

Generate a detailed lesson plan that:
1. Incorporates the teacher's self-reflection and awareness from Paso 1
2. Addresses each student's individual needs, linguistic backgrounds, and learning goals from Paso 2
3. Builds upon the preliminary lesson structure from Paso 3
4. Aligns with district standards and requirements from Paso 4
5. Integrates family/community partnership strategies from Paso 5
6. Includes differentiated instruction strategies for multilingual learners
7. Provides specific language scaffolding techniques
8. Includes assessment methods appropriate for varying proficiency levels

Format the lesson plan with clear sections: Overview, Objectives, Materials, Procedures (with timing), Differentiation Strategies, Assessment, and Family/Community Connections.`;
}

module.exports = { generateLessonPlan, evaluateWritingSample };
