# API Reference (Caminos Compass)

## Base URL
- Local dev: `http://localhost:5000`
- All endpoints are mounted under `/api`

## Auth (JWT Bearer)
Most routes require a JWT.

### Request header
`Authorization: Bearer <token>`

### Roles
- `teacher` and `admin`: can access `/api/cycles`, `/api/students`, `/api/lesson-plans`
- `coach` and `admin`: can access `/api/coaches`
- `admin`: can access `/api/admin`

## Common response shape
Successful JSON responses generally follow:
- `{ <resourceName>: ... }` or `{ ... }` for lists

Errors generally respond with:
- `401` (missing/invalid token), `403` (wrong role), `404` (not found), or `500` (server error)

---

## Health
### GET `/api/health`
Returns server/db status.

Response:
- `{ status, mongo, env }`

---

## Auth
### POST `/api/auth/signup`
Create a user (self-signup only supports `teacher` and `coach`).

Body:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "•••",
  "role": "teacher"
}
```

Response (201):
```json
{ "user": { "id", "firstName", "lastName", "email", "role" } }
```

### POST `/api/auth/login`
Login and get a JWT.

Body:
```json
{
  "email": "jane@example.com",
  "password": "•••",
  "role": "teacher"
}
```

Response (200):
```json
{
  "token": "<jwt>",
  "user": { "id", "firstName", "lastName", "email", "role" }
}
```

---

## Teacher: Cycles & Paso submissions
All `/api/cycles/*` routes are under `/api/cycles` and require auth.

### GET `/api/cycles`
List coaching cycles for the logged-in teacher.

Response:
```json
{ "cycles": [ /* TeacherCycle docs */ ] }
```

### POST `/api/cycles`
Create a coaching cycle.

Body:
```json
{ "name": "Spring 2026" }
```

Response (201):
```json
{ "cycle": { /* TeacherCycle doc */ } }
```

### GET `/api/cycles/:id`
Fetch cycle plus submissions for Pasos 1-6, student roster, and latest lesson plan.

Response:
```json
{
  "cycle": { /* TeacherCycle doc */ },
  "paso1": { /* Paso1Submission */ } ,
  "paso2": [ /* Paso2Submission */ ],
  "paso3": { /* Paso3Submission */ },
  "paso4": { /* Paso4Submission */ },
  "paso5": { /* Paso5Submission */ },
  "paso6": { /* Paso6Submission */ },
  "students": [ /* Student */ ],
  "lessonPlan": { /* LessonPlan */ }
}
```

---

## Paso 1
### GET `/api/cycles/:id/paso/1`
Response:
```json
{ "paso1": { "q1_positionality": { "response", "isDraft" }, "...": "...", "status" } }
```

### PUT `/api/cycles/:id/paso/1`
Body: includes `status` (`draft` or `complete`) and the question keys below.
Each question key is either:
- a string
- or `{ "response": "…", "isDraft": true }`

Paso 1 question keys:
- `q1_positionality`
- `q2_hiddenCurriculum`
- `q3_explicitTeaching`
- `q4_contentKnowledge`
- `q5_learningProcess`
- `q6_studentRelationship`
- `q7_diversityAffirmation`
- `q8_learnerModeling`
- `q9_growthMindset`
- `q10_preparedness`

Response:
```json
{ "paso1": { /* saved document */ } }
```

---

## Paso 2 (Section 1: General questions about students)
### GET `/api/cycles/:id/paso/2/general`
Response:
```json
{ "paso2General": { "q1_studentReadiness": { "response", "isDraft" }, "...": "...", "status" } }
```

### PUT `/api/cycles/:id/paso/2/general`
Request normalization:
- body `status` can be `draft` or `complete` (mapped server-side to `completed`)
- each question key value can be string or `{ response, isDraft }`

Paso 2 general question keys:
- `q1_studentReadiness`
- `q2_priorKnowledge`
- `q3_retentionCheck`
- `q4_academicSkills`
- `q5_skillPatterns`
- `q6_differentiation`
- `q7_languageProficiency`
- `q8_fundsOfKnowledge`
- `q9_familyDynamics`
- `q10_backgroundKnowledge`

Example body:
```json
{
  "status": "draft",
  "q1_studentReadiness": { "response": "…", "isDraft": true },
  "q2_priorKnowledge": { "response": "…", "isDraft": true }
}
```

Response:
```json
{ "paso2General": { /* saved document */ } }
```

---

## Paso 2 (Section 2: Student profiles)
### GET `/api/cycles/:id/paso/2`
Response:
```json
{
  "students": [ /* Student */ ],
  "submissions": [ /* Paso2Submission */ ],
  "paso2General": { /* Paso2GeneralSubmission */ }
}
```

### PUT `/api/cycles/:id/paso/2`
Upserts a single student profile submission.

Body:
```json
{
  "status": "draft",
  "studentId": "<studentObjectId>",
  "knowledgeOfOther": "…",
  "learningGoals": "…",
  "supportNeeds": "…",
  "assessment": "…",
  "finalReview": "…",
  "notes": "…"
}
```

Response:
```json
{ "paso2": { /* Paso2Submission */ } }
```

---

## Paso 3 (Section 1: General questions)
### GET `/api/cycles/:id/paso/3/general`
Response:
```json
{ "paso3General": { "q1_humanizingPedagogy": { "response", "isDraft" }, "...": "...", "status" } }
```

### PUT `/api/cycles/:id/paso/3/general`
Body normalization matches Paso 2 general:
- `status`: `draft` or `complete`
- values can be string or `{ response, isDraft }`

Paso 3 general question keys:
- `q1_humanizingPedagogy`
- `q2_presentLearningObjective`
- `q3_barriers`
- `q4_accommodations`
- `q5_resourcesMaterials`
- `q6_studentEngagement`
- `q7_classroomEnvironment`
- `q8_relateToLives`
- `q9_backgroundKnowledge`

Response:
```json
{ "paso3General": { /* saved document */ } }
```

---

## Paso 3 (Section 2: Preliminary lesson plan)
### GET `/api/cycles/:id/paso/3`
Response:
```json
{ "paso3": { /* Paso3Submission */ }, "paso3General": { /* Paso3GeneralSubmission */ } }
```

### PUT `/api/cycles/:id/paso/3`
Body:
```json
{
  "status": "draft",
  "lessonTitle": "…",
  "gradeLevel": "…",
  "subjectArea": "…",
  "lessonObjectives": "…",
  "lessonStructure": "…",
  "materialsResources": "…"
}
```

Response:
```json
{ "paso3": { /* saved document */ } }
```

---

## Paso 4 (Section 1: General sociopolitical dynamics)
### GET `/api/cycles/:id/paso/4/general`
Response:
```json
{ "paso4General": { "q1_equitableAccess": { "response", "isDraft" }, "...": "...", "status" } }
```

### PUT `/api/cycles/:id/paso/4/general`
Normalization matches Paso 2/3 general:
- `status`: `draft` or `complete`
- question values can be string or `{ response, isDraft }`

Paso 4 general question keys:
- `q1_equitableAccess`
- `q2_supportingEnglishLearners`
- `q3_homeLanguageSupport`
- `q4_culturalRelevance`
- `q5_engagementRepresentation`
- `q6_groupingForEquity`
- `q7_essentialQuestionRelevance`

Response:
```json
{ "paso4General": { /* saved document */ } }
```

---

## Paso 4 (Section 2: District guidelines)
### GET `/api/cycles/:id/paso/4`
Response:
```json
{ "paso4": { /* Paso4Submission */ }, "paso4General": { /* Paso4GeneralSubmission */ } }
```

### PUT `/api/cycles/:id/paso/4`
Body:
```json
{
  "status": "draft",
  "districtStandards": "…",
  "curriculumRequirements": "…",
  "assessmentGuidelines": "…",
  "accommodationPolicies": "…",
  "additionalNotes": "…"
}
```

Response:
```json
{ "paso4": { /* saved document */ } }
```

---

## Paso 5 (Practice of Knowing Learners, Families & Communities)
### GET `/api/cycles/:id/paso/5`
Response:
```json
{ "paso5": { "q1_partnerConnect": "…", "...": "...", "status" } }
```

### PUT `/api/cycles/:id/paso/5`
Body keys:
- `status`: `draft` or `complete`
- `q1_partnerConnect`
- `q2_greetStudents`
- `q3_comfortableParticipate`
- `q4_teamBuilding`
- `q5_getToKnowStudents`
- `q6_topicRelevant`
- `q7_learningModalities`
- `q8_activitiesToLearn`

Example body:
```json
{
  "status": "completed",
  "q1_partnerConnect": "…",
  "q2_greetStudents": "…"
}
```

Response:
```json
{ "paso5": { /* saved document */ } }
```

---

## Paso 6 (Practice of Advocacy)
### GET `/api/cycles/:id/paso/6`
Response:
```json
{
  "paso6": {
    "understandingProficiency": "...",
    "...": "...",
    "q1_advocateEquity": "...",
    "...": "...",
    "status"
  }
}
```

### PUT `/api/cycles/:id/paso/6`
Body keys:
- `status`: `draft` or `complete`
- Category/progress fields (currently stored in the schema and updated by UI):
  - `understandingProficiency`
  - `instructionalAdjustments`
  - `equitableAdvocacy`
  - `parentInclusion`
- Advocacy questions:
  - `q1_advocateEquity`
  - `q2_scaffolding`
  - `q3_fitWithinUnit`
  - `q4_assessmentData`
  - `q5_barriersChallenges`
  - `q6_showLearningWays`

Example body:
```json
{
  "status": "draft",
  "q1_advocateEquity": "…",
  "q2_scaffolding": "…",
  "understandingProficiency": 45
}
```

Response:
```json
{ "paso6": { /* saved document */ } }
```

---

## Students
All `/api/students/*` routes require auth (teacher/admin).

### POST `/api/students`
Create a student under a cycle.

Body:
```json
{
  "teacherCycleId": "<teacherCycleObjectId>",
  "firstName": "Amina",
  "lastName": "Khan",
  "grade": "3",
  "demographics": { "homeLanguage": "Arabic", "elpLevel": "..." }
}
```

Response (201):
```json
{ "student": { /* Student doc */ } }
```

### GET `/api/students?cycleId=<id>`
List students for the logged-in teacher.

Query:
- `cycleId` (optional): filters by `teacherCycleId`

Response:
```json
{ "students": [ /* Student docs */ ] }
```

### PUT `/api/students/:id`
Update student.

Body: arbitrary fields that match the `Student` schema.

Response:
```json
{ "student": { /* updated Student doc */ } }
```

### POST `/api/students/:id/writing-sample`
Upload writing sample and trigger an LLM evaluation.

Content type: `multipart/form-data`

Form fields:
- `file`: required if uploading a file (10MB limit); stored server-side
- `text`: optional; if provided, used as `sampleText` (otherwise file contents are read)

Response:
```json
{ "student": { /* updated Student doc; includes llmEvaluation */ } }
```

---

## Lesson Plans
All `/api/lesson-plans/*` routes require auth (teacher/admin).

### GET `/api/lesson-plans`
List lesson plans for the logged-in teacher.

Response:
```json
{ "lessonPlans": [ /* LessonPlan docs */ ] }
```

### GET `/api/lesson-plans/:id`
Fetch a single lesson plan (must belong to the logged-in teacher).

Response:
```json
{ "lessonPlan": { /* LessonPlan doc */ } }
```

### PUT `/api/lesson-plans/:id`
Update lesson plan.

Body:
- `content` (optional)
- `status` (optional): one of `draft`, `generated`, `finalized`

Response:
```json
{ "lessonPlan": { /* updated */ } }
```

### DELETE `/api/lesson-plans/:id`
Delete a lesson plan.

Response:
```json
{ "message": "Lesson plan deleted." }
```

### POST `/api/lesson-plans/generate`
Generate a lesson plan using the saved Pasos and roster.

Body:
```json
{ "teacherCycleId": "<teacherCycleObjectId>" }
```

Response:
```json
{ "lessonPlan": { /* generated LessonPlan doc */ } }
```

Notes:
- The server snapshot field is stored as `paso1to5Input` but (currently) it includes Paso 6 as well.
- `status` is set to `"generated"` on creation.

---

## Coach API
All `/api/coaches/*` routes require auth (`coach` or `admin`).

### GET `/api/coaches/teachers`
List teachers with their latest cycle info.

Response:
```json
{
  "teachers": [
    {
      "teacher": { "id", "firstName", "lastName", "email", "role" },
      "latestCycle": { /* TeacherCycle doc or null */ },
      "hasLessonPlan": true
    }
  ]
}
```

### GET `/api/coaches/teachers/:teacherId`
Fetch a teacher’s latest cycle (Paso 1-6 + students + lesson plan) and coach evaluations.

Response:
```json
{
  "teacher": { /* User.toPublic() */ },
  "cycle": { /* latest TeacherCycle or null */ },
  "paso1": { /* Paso1Submission */ },
  "paso2General": { /* Paso2GeneralSubmission */ },
  "paso2": [ /* Paso2Submission */ ],
  "paso3General": { /* Paso3GeneralSubmission */ },
  "paso3": { /* Paso3Submission */ },
  "paso4General": { /* Paso4GeneralSubmission */ },
  "paso4": { /* Paso4Submission */ },
  "paso5": { /* Paso5Submission */ },
  "paso6": { /* Paso6Submission */ },
  "students": [ /* Student */ ],
  "lessonPlan": { /* LessonPlan doc */ },
  "evaluations": [ /* CoachEvaluation */ ]
}
```

### POST `/api/coaches/evaluations`
Create a coach evaluation for a generated/finalized lesson plan.

Body:
```json
{
  "teacherId": "<teacherObjectId>",
  "lessonPlanId": "<lessonPlanObjectId>",
  "strengths": "…",
  "areasForImprovement": "…",
  "suggestions": "…",
  "additionalNotes": "…"
}
```

Response (201):
```json
{ "evaluation": { /* CoachEvaluation doc */ } }
```

### GET `/api/coaches/evaluations`
List evaluations created by the authenticated coach.

Response:
```json
{ "evaluations": [ /* populated CoachEvaluation docs */ ] }
```

---

## Admin API
All `/api/admin/*` routes require auth and `admin` role.

### GET `/api/admin/users`
List users.

Response:
```json
{ "users": [ /* User.toPublic() */ ] }
```

### PUT `/api/admin/users/:id`
Update user fields (including role, and optionally password).

Body:
```json
{
  "firstName": "…",
  "lastName": "…",
  "email": "…",
  "role": "teacher|coach|admin",
  "password": "•••"
}
```

Response:
```json
{ "user": { /* updated toPublic */ } }
```

### DELETE `/api/admin/users/:id`
Response:
```json
{ "message": "User deleted." }
```

### POST `/api/admin/users`
Create any user (including admin).

Body matches `POST /api/auth/signup` fields.

Response (201):
```json
{ "user": { /* created toPublic */ } }
```

---

### GET `/api/admin/cycles`
List all cycles with populated teachers.

Response:
```json
{ "cycles": [ /* TeacherCycle docs */ ] }
```

### GET `/api/admin/cycles/:id`
Fetch full cycle details for any teacher.

Response includes `paso1`, `paso2General`, `paso2`, `paso3General`, `paso3`, `paso4General`, `paso4`, `paso5`, `paso6`, `students`, `lessonPlan`, and `evaluations`.

---

### GET `/api/admin/lesson-plans`
List all lesson plans with populated teachers.

Response:
```json
{ "lessonPlans": [ /* LessonPlan docs */ ] }
```

### GET `/api/admin/evaluations`
List all coach evaluations with populated coach and teacher.

Response:
```json
{ "evaluations": [ /* CoachEvaluation docs */ ] }
```

