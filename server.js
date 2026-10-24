// Local TeamFit server. API keys stay in this process and are never served as static files.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { MODEL, MAX_REQUEST_CHARS, createPayload, responseText, validateDraft } = require('./lib/interpretation');
const publicFolder = path.join(__dirname, 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

function sendJson(response, status, body) { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); response.end(JSON.stringify(body)); }
function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => { body += chunk; if (body.length > MAX_REQUEST_CHARS + 1000) request.destroy(); });
    request.on('end', () => { try { resolve(JSON.parse(body)); } catch { reject(new Error('invalid_json')); } });
    request.on('error', () => reject(new Error('read_error')));
  });
}
async function interpret(request, response, fetchImpl) {
  if (!process.env.OPENAI_API_KEY) return sendJson(response, 503, { error: 'AI interpretation is not configured locally.' });
  let input;
  try { input = await readJson(request); } catch { return sendJson(response, 400, { error: 'Provide valid request text.' }); }
  const requestText = typeof input.requestText === 'string' ? input.requestText.trim() : '';
  if (requestText.length < 10 || requestText.length > MAX_REQUEST_CHARS) return sendJson(response, 400, { error: `Request text must be 10–${MAX_REQUEST_CHARS} characters.` });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  let apiResponse;
  try {
    apiResponse = await fetchImpl('https://api.openai.com/v1/responses', { method: 'POST', signal: controller.signal, headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(createPayload(requestText)) });
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
}
function serveStatic(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405); response.end('Method not allowed'); return; }
  const requestPath = request.url === '/' ? 'index.html' : request.url.replace(/^\//, '');
  let safePath;
  try { safePath = decodeURIComponent(requestPath); } catch { response.writeHead(400); response.end('Invalid path'); return; }
  const filePath = path.resolve(publicFolder, safePath);
  const relativePath = path.relative(publicFolder, filePath);
  const outside = relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath);
  if (outside || path.basename(filePath).startsWith('.') || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) { response.writeHead(404); response.end('Not found'); return; }
  response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
  if (request.method === 'HEAD') return response.end();
  fs.createReadStream(filePath).pipe(response);
}
function createServer(fetchImpl = fetch) { return http.createServer((request, response) => request.method === 'POST' && request.url === '/api/interpret-request' ? interpret(request, response, fetchImpl) : serveStatic(request, response)); }
if (require.main === module) createServer().listen(3000, () => console.log('TeamFit is running at http://localhost:3000'));
module.exports = { createServer };
