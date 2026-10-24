const MODEL = 'gpt-6-luna';
const MAX_REQUEST_CHARS = 12000;
const MAX_OUTPUT_TOKENS = 1200;

const fact = { type: 'object', additionalProperties: false, properties: { text: { type: 'string' }, excerpt: { type: 'string' } }, required: ['text', 'excerpt'] };
const schema = {
  type: 'object', additionalProperties: false,
  properties: {
    deliverables: { type: 'array', items: fact },
    quantities: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { quantity: { type: 'string' }, deliverable: { type: 'string' }, excerpt: { type: 'string' } }, required: ['quantity', 'deliverable', 'excerpt'] } },
    deadlines: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { text: { type: 'string' }, excerpt: { type: 'string' }, needs_clarification: { type: 'boolean' } }, required: ['text', 'excerpt', 'needs_clarification'] } },
    materials: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { text: { type: 'string' }, status: { type: 'string', enum: ['supplied', 'promised', 'missing', 'unclear'] }, excerpt: { type: 'string' } }, required: ['text', 'status', 'excerpt'] } },
    missing_information: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { item: { type: 'string' }, question: { type: 'string' } }, required: ['item', 'question'] } },
    clarification_questions: { type: 'array', items: { type: 'string' } }
  },
  required: ['deliverables', 'quantities', 'deadlines', 'materials', 'missing_information', 'clarification_questions']
};

const instructions = 'Extract only facts explicitly stated in the client request. Return JSON matching the schema. Every deliverable, quantity, deadline, and material must include an exact, continuous, verbatim substring from the request. Never use ellipses, omissions, stitched phrases, paraphrases, rewritten wording, or punctuation changes in an excerpt. Use the complete source sentence when that is needed for a faithful excerpt; for example, use "Approved copy and existing brand guidelines are attached." exactly rather than an abbreviated fragment. Do not infer or invent effort estimates, required skills, employee availability, calendar dates, or material approval status. Keep relative or ambiguous dates, such as Friday, exactly as written and mark needs_clarification true. For every deadline marked needs_clarification, add a clarification_questions entry that asks for its exact calendar date. Materials may be supplied, promised, missing, or unclear only when that status is explicit. Put gaps and questions only in missing_information and clarification_questions.';

function supported(text, excerpt) { return typeof excerpt === 'string' && excerpt.trim().length > 0 && text.includes(excerpt); }
function normaliseQuestion(value) { return String(value || '').toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' '); }
function questionReferencesItem(question, item) {
  const terms = normaliseQuestion(item).split(' ').filter((term) => term.length > 2);
  const text = normaliseQuestion(question);
  return terms.length > 0 && terms.every((term) => text.includes(term));
}
function validateDraft(draft, sourceText) {
  const result = { ...draft };
  for (const key of ['deliverables', 'quantities', 'deadlines', 'materials']) result[key] = Array.isArray(draft?.[key]) ? draft[key].map((item) => ({ ...item, supported: supported(sourceText, item.excerpt) })) : [];
  result.missing_information = Array.isArray(draft?.missing_information) ? draft.missing_information : [];
  const modelQuestions = Array.isArray(draft?.clarification_questions) ? draft.clarification_questions : [];
  const questions = [];
  const addQuestion = (question) => {
    if (typeof question !== 'string' || !question.trim()) return;
    if (!questions.some((existing) => normaliseQuestion(existing) === normaliseQuestion(question))) questions.push(question.trim());
  };
  for (const item of result.missing_information) addQuestion(item.question);
  for (const question of modelQuestions) {
    const repeatsMissingItem = result.missing_information.some((item) => questionReferencesItem(question, item.item));
    const repeatsAmbiguousDeadline = result.deadlines.some((deadline) => deadline.needs_clarification && deadline.text && normaliseQuestion(question).includes(normaliseQuestion(deadline.text)));
    if (!repeatsMissingItem && !repeatsAmbiguousDeadline) addQuestion(question);
  }
  for (const deadline of result.deadlines) {
    if (!deadline.needs_clarification || !deadline.text) continue;
    const question = `What is the exact calendar date for "${deadline.text}"?`;
    addQuestion(question);
  }
  result.clarification_questions = questions;
  return result;
}
function responseText(response) {
  const parts = [];
  for (const item of response?.output || []) for (const content of item.content || []) if (content.type === 'output_text' && typeof content.text === 'string') parts.push(content.text);
  return parts.join('');
}
function createPayload(requestText) {
  return { model: MODEL, store: false, max_output_tokens: MAX_OUTPUT_TOKENS, reasoning: { effort: 'none' }, instructions, input: requestText, text: { format: { type: 'json_schema', name: 'teamfit_request_interpretation', strict: true, schema } } };
}
module.exports = { MODEL, MAX_REQUEST_CHARS, createPayload, responseText, validateDraft };
