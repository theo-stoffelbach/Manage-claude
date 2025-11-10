import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import socket from '../services/socket';

export default function Terminal({ onTerminalOutput }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    // Check if terminal container is ready
    if (!terminalRef.current) return;

    // Initialize xterm.js with black terminal aesthetic
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Menlo, Monaco, "Courier New", monospace',
      fontWeight: '400',
      fontWeightBold: '700',
      lineHeight: 1.4,
      letterSpacing: 0,
      theme: {
        background: '#0a0a0a',
        foreground: '#e0e0e0',
        cursor: '#ffd500',
        cursorAccent: '#0a0a0a',
        selection: 'rgba(255, 213, 0, 0.2)',
        black: '#0a0a0a',
        brightBlack: '#555555',
        red: '#ff5555',
        brightRed: '#ff6e6e',
        green: '#50fa7b',
        brightGreen: '#69ff94',
        yellow: '#ffd500',
        brightYellow: '#ffe44d',
        blue: '#66d9ef',
        brightBlue: '#7ee2f8',
        magenta: '#ff79c6',
        brightMagenta: '#ff92d0',
        cyan: '#8be9fd',
        brightCyan: '#a4ffff',
        white: '#e0e0e0',
        brightWhite: '#ffffff',
      }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Open terminal in the container
    term.open(terminalRef.current);

    // Store references
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Wait for container to have dimensions before fitting
    const fitTerminal = () => {
      if (terminalRef.current && terminalRef.current.offsetParent !== null) {
        try {
          fitAddon.fit();
          socket.emit('terminal:resize', {
            cols: term.cols,
            rows: term.rows
          });
        } catch (err) {
          console.error('Error fitting terminal:', err);
        }
      }
    };

    // Fit after a short delay to ensure container has dimensions
    const timeoutId = setTimeout(fitTerminal, 100);

    // Handle terminal output from backend
    socket.on('terminal:output', (data) => {
      term.write(data);

      // Also pass data to parent component (MainApp) for Claude status detection
      if (onTerminalOutput) {
        onTerminalOutput(data);
      }
    });

    // Handle terminal exit
    socket.on('terminal:exit', ({ exitCode }) => {
      term.write(`\r\n\r\n[Process exited with code ${exitCode}]\r\n`);
    });

    // Send user input to backend
    term.onData((data) => {
      socket.emit('terminal:input', data);
    });

    // Handle window resize
    const handleResize = () => {
      if (terminalRef.current && terminalRef.current.offsetParent !== null) {
        try {
          fitAddon.fit();
          socket.emit('terminal:resize', {
            cols: term.cols,
            rows: term.rows
          });
        } catch (err) {
          console.error('Error resizing terminal:', err);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      socket.off('terminal:output');
      socket.off('terminal:exit');
      if (term) term.dispose();
    };
  }, [onTerminalOutput]); // Include onTerminalOutput in deps (it's wrapped in useCallback in parent)

  return (
    <div ref={terminalRef} className="w-full h-full" />
  );
}
