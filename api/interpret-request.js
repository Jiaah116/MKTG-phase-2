const { MODEL, MAX_REQUEST_CHARS, createPayload, responseText, validateDraft } = require('../lib/interpretation');

function sendJson(response, status, body) {
  response.status(status);
  response.setHeader('Cache-Control', 'no-store');
  response.json(body);
}

function requestBody(request) {
  if (request.body && typeof request.body === 'object') return request.body;
  if (typeof request.body !== 'string') return null;
  try { return JSON.parse(request.body); } catch { return null; }
}

module.exports = async function interpretRequest(request, response) {
  if (request.method !== 'POST') return sendJson(response, 405, { error: 'Method not allowed.' });
  if (!process.env.OPENAI_API_KEY) return sendJson(response, 503, { error: 'AI interpretation is not configured for this deployment.' });

  const body = requestBody(request);
  const requestText = typeof body?.requestText === 'string' ? body.requestText.trim() : '';
  if (requestText.length < 10 || requestText.length > MAX_REQUEST_CHARS) return sendJson(response, 400, { error: `Request text must be 10–${MAX_REQUEST_CHARS} characters.` });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  let apiResponse;
  try {
    apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload(requestText))
    });
  } catch (error) {
    clearTimeout(timeout);
    return sendJson(response, error.name === 'AbortError' ? 504 : 502, { error: error.name === 'AbortError' ? 'Interpretation timed out. Try again.' : 'Interpretation service is unavailable. Try again.' });
  }
  clearTimeout(timeout);

  let apiData;
  try { apiData = await apiResponse.json(); } catch { return sendJson(response, 502, { error: 'Interpretation returned an invalid response.' }); }
  if (!apiResponse.ok) return sendJson(response, 502, { error: 'Interpretation service rejected the request. Try again later.' });
  if (apiData.status !== 'completed') return sendJson(response, 422, { error: apiData.status === 'incomplete' ? 'Interpretation was incomplete. Try again with a shorter request.' : 'Interpretation could not complete safely.' });

  const text = responseText(apiData);
  if (!text) return sendJson(response, 422, { error: 'Interpretation was refused or returned no usable draft.' });
  try { return sendJson(response, 200, { model: apiData.model || MODEL, draft: validateDraft(JSON.parse(text), requestText) }); }
  catch { return sendJson(response, 422, { error: 'Interpretation returned an invalid draft. Nothing was applied.' }); }
};
