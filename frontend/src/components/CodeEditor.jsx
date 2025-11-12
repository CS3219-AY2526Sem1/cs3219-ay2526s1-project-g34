/*
 * AI Assistance Disclosure:
 * Tool: GitHub Copilot (Claude Sonnet 4.5)
 * Date: 2025-11-12
 * Scope: Generated the initial implementation of the `CodeEditor` React component with syntax highlighting, 
 * including hooks for cursor tracking, scroll synchronization, and tab indentation handling. Suggested multi-language support.
 * Author review: I refactored component logic, adjusted layout styling, and validated cross-browser textarea behavior.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * Enhanced Code Editor with Syntax Highlighting
 * 
 * Features:
 * - Real-time syntax highlighting for multiple programming languages
 * - Color-coded keywords, variables, and comments
 * - Synchronized textarea overlay for editing
 * - Supports JavaScript, Python, Java, C++, and more
 */
export const CodeEditor = ({ 
  code, 
  onChange, 
  language = 'javascript',
  placeholder = '// Start typing your code here...',
  theme = 'light'
}) => {
  const textareaRef = useRef(null);
  const [lineCount, setLineCount] = useState(1);
  const cursorPositionRef = useRef({ start: 0, end: 0 });
  const isTypingRef = useRef(false);

  // Update line count when code changes
  useEffect(() => {
    const lines = code.split('\n').length;
    setLineCount(lines);
  }, [code]);

  // Preserve cursor position when code updates from external source
  useEffect(() => {
    if (textareaRef.current && !isTypingRef.current) {
      // Only restore cursor if user is not actively typing
      const { start, end } = cursorPositionRef.current;
      textareaRef.current.selectionStart = start;
      textareaRef.current.selectionEnd = end;
    }
    isTypingRef.current = false;
  }, [code]);

  // Synchronize scroll between textarea and syntax highlighter
  const handleScroll = (e) => {
    const highlighterElement = e.target.nextElementSibling;
    if (highlighterElement) {
      highlighterElement.scrollTop = e.target.scrollTop;
      highlighterElement.scrollLeft = e.target.scrollLeft;
    }
  };

  // Handle tab key for proper indentation
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      
      isTypingRef.current = true;
      onChange({ target: { value: newCode } });
      
      // Set cursor position after the tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          cursorPositionRef.current = { start: start + 2, end: start + 2 };
        }
      }, 0);
    }
  };

  // Handle regular input changes
  const handleChange = (e) => {
    isTypingRef.current = true;
    
    // Save cursor position
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    cursorPositionRef.current = { start, end };
    
    onChange(e);
  };

  // Track cursor position on selection change
  const handleSelectionChange = (e) => {
    if (textareaRef.current) {
      cursorPositionRef.current = {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd
      };
    }
  };

  const selectedTheme = theme === 'dark' ? vscDarkPlus : vs;

  return (
    <div style={styles.container}>
      {/* Line numbers */}
      <div style={styles.lineNumbers}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1} style={styles.lineNumber}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code editing area with overlay */}
      <div style={styles.editorWrapper}>
        {/* Transparent textarea for input */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleChange}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onSelect={handleSelectionChange}
          onClick={handleSelectionChange}
          placeholder={placeholder}
          spellCheck={false}
          style={styles.textarea}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
        />

        {/* Syntax highlighted display */}
        <div style={styles.highlighter}>
          <SyntaxHighlighter
            language={language}
            style={selectedTheme}
            customStyle={{
              margin: 0,
              padding: 0,
              background: 'transparent',
              fontSize: '15px',
              lineHeight: '1.6',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            }}
            codeTagProps={{
              style: {
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              }
            }}
          >
            {code || ' '} {/* Show space if empty to maintain layout */}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    minHeight: '56vh',
    height: '100%',
    background: '#fafafa',
    overflow: 'hidden',
  },
  lineNumbers: {
    padding: '1rem 0.5rem',
    background: '#f1f5f9',
    color: '#94a3b8',
    fontSize: '15px',
    lineHeight: '1.6',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    textAlign: 'right',
    userSelect: 'none',
    borderRight: '1px solid #e2e8f0',
    minWidth: '3rem',
  },
  lineNumber: {
    paddingRight: '0.5rem',
  },
  editorWrapper: {
    position: 'relative',
    flex: 1,
    overflow: 'auto',
  },
  textarea: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    padding: '1rem 1.25rem',
    border: 'none',
    outline: 'none',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    fontSize: '15px',
    lineHeight: '1.6',
    resize: 'none',
    background: 'transparent',
    color: 'transparent',  // Make text transparent so highlighting shows through
    caretColor: '#1e293b',  // But keep cursor visible
    whiteSpace: 'pre',
    overflow: 'auto',
    zIndex: 2,
    boxSizing: 'border-box',
  },
  highlighter: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    padding: '1rem 1.25rem',
    overflow: 'auto',
    pointerEvents: 'none',  // Allow clicks to pass through to textarea
    zIndex: 1,
    boxSizing: 'border-box',
  },
};
