/**
 * Enhanced Code Editor Component Usage Guide
 * ===========================================
 * 
 * This guide explains how to use the new CodeEditor component with syntax highlighting.
 */

// IMPORT THE COMPONENT
import { CodeEditor } from '../components/CodeEditor';

// BASIC USAGE
<CodeEditor
  code={code}                    // Current code content (string)
  onChange={handleChange}        // Function to handle code changes
  language="javascript"          // Programming language for highlighting
  placeholder="// Start coding..." // Placeholder text
  theme="light"                  // "light" or "dark" theme
/>

// COMPLETE EXAMPLE
import React, { useState } from 'react';
import { CodeEditor } from '../components/CodeEditor';

function MyCollaborativeEditor() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    // Emit to socket or save to state
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    // Sync language with other users via socket
  };

  return (
    <div>
      {/* Language Selector */}
      <select value={language} onChange={handleLanguageChange}>
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        {/* ... more languages */}
      </select>

      {/* Enhanced Code Editor */}
      <CodeEditor
        code={code}
        onChange={handleCodeChange}
        language={language}
        placeholder={`// Write ${language} code here...`}
        theme="light"
      />
    </div>
  );
}

// SOCKET.IO INTEGRATION FOR REAL-TIME SYNC
import { io } from 'socket.io-client';

function CollaborativeRoom({ matchId }) {
  const [socket, setSocket] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    
    // Listen for code updates from other users
    newSocket.on('code-updated', (data) => {
      setCode(data.code);
    });

    // Listen for language updates from other users
    newSocket.on('language-updated', (data) => {
      setLanguage(data.language);
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    
    // Broadcast code change to other users
    if (socket) {
      socket.emit('code-update', matchId, userId, newCode);
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    // Broadcast language change to other users
    if (socket) {
      socket.emit('language-update', matchId, userId, newLanguage);
    }
  };

  return (
    <CodeEditor
      code={code}
      onChange={handleCodeChange}
      language={language}
    />
  );
}

// SUPPORTED LANGUAGES
const SUPPORTED_LANGUAGES = [
  'javascript',
  'python',
  'java',
  'cpp',
  'c',
  'csharp',
  'ruby',
  'go',
  'rust',
  'typescript',
  'swift',
  'kotlin',
  'php',
  'sql'
];

// COMPONENT PROPS
/**
 * @param {string} code - The code content to display
 * @param {function} onChange - Callback when code changes (receives event object)
 * @param {string} language - Programming language for syntax highlighting
 * @param {string} placeholder - Placeholder text when editor is empty
 * @param {string} theme - "light" or "dark" theme
 */

// FEATURES INCLUDED
/**
 * ✅ Syntax highlighting with color-coded keywords, variables, comments
 * ✅ Line numbers for easy navigation
 * ✅ Tab key support (adds 2 spaces)
 * ✅ Synchronized scrolling
 * ✅ Transparent overlay for seamless editing
 * ✅ Professional monospace font
 * ✅ Responsive design
 */

// STYLING CUSTOMIZATION
/**
 * The CodeEditor component uses inline styles but can be customized.
 * To customize, you can:
 * 1. Wrap in a parent div with custom styles
 * 2. Modify the styles object in CodeEditor.jsx
 * 3. Pass additional className props if needed
 */

// PERFORMANCE NOTES
/**
 * - The component re-renders on every keystroke (normal for controlled input)
 * - Syntax highlighting is optimized by react-syntax-highlighter
 * - For very large files (>10,000 lines), consider adding debouncing
 * - Socket emissions should be throttled to avoid network congestion
 */

// BACKEND SOCKET EVENTS (Collaboration Service)
/**
 * SERVER LISTENS FOR:
 * - 'code-update' (matchId, userId, newCode)
 * - 'language-update' (matchId, userId, newLanguage)
 * 
 * SERVER EMITS:
 * - 'code-updated' ({ code })
 * - 'language-updated' ({ language })
 */

// TROUBLESHOOTING
/**
 * Issue: Syntax highlighting not working
 * - Verify react-syntax-highlighter is installed
 * - Check that language prop matches supported language identifier
 * 
 * Issue: Code not syncing between users
 * - Verify socket connection is established
 * - Check that matchId is correct
 * - Verify both users joined the same match
 * 
 * Issue: Cursor position jumps while typing
 * - This is normal for the transparent overlay technique
 * - Ensure onChange uses e.target.value correctly
 * 
 * Issue: Language not syncing
 * - Verify language-update event is emitted
 * - Check socket connection
 * - Verify collaboration service is handling language-update
 */

export default CodeEditor;
