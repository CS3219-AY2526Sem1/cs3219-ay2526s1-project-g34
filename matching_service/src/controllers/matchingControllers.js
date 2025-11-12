// AI Assistance Disclosure
// Tool: ChatGPT (GPT-5 Thinking), date: 2025-11-13
// Scope: Assisted in refactoring matching logic and queue management functions,
// improving readability, edge-case handling, and timeout cleanup.
// Also provided learning support on JavaScript Maps, arrays, and async patterns.
// Author review: All AI suggestions were reviewed, tested, and refined by the author(s).


const QUESTION_BASE = process.env.QUESTION_SERVICE_URL || 'http://question_service:3002';
const COLLAB_BASE   = process.env.COLLABORATION_SERVICE_URL || 'http://collaboration_service:3003';

// ---------------- In-memory state ----------------
/**
 * pools: Map<difficulty, Map<topicKey, Array<{userId, topic, ts}>>>
 * pendingByUser: Map<userId, { difficulty, topicKey }>
 * sessionsByUser: Map<userId, { id: sessionId, users: [a,b], question, createdAt }>
 */
const pools = new Map();
const pendingByUser = new Map();
const sessionsByUser = new Map();

const MATCH_TTL_MS = 20_000;        // queue timeout
const MATCH_CACHE_TTL_MS = 5_000;  // session cache timeout

const TOPIC_ALL = 'all';

const now = () => Date.now();

// ---------------- Queue helpers ----------------
function normalizeDifficulty(d) {
  if (!d) return null;
  return String(d).toLowerCase();
}
function normalizeTopic(topic) {
  if (topic == null) return null;              // null/undefined -> any topic
  const t = String(topic).trim().toLowerCase();
  if (t === '' || t === 'all') return null;    // empty/'all' -> any topic
  return t;                                     
}


function getTopicMap(difficulty) {
  const diff = normalizeDifficulty(difficulty);
  if (!diff) throw new Error('difficulty required');
  if (!pools.has(diff)) pools.set(diff, new Map());
  const topicMap = pools.get(diff);
  // ensure the "all" queue exists so Case B has a place to enqueue
  if (!topicMap.has(TOPIC_ALL)) topicMap.set(TOPIC_ALL, []);
  return topicMap;
}

function getQueue(difficulty, topicKey) {
  const topicMap = getTopicMap(difficulty);
  const k = topicKey || TOPIC_ALL;
  if (!topicMap.has(k)) topicMap.set(k, []);
  return topicMap.get(k);
}

/**
 * Prune expired entries from the FRONT of a FIFO queue.
 * Returns how many entries were removed.
 */
function dropExpiredFromQueue(q) {
  if (!q.length) return 0;

  const nowMs = now();
  const ttl   = MATCH_TTL_MS;

  // find first non-expired entry; everything before it is expired
  let cut = 0;
  while (cut < q.length) {
    const entry = q[cut];
    if ((nowMs - entry.ts) <= ttl) break;   // first alive
    pendingByUser.delete(entry.userId);     // clean pointer for expired
    cut++;
  }

  if (cut > 0) q.splice(0, cut);            // remove the expired prefix
  return cut;
}


function cleanupExpiredSessions() {
  const t = now();
  for (const [userId, session] of sessionsByUser.entries()) {
    if ((t - session.createdAt) > MATCH_CACHE_TTL_MS) {
      sessionsByUser.delete(userId);
    }
  }
}

/**
 * Given multiple queues, find the single oldest entry (excluding a given userId).
 * Returns {queue, index, entry} or null
 */
function pickOldestAcross(queues, excludeUserId) {
  let best = null;
  for (const q of queues) {
    dropExpiredFromQueue(q);
    if (q.length === 0) continue;
    const front = q[0];  // oldest in that queue
    if (front.userId === excludeUserId) continue;
    if (!best || front.ts < best.entry.ts) {
      best = { queue: q, index: 0, entry: front };
    }
  }
  return best;
}


/**
 * Remove an entry from a queue by index and clear its pending pointer.
 */
function takeFromQueue(best) {
  const { queue, index, entry } = best;
  queue.splice(index, 1);
  pendingByUser.delete(entry.userId);
  return entry;
}

// ---------------- Remote helpers ----------------
async function getRandomQuestion(difficulty, selectedTopic) {
  let url = `${QUESTION_BASE}/questions/random`;
  const params = [];
  if (difficulty) params.push(`difficulty=${encodeURIComponent(difficulty)}`);
  if (selectedTopic) params.push(`topic=${encodeURIComponent(selectedTopic)}`);
  if (params.length) url += `?${params.join('&')}`;

  const questionResponse = await fetch(url);
  if (!questionResponse.ok) {
    return { error: 'Failed to fetch question for match; please try again.' };
  }
  return questionResponse.json();
}

async function createCollabSession() {
  const res = await fetch(`${COLLAB_BASE}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '(no body)');
    throw new Error(`Collab create failed ${res.status}: ${body}`);
  }
  return res.json(); // { matchId }
}

// ---------------- Match finalization ----------------
async function postMatchSafe(res, a, b, difficulty, selectedTopic) {
  try {
    cleanupExpiredSessions();

    // Question: prefer the chosen topic if provided, else empty string means "any"
    const topicForQuestion = selectedTopic || '';
    const question = await getRandomQuestion(difficulty, topicForQuestion);
    if (question && question.error) {
      return res.status(500).json({ error: 'Failed to fetch question for match; please try again.' });
    }

    const { matchId } = await createCollabSession();

    pendingByUser.delete(a);
    pendingByUser.delete(b);

    const cached = {
      id: matchId,
      users: [a, b],
      question,
      createdAt: now(),
    };
    sessionsByUser.set(a, cached);
    sessionsByUser.set(b, cached);

    return res.json({
      matched: true,
      sessionId: matchId,
      partnerId: b,
      question
    });
  } catch (e) {
    console.error('postMatch failed:', e);
    return res.status(500).json({ error: 'Match found, but setup failed; please try again.' });
  }
}

// ---------------- Controllers ----------------
async function findMatch(req, res) {
  const { userId, difficulty, topic } = req.body || {};
  if (!userId || !difficulty) {
    return res.status(400).json({ error: 'Missing matching criteria.' });
  }

  const uid  = String(userId);
  const diff = normalizeDifficulty(difficulty);
  const chosenTopic = normalizeTopic(topic); // null means "any topic"

  // Quick question-existence probe so we fail fast on impossible filters
  {
    const probe = await getRandomQuestion(diff, chosenTopic || '');
    if (probe && probe.error) {
      return res.status(400).json({ error: 'No such question exists. Please choose other types of question.' });
    }
  }

  // Prevent double-enqueue
  if (pendingByUser.has(uid)) {
    const p = pendingByUser.get(uid);
    return res.json({ matched: false, message: 'Already queued, waiting for a partner.', pool: `${p.difficulty}:${p.topicKey}` });
  }

  // Ensure structures exist
  const topicMap = getTopicMap(diff);

  // ---------- CASE A: topic chosen ----------
  if (chosenTopic !== null) {
    const strictQueue = getQueue(diff, chosenTopic);   // selected topic
    const allQueue    = getQueue(diff, TOPIC_ALL);     // flexible partners

    // Find globally oldest among these two queues (excluding self)
    const best = pickOldestAcross([strictQueue, allQueue], uid);
    if (best) {
      const mate = takeFromQueue(best);
      // Keep the requester's chosen topic for the question
      return postMatchSafe(res, uid, mate.userId, diff, chosenTopic);
    }

    // No partner found → enqueue into the strict topic queue
    const entry = { userId: uid, topic: chosenTopic, ts: now() };
    strictQueue.push(entry);
    pendingByUser.set(uid, { difficulty: diff, topicKey: chosenTopic });
    return res.json({ matched: false, message: 'Queued, waiting for a partner.', pool: `${diff}:${chosenTopic}` });
  }

  // ---------- CASE B: no topic chosen (flex across topics; OLDEST wins) ----------
  {
    // Gather all queues under this difficulty (every topic incl. "all")
    const queues = [];
    for (const [topicKey, q] of topicMap.entries()) {
      // include every queue: specific topics and "all"
      queues.push(q);
    }

    const best = pickOldestAcross(queues, uid);
    if (best) {
      const mate = takeFromQueue(best);
      const pickedTopic = mate.topic || ''; // if mate had no specific topic, means "any"
      return postMatchSafe(res, uid, mate.userId, diff, pickedTopic);
    }
  }

  // No partner anywhere → enqueue into "all" for this difficulty
  {
    const allQueue = getQueue(diff, TOPIC_ALL);
    const entry = { userId: uid, topic: null, ts: now() };
    allQueue.push(entry);
    pendingByUser.set(uid, { difficulty: diff, topicKey: TOPIC_ALL });
    return res.json({ matched: false, message: 'Queued, waiting for a partner.', pool: `${diff}:${TOPIC_ALL}` });
  }
}

async function getMatchStatus(req, res) {
  const uid = String(req.query.userId || '');
  if (!uid) return res.status(400).json({ error: 'Missing userId.' });


  if (pendingByUser.has(uid)) {
    return res.json({ matched: false, status: 'WAITING' });
  }

  cleanupExpiredSessions();

  const local = sessionsByUser.get(uid);
  if (local) {
    return res.json({
      matched: true,
      sessionId: local.id,
      partnerId: local.users.find(u => u !== uid),
      question: local.question
    });
  }

  return res.json({ matched: false, status: 'EXPIRED' });
}

async function cancelMatch(req, res) {
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'Missing userId.' });

  const uid = String(userId);
  const pending = pendingByUser.get(uid);
  if (!pending) {
    return res.status(400).json({ error: 'User is not in the matching queue.' });
  }

  const q = getQueue(pending.difficulty, pending.topicKey);
  // Remove user from that queue
  for (let i = 0; i < q.length; i++) {
    if (q[i].userId === uid) {
      q.splice(i, 1);
      break;
    }
  }
  pendingByUser.delete(uid);
  return res.json({ cancelled: true, message: 'User has been removed from the matching queue.' });
}

module.exports = { findMatch, getMatchStatus, cancelMatch };
