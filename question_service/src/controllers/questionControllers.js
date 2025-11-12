// AI Assistance Disclosure
// Tool: ChatGPT (GPT-5 Thinking), date: 2025-11-13
// Scope: Helped refine controller logic for question creation, update, and random selection.
// Included small refactors such as the normTopics helper, validation for difficulty/topics,
// and error-handling improvements for 400/404/500 cases.
// Also used for learning support on JavaScript arrays, Sets, and Sequelize usage patterns.
// Author review: All AI-generated suggestions were reviewed, edited, and tested by the author(s).


const { Question } = require('../../models');

const ALLOWED_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

/* ---------- helpers ---------- */

function normTopics(val) {
  if (val == null) return [];

  let arr = [];
  if (Array.isArray(val)) arr = val;
  else if (typeof val === 'string') arr = [val];
  else return [];

  return arr
    .map(s => String(s).trim())     // trim each entry
    .filter(Boolean);               // remove empty strings
}

/* ---------- controller functions ---------- */
// POST /questions
async function createQuestion(req, res) {
  try {
    const { title, description, difficulty, topics } = req.body;

    if (!title || !description || !difficulty) {
      return res.status(400).json({ error: 'title, description, difficulty are required' });
    }
    if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
      return res.status(400).json({ error: 'difficulty must be one of: easy | medium | hard' });
    }

    const q = await Question.create({
      title: String(title).trim(),
      description,
      difficulty,
      topics: normTopics(topics),
      
    });
    return res.status(201).json(q);
  } catch (e) {
    if (e?.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Title already exists' });
    }
    console.error('[questions.create]', e);
    return res.status(500).json({ error: 'Failed to create question' });
  }
}


// GET /questions
async function listQuestions(req, res) {
  try {
    const questions = await Question.findAll({
      order: [['id', 'ASC']],
    });
    return res.json({ data: questions });
  } catch (e) {
    console.error('[questions.list]', e);
    return res.status(500).json({ error: e.message || 'Failed to list questions' });
  }
}

// // GET /questions/:id
// async function getQuestionById(req, res) {
//   try {
//     const q = await Question.findByPk(req.params.id);
//     if (!q) return res.status(404).json({ error: 'Not found' });
//     return res.json(q);
//   } catch (e) {
//     console.error('[questions.getOne]', e);
//     return res.status(500).json({ error: 'Failed to fetch question' });
//   }
// }

// PATCH /questions/:id
async function updateQuestionById(req, res) {
  try {
    const q = await Question.findByPk(req.params.id);
    if (!q) return res.status(404).json({ error: 'Not found' });

    const payload = {};
    if (req.body.title !== undefined) payload.title = String(req.body.title).trim();
    if (req.body.description !== undefined) payload.description = req.body.description;
    if (req.body.difficulty !== undefined) {
      const d = req.body.difficulty;
      if (!ALLOWED_DIFFICULTIES.has(d)) {
        return res.status(400).json({ error: 'invalid difficulty' });
      }
      payload.difficulty = d;
    }
    if (req.body.topics !== undefined) payload.topics = normTopics(req.body.topics);

    await q.update(payload);
    return res.json(q);
  } catch (e) {
    if (e?.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Title already exists' });
    }
    console.error('[questions.update]', e);
    return res.status(500).json({ error: 'Failed to update question' });
  }
}

// DELETE /questions/:id
async function deleteQuestionById(req, res) {
  try {
    const q = await Question.findByPk(req.params.id);
    if (!q) return res.status(404).json({ error: 'Not found' });
    await q.destroy();
    return res.status(204).end();
  } catch (e) {
    console.error('[questions.delete]', e);
    return res.status(500).json({ error: 'Failed to delete question' });
  }
}

// GET /questions/random?difficulty=&topic=
async function randomQuestion(req, res) {
  try {
    const { difficulty, topic } = req.query;

    const where = {};
    if (difficulty) {
      if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
        return res.status(400).json({ error: 'invalid difficulty' });
      }
      where.difficulty = difficulty;
    }

    let candidates = await Question.findAll({ where, order: [['id', 'ASC']] });

    if (topic) {
      const t = String(topic).toLowerCase();
      candidates = candidates.filter(
        r => Array.isArray(r.topics) && r.topics.map(x => String(x).toLowerCase()).includes(t)
      );
    }

    if (candidates.length === 0) return res.status(404).json({ error: 'No matching question found' });

    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    return res.json(pick);
  } catch (e) {
    console.error('[questions.random]', e);
    return res.status(500).json({ error: 'Failed to select random question' });
  }
}

// GET /questions/topics
async function getUniqueTopics(req, res) {
  try {
    const questions = await Question.findAll({
      attributes: ['topics'],
    });
    const topicSet = new Set();
    questions.forEach(q => {
      q.topics.forEach(topic => topicSet.add(topic));
    });
    console.log('Unique topics:', Array.from(topicSet));
    return res.json({ topics: Array.from(topicSet) });
  } catch (e) {
    console.error('[questions.getUniqueTopics]', e);
    return res.status(500).json({ error: 'Failed to get unique topics' });
  } 
}

module.exports = {
  createQuestion,
  listQuestions,
  // getQuestionById,
  updateQuestionById,
  deleteQuestionById,
  randomQuestion,
  getUniqueTopics,
};

