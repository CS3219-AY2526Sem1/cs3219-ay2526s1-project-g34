# AI Usage Log

## Project Context
**Project:** PeerPrep - Collaborative Coding Platform
**Enhancement Focus:** Syntax Highlighting, Bug Fixes
**AI Tool:** GitHub Copilot (Claude Sonnet 3.5)
**Development Period:** 12 November 2024
**Developer:** Student Team (reviewed and validated all AI outputs)

---

## UI/UX Design Improvement

**Date/Time:** 2024-11-12 15:30\
**Tool:** GitHub Copilot Chat (Claude Sonnet 4.5)


### Prompt:
```
Improve the project's frontend design by creating more spaces between each text fields and buttons
```

### Output Summary:
AI generated:
- Container flex layout for code editor section 
- Proper margin and padding values
- Height: 400px for code editor and increase the distance between text fields 
- Consistent color scheme with existing UI

### Action Taken:
- [x] Modified - Reviewed and tested all code and UI design before accepting
- Verified backward compatibility with existing features
- Validated UI design aesthetics and usability

### Files Created/Modified:
**Modified Files:**
1. `frontend/package.json`
2. `frontend/src/pages/MatchRoom.jsx`
3. `collaboration_service/server.js`
4. `frontend/src/pages/QuestionManagerPage.jsx`
5. `frontend/src/components/LayoutComponent.jsx`
6. `frontend/src/index.css`
7. `frontend/src/pages/CreateMatchPage.jsx`
8. `frontend/src/pages/HomePage.jsx`
9. `frontend/src/pages/LoginPage.jsx`
10. `frontend/src/pages/MatchesPage.jsx`

### Author Notes:
**Code Validation:**
- Verified that existing code synchronization still worked
- Line numbers and syntax themes were appropriate for coding interviews

**UI/UX Validation:**
- Reviewed color scheme for readability and contrast
- Verified font choices for code readability
- Tested layout responsiveness
- Validated spacing and alignment
- Ensured consistent design with existing PeerPrep UI
- Tested accessibility (keyboard navigation, focus states)
- Verified visual hierarchy and information architecture
- Color scheme appropriate for long coding sessions (dark theme reduces eye strain)
- Language selector positioned intuitively above code editor

---

## Enhancement - Syntax Highlighting Feature
**Date/Time:** 2024-11-12 15:30\
**Tool:** GitHub Copilot Chat (Claude Sonnet 4.5)\
**Phase:** Feature Implementation (N1: Service Enhancements)

### Prompt:
```
based on the project, i would like to make a few enhancements. do note that when doing 
the enhancements, do not overwrite/ change existing functionalities and endpoints

enhancement: 
Enhanced Code Editor (N1 : Service Enhancements)
Syntax Highlighting : Colours keywords, variables, and comments

Integrates directly with Collaboration Service, enhancing real-time coding experience. 
Improves learning efficiency and reduces friction during pair programming sessions.
Reinforces PeerPrep's goal of realistic interview simulation — similar to LeetCode platform.

Example flow:
When two users are matched and enter the collaboration room, they both interact with 
the enhanced code editor, which provides syntax color for the chosen language 

*do note to follow the endpoints format and do not change anything else
```

### Output Summary:
AI generated:
1. New `CodeEditor.jsx` component with syntax highlighting using `react-syntax-highlighter`
2. Language selection dropdown with 14+ programming languages
3. Socket.IO integration for language synchronization
4. Modified `MatchRoom.jsx` to integrate the new component
5. Updated `collaboration_service/server.js` to handle language state
6. Package.json dependency addition

### Action Taken:
- [x] Modified - Reviewed and tested all code before accepting
- Added dependency to `frontend/package.json`: `react-syntax-highlighter@^15.5.0`
- Verified backward compatibility with existing features

### Files Created/Modified:
**New Files:**
1. `frontend/src/components/CodeEditor.jsx` (AI-generated, developer reviewed)

**Modified Files:**
1. `frontend/package.json` (dependency addition)
2. `frontend/src/pages/MatchRoom.jsx` (integration code)
3. `collaboration_service/server.js` (language state management)

### Author Notes:
- Thoroughly tested the component with multiple programming languages
- Verified that existing code synchronization still worked
- Ensured no existing endpoints or functionality were modified
- Tested with 2 simultaneous users to verify real-time language sync
- Performance was acceptable even with large code files

---

# Date/Time: 
2025-11-8 20:03
# Tool: 
ChatGPT
# Prompt/Command: 
Help me write a simple Dockerfile for a Node.js project using Yarn and Alpine.
# Output Summary: 
Here’s a clean, minimal Dockerfile for a Node.js project using Yarn and Alpine, following good build practices:
# AI Assistance Disclosure # Tool: ChatGPT (GPT-5 Thinking), date: 2025-11-13 # Scope: Generated a simple Dockerfile for Node.js project using Yarn and Alpine base image. # Author review: Verified correctness and tested container build/run locally. # Use a lightweight Node.js image FROM node:20-alpine # Set working directory WORKDIR /app # Copy dependency files first (for layer caching) COPY package.json yarn.lock ./ # Enable Corepack and install dependencies RUN corepack enable \ && yarn config set nodeLinker node-modules \ && yarn install --immutable # Copy the rest of the source code COPY . . # Expose port and start app EXPOSE 3000 CMD ["yarn", "start"] 
✅ Explanation:
⦁ node:20-alpine → small, fast base image.
⦁ Layer caching: copies only package.json and yarn.lock first to avoid reinstalling dependencies unnecessarily.
⦁ Corepack ensures Yarn is available and configured.
⦁ yarn install --immutable guarantees consistent installs.
⦁ EXPOSE 3000 — adjust if your app uses a different port.
Would you like me to make it slightly more “production-ready” (e.g., multi-stage build, non-root user, NODE_ENV=production)?

# Action Taken: 
Accepted as-is 

# 2025-11-10 18:30  
# Tool: ChatGPT 
# Prompt/Command: 
Help me refactor the getRandomQuestion() function to handle topic and difficulty query params more cleanly and return better error messages.

# Output Summary:
async function getRandomQuestion(difficulty, selectedTopic) {
  let url = ${QUESTION_BASE}/questions/random;
  const params = [];
  if (difficulty) params.push(difficulty=${encodeURIComponent(difficulty)});
  if (selectedTopic) params.push(topic=${encodeURIComponent(selectedTopic)});
  if (params.length) url += ?${params.join('&')};
  const questionResponse = await fetch(url);
  if (!questionResponse.ok) {
    return { error: 'Failed to fetch question for match; please try again.' };
  }
  return questionResponse.json();
}
# Action Taken: [x] Modified  




# 2025-11-10 20:05
Tool: ChatGPT (GPT-5 Thinking)
Prompt/Command: “Teach me about how to use JavaScript Map as a HashMap and how to implement a FIFO queue using arrays.”

Output Summary: 
Here’s a short and clear explanation 👇
🧠 Using JavaScript Map as a HashMap
A Map in JavaScript is like a HashMap in other languages — it stores key–value pairs and lets you retrieve data efficiently by key.
Example
const map = new Map(); // Add entries map.set('apple', 10); map.set('banana', 5); // Retrieve a value console.log(map.get('apple')); // 10 // Check if key exists console.log(map.has('banana')); // true // Delete a key map.delete('banana'); // Iterate for (const [key, value] of map) { console.log(key, value); } 
✅ Why Map > Object
⦁ Keys can be any type (not just strings).
⦁ Keeps insertion order.
⦁ Provides helpful methods (set, get, has, delete, clear, size).
⚙️ Implementing a FIFO Queue with Arrays
A queue is First In, First Out (FIFO) — the first element added is the first one removed.
Simple queue
const queue = []; // Enqueue (add to end) queue.push('A'); queue.push('B'); // Dequeue (remove from front) const first = queue.shift(); // 'A' // Peek front console.log(queue[0]); // 'B' // Check if empty console.log(queue.length === 0); 
✅ Efficient variant
If you’re removing lots of elements, shift() can be slow because it reindexes the array.front index:
class Queue { constructor() { this.items = []; this.front = 0; } enqueue(item) { this.items.push(item); } dequeue() { if (this.isEmpty()) return null; return this.items[this.front++]; } isEmpty() { return this.front >= this.items.length; } } 





# 2025-11-10 20:13
# Tool: ChatGPT (GPT-5 Thinking)
# Prompt/Command: need a map of a map and queue inside
# Output:
Here’s how you can make a Map of Maps with a queue (Array) inside each inner map — exactly like your matchingController.js structure
🧩 Concept
You want:
pools = Map<difficulty, Map<topic, Array<userQueue>>> 
That means:
⦁ Outer map → key = difficulty (e.g. "easy", "medium", "hard")
⦁ Inner map → key = topic (e.g. "arrays", "graphs", etc.)
⦁ Value = Array used as a FIFO queue of users waiting to match
💻 Code Example
// Create main pool const pools = new Map(); // Ensure the structure exists function getTopicQueue(difficulty, topic) { // 1️⃣ Normalize difficulty if (!pools.has(difficulty)) { pools.set(difficulty, new Map()); } const topicMap = pools.get(difficulty); // 2️⃣ Normalize topic if (!topicMap.has(topic)) { topicMap.set(topic, []); // Each topic has a queue (array) } // 3️⃣ Return the queue return topicMap.get(topic); } // Example usage: const q1 = getTopicQueue("easy", "arrays"); q1.push({ userId: 101, ts: Date.now() }); const q2 = getTopicQueue("easy", "graphs"); q2.push({ userId: 202, ts: Date.now() }); console.log(pools); 
Result structure:
Map { 'easy' => Map { 'arrays' => [ { userId: 101, ts: 1731517000000 } ], 'graphs' => [ { userId: 202, ts: 1731517000500 } ] } } 
🔁 Accessing and Managing Queues
// Get oldest waiting user const queue = getTopicQueue("easy", "arrays"); const oldest = queue.shift(); // removes first user (FIFO) console.log(oldest); // Check if queue empty if (queue.length === 0) console.log("No one waiting"); 
🧠 Key Points
⦁ Map gives you fast access by difficulty and topic.
⦁ Array acts as a queue (FIFO) for ordered users.
⦁ Map inside a Map keeps your data structured, scalable, and easy to extend.


# 2025-1-20 19:20
# Tool: ChatGPT (GPT-5 Thinking)
# Prompt/Command: “Explain how to use Sequelize models with ARRAY fields and how to normalize array inputs in JavaScript.”
# Output Summary: Sure 👍 — here’s a clear explanation of both parts — Sequelize ARRAY fields and normalizing arrays in JavaScript, just like what you’re doing in your questionControllers.js.
🧩 1. Using Sequelize ARRAY fields
Sequelize supports storing arrays directly in databases that natively handle array types — such as PostgreSQL.
You can define an array column like this:
// Example model: Question.js Question.init({ title: { type: DataTypes.STRING, allowNull: false }, description: { type: DataTypes.TEXT, allowNull: false }, difficulty: { type: DataTypes.ENUM('easy', 'medium', 'hard'), allowNull: false }, topics: { type: DataTypes.ARRAY(DataTypes.TEXT), // store an array of strings allowNull: true, defaultValue: [] } }, { sequelize, modelName: 'Question' }); 
✅ Explanation:
⦁ DataTypes.ARRAY(DataTypes.TEXT) means each record can store an array of text values, like ['array', 'linked list'].
⦁ Only works on PostgreSQL — if you use MySQL/SQLite, you’ll need to store JSON instead.
⦁ defaultValue: [] ensures that if the user doesn’t provide topics, Sequelize saves an empty array instead of NULL.
⚙️ 2. Normalizing array inputs in JavaScript
When you receive user input from a frontend (through req.body.topics), it might come as:
⦁ a single string: "array"
⦁ an array of strings: ["array", "linked list"]
⦁ null, undefined, or even extra spaces
You should normalize it before saving to the database.
Here’s the pattern you used (and it’s perfect):
function normTopics(val) { if (val == null) return []; let arr = []; if (Array.isArray(val)) arr = val; else if (typeof val === 'string') arr = [val]; else return []; return arr .map(s => String(s).trim()) // remove whitespace .filter(Boolean); // remove empty strings } 
✅ What this does:
⦁ Accepts both a single string or an array.
⦁ Trims each topic and removes blanks.
⦁ Returns a clean, consistent array (e.g., ['arrays', 'graphs']).
💡 Example in Action
// Suppose user sends: { topics: "graphs" } const cleanTopics = normTopics(req.body.topics); console.log(cleanTopics); // ["graphs"] // Suppose user sends: { topics: [" arrays ", " ", "trees"] } const cleanTopics = normTopics(req.body.topics); console.log(cleanTopics); // ["arrays", "trees"] // Sequelize saves it cleanly await Question.create({ title: "Binary Search", description: "Implement binary search on sorted array", difficulty: "easy", topics: cleanTopics }); 
✅ Summary
⦁ Use DataTypes.ARRAY(DataTypes.TEXT) to store arrays in PostgreSQL via Sequelize.
⦁ Use a normalization helper (like normTopics) to clean any user input.
⦁ Always default to [] to avoid null-related issues.
⦁ This ensures your Question model stays consistent and safe even with messy frontend inputs.
# Action Taken: [x] Modified  

# 2025-1-21 15:23
# Tool: ChatGPT (GPT-5 Thinking)
# Prompt/Command: can u guide me on the error handling on this question controller?
# Output:
Great question 👍 — here’s a clear, practical explanation of error handling in your Node.js + Sequelize controllers (like in your questionControllers.js).
⚙️ 1. Why error handling matters
Error handling ensures your API responds gracefully instead of crashing when something unexpected happens — for example:
⦁ A database connection error
⦁ Invalid user input
⦁ Duplicate keys (e.g., same title)
⦁ Missing required fields
In Express + Sequelize, you normally wrap controller logic in a try / catch block so that any thrown error can be caught and turned into a proper HTTP response.
🧩 2. Typical pattern (you already use this)
Example from your file:
async function createQuestion(req, res) { try { const { title, description, difficulty, topics } = req.body; if (!title  !description  !difficulty) { return res.status(400).json({ error: 'title, description, difficulty are required' }); } const q = await Question.create({ title: title.trim(), description, difficulty, topics, }); return res.status(201).json(q); } catch (e) { if (e?.name === 'SequelizeUniqueConstraintError') { return res.status(400).json({ error: 'Title already exists' }); } console.error('[questions.create]', e); return res.status(500).json({ error: 'Failed to create question' }); } } 
✅ Key ideas
CaseWhat it doesStatus codeClient mistake (bad/missing data)Return readable message400 Bad RequestNot found (record missing)Return message404 Not FoundDuplicate entryHandle SequelizeUniqueConstraintError400 Bad RequestServer/database crashGeneric fallback in catch500 Internal Server Error
💡 3. Best practices
1. Always validate before hitting the DB
→ prevents unnecessary queries and clearer messages.
1. Use specific Sequelize errors
2. SequelizeValidationError → bad model input
⦁ SequelizeUniqueConstraintError → duplicate key
⦁ SequelizeDatabaseError → SQL-level issues
1. Log technical details but hide them from users
2. console.error('[questions.update]', e); return res.status(500).json({ error: 'Failed to update question' }); 
3. → Developers see the log; users get a friendly message.
4. Use consistent response format
5. { "error": "Failed to delete question" } 
6. Always return JSON even for errors.
7. Don’t leak stack traces or SQL errors
They can expose your DB schema.
🧠 4. Example – Centralized error helper (optional improvement)
Instead of repeating the same code in every controller, you can write:
function handleError(res, e, context) { console.error([${context}], e); if (e.name === 'SequelizeUniqueConstraintError') { return res.status(400).json({ error: 'Duplicate entry' }); } if (e.name === 'SequelizeValidationError') { return res.status(400).json({ error: 'Invalid data' }); } return res.status(500).json({ error: 'Internal server error' }); } 
Then call:
catch (e) { return handleError(res, e, 'questions.create'); } 
✅ Summary
⦁ try / catch every async DB operation.
⦁ Send correct HTTP status (400, 404, 500).
⦁ Log internally, return safe JSON externally.
⦁ Keep responses consistent across controllers.
---

## Verification & Testing Summary

### All AI-Generated Code Was:
1. **Reviewed** - Developer read and understood every line
2. **Tested** - Manually tested with multiple scenarios
3. **Modified** - Adjusted for project-specific needs where necessary
4. **Validated** - Verified against project requirements

### Testing Performed:
- **Unit Testing:** Component rendering and state management
- **Integration Testing:** Socket.IO events between services
- **End-to-end Testing:** Full user flows with 2+ simultaneous users
- **Edge Cases:** Network failures, rapid reconnections, concurrent edits
- **Browser Testing:** Safari, Chrome, Microsoft Edge
- **Performance:** Tested with large code files 

### Developer Contributions Beyond AI:
1. **Documentation:** Developer reviewed and organized all documentation
2. **UI/UX Decisions:** Developer approved visual design choices
3. **Testing Strategy:** Developer designed comprehensive test scenarios
4. **Code Review:** All AI suggestions reviewed for security, performance, and maintainability