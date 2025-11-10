// matchingController.js

const { get } = require("../routes/matchingRoutes");
const QUESTION_BASE = process.env.QUESTION_SERVICE_URL || 'http://question_service:3002';
const COLLAB_BASE   = process.env.COLLABORATION_SERVICE_URL || 'http://collaboration_service:3003';


// // --- Replace these with your actual services ---
// const questionService = require('../services/questionService');
// const collaborationService = require('../services/collaborationService');

// ---------------- In-memory state ----------------
/**
 * pools: Map<poolKey, Array<{userId, topic, ts}>>
 * pendingByUser: Map<userId, poolKey>   // where is this user queued?
 * sessionsByUser: Map<userId, { id: sessionId, users: [a,b], questionId, createdAt }>
 */
const pools = new Map();
const pendingByUser = new Map();
const sessionsByUser = new Map();

const MATCH_TTL_MS = 20_000;        // 60s queue timeout
const MATCH_CACHE_TTL_MS = 10_000; // 10s session cache


const keyOf = ({ difficulty, topic }) =>
  `${String(difficulty).toLowerCase()}:${String(topic || 'all').toLowerCase()}`;

const now = () => Date.now();

function getQueue(key) {
  if (!pools.has(key)) pools.set(key, []);
  return pools.get(key);
}

function normalizeTopic(topic) {
  return topic ? String(topic).toLowerCase() : null; // null => "all" bucket
}

function dropExpiredFromQueue(q) {
  const t = now();
  let i = 0, w = 0;
  while (i < q.length) {
    const keep = (t - q[i].ts) <= MATCH_TTL_MS;
    if (keep) q[w++] = q[i];
    else pendingByUser.delete(q[i].userId);
    i++;
  }
  q.length = w;
}

function dequeueOldestOtherThan(q, userId) {
  for (let i = 0; i < q.length; i++) {
    if (q[i].userId !== userId) {
      const mate = q[i];
      q.splice(i, 1);
      pendingByUser.delete(mate.userId);
      return mate;
    }
  }
  return null;
}


function cleanupExpiredSessions() {
    const t = now();
    for (const [userId, session] of sessionsByUser.entries()) {
        if ((t - session.createdAt) > MATCH_CACHE_TTL_MS) {
            sessionsByUser.delete(userId);
        }
    }
}

async function getRandomQuestion(difficulty,  selectedTopic) {
    let questionUrl = `${QUESTION_BASE}/questions/random`;
    if (difficulty && selectedTopic) {
        questionUrl += `?difficulty=${difficulty}&topic=${selectedTopic}`;
    } else if (difficulty) {
        questionUrl += `?difficulty=${difficulty}`;
    } else if (selectedTopic) {
        questionUrl += `?topic=${selectedTopic}`;
    }
    const questionResponse = await fetch(questionUrl);
    if (!questionResponse.ok) {
        // Returns an object containing the error message
        return { error: 'Failed to fetch question for match; please try again.' }; 
    }
    // Returns the question object itself
    const question = await questionResponse.json(); 
    return question;
}


// ---------------- Internal helper ----------------
async function postMatchSafe(res, a, b, difficulty, selectedTopic) {
  try {
    cleanupExpiredSessions();
    let questionUrl = `${QUESTION_BASE}/questions/random`;
    if (difficulty && selectedTopic) {
        questionUrl += `?difficulty=${difficulty}&topic=${selectedTopic}`;
    } else if (difficulty) {
        questionUrl += `?difficulty=${difficulty}`;
    } else if (selectedTopic) {
        questionUrl += `?topic=${selectedTopic}`;
    }

    const topicForQuestion = selectedTopic || '';
    const questionResponse = await fetch(questionUrl);
    if (!questionResponse.ok) {
      // FIX: use questionResponse, not response
      const body = await questionResponse.text().catch(() => '(no body)');
      console.error(
        `Failed to fetch question: status=${questionResponse.status}, url=/questions/random`,
        body
      );
      return res.status(500).json({ error: 'Failed to fetch question for match; please try again.' });
    }
    const question = await questionResponse.json();

    const collabRes = await fetch(`${COLLAB_BASE}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // your collab service ignores body for now
    });
    if (!collabRes.ok) {
      const body = await collabRes.text().catch(() => '(no body)');
      console.error(
        `Failed to create collaboration session: status=${collabRes.status}, url=/matches`,
        body
      );
      return res.status(500).json({ error: 'Failed to create collaboration session; please try again.' });
    }
    const { matchId } = await collabRes.json();

    // remove from pending if present
    pendingByUser.delete(a);
    pendingByUser.delete(b);

    // cache session so /status can report matched
   const cached = {
      id: matchId,
      users: [a, b],
      question: question,
      createdAt: now(),
    };
    sessionsByUser.set(a, cached);
    sessionsByUser.set(b, cached);

    return res.json({
      matched: true,
      sessionId: matchId,
      partnerId: b,
      question: question
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

    
    const questionExists_response  = await getRandomQuestion(difficulty, topic);
    if (questionExists_response.error) {
        return res.status(400).json({ error: "No such question exists. please choose other types of question" });
    }
  
    


  const uid  = String(userId);                  // normalize
  const diff = String(difficulty).toLowerCase();
  const t    = normalizeTopic(topic);           // null if “any”

  const strictKey = keyOf({ difficulty: diff, topic: t });      // "<diff>:<topic>" or "<diff>:all" when t==null
  const flexKey   = keyOf({ difficulty: diff, topic: 'all' });  // always "<diff>:all"

  // Already queued? don't double-enqueue
  if (pendingByUser.has(uid)) {
    return res.json({
      matched: false,
      message: 'Already queued, waiting for a partner.',
      pool: pendingByUser.get(uid)
    });
  }

  // --- CASE A: topic chosen (no cross-topic fallback) ---
  if (t !== null) {
    // 1) strict same-topic
    {
      const q = getQueue(strictKey);
      dropExpiredFromQueue(q);
      const mate = dequeueOldestOtherThan(q, uid);
      if (mate) {
        return postMatchSafe(res, uid, mate.userId, diff, t); // keep requester’s topic
      }
    }
    // 2) any-topic pool: partner is flexible; keep requester’s topic
    {
      const q = getQueue(flexKey);
      dropExpiredFromQueue(q);
      const mate = dequeueOldestOtherThan(q, uid);
      if (mate) {
        return postMatchSafe(res, uid, mate.userId, diff, t);
      }
    }
    // 3) enqueue into strict topic queue
    const entry = { userId: uid, topic: t, ts: now() };
    getQueue(strictKey).push(entry);
    pendingByUser.set(uid, strictKey);
    return res.json({ matched: false, message: 'Queued, waiting for a partner.', pool: strictKey });
  }

  // --- CASE B: no topic chosen (flex across topics; OLDEST wins) ---
  {
    const prefix = `${diff}:`;
    let bestMate = null;  // { userId, topic, ts }
    let bestKey  = null;
    let bestIdx  = -1;

    // scan all queues for this difficulty (incl. :all and specific topics)
    for (const [key, q] of pools.entries()) {
      if (!key.startsWith(prefix)) continue;

      dropExpiredFromQueue(q);

      // find true oldest across all queues, excluding self
      for (let i = 0; i < q.length; i++) {
        const entry = q[i];
        if (entry.userId === uid) continue;
        if (!bestMate || entry.ts < bestMate.ts) {
          bestMate = entry;
          bestKey  = key;
          bestIdx  = i;
        }
      }
    }

    if (bestMate) {
      const q = getQueue(bestKey);
      q.splice(bestIdx, 1);
      pendingByUser.delete(bestMate.userId);

      const chosenTopic = bestMate.topic || ''; // flex to partner’s topic ('' if both any)
      return postMatchSafe(res, uid, bestMate.userId, diff, chosenTopic);
    }
  }

  // No mate → enqueue into any-topic pool
  const entry = { userId: uid, topic: null, ts: now() };
  getQueue(flexKey).push(entry);
  pendingByUser.set(uid, flexKey);
  return res.json({ matched: false, message: 'Queued, waiting for a partner.', pool: flexKey });
}


async function getMatchStatus(req, res) {
  const uid = String(req.query.userId || '');
  if (!uid) return res.status(400).json({ error: 'Missing userId.' });

  // If user is queued, clean expired entries first
  const key = pendingByUser.get(uid);
  if (key) dropExpiredFromQueue(getQueue(key));

  // After cleanup: still queued?
  if (pendingByUser.has(uid)) {
    return res.json({ matched: false, status: 'WAITING' });
  }

  cleanupExpiredSessions();

  // check on local cache
  const local = sessionsByUser.get(uid);
  if (local) return res.json({ 
    matched: true, 
    sessionId: local.id,
    partnerId: local.users.find(u => u !== uid),
    question: local.question});

  // Not pending + no session anywhere = expired
  return res.json({ matched: false, status: 'EXPIRED' });
}


async function cancelMatch(req, res) {
    const { userId } = req.body || {};
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId.' });
    }
    const uid = String(userId);

    const key = pendingByUser.get(uid);
    if (!key) {
        return res.status(400).json({ error: 'User is not in the matching queue.' });
    }
    const q = getQueue(key);
    // Remove user from the queue
    for (let i = 0; i < q.length; i++) {
        if (q[i].userId === uid) {
            q.splice(i, 1);
            break;
        }
    }
    pendingByUser.delete(uid);
    return res.json({ cancelled: true, message: 'User has been removed from the matching queue.' });
}

module.exports = { findMatch, getMatchStatus , cancelMatch};
