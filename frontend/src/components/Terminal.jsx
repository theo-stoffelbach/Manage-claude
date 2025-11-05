import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import socket from '../services/socket';

export default function Terminal() {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    // Initialize xterm.js
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        cursorAccent: '#1e1e1e',
        selection: 'rgba(255, 255, 255, 0.3)',
        black: '#000000',
        brightBlack: '#666666',
        red: '#cd3131',
        brightRed: '#f14c4c',
        green: '#0dbc79',
        brightGreen: '#23d18b',
        yellow: '#e5e510',
        brightYellow: '#f5f543',
        blue: '#2472c8',
        brightBlue: '#3b8eea',
        magenta: '#bc3fbc',
        brightMagenta: '#d670d6',
        cyan: '#11a8cd',
        brightCyan: '#29b8db',
        white: '#e5e5e5',
        brightWhite: '#e5e5e5',
      }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Handle terminal output from backend
    socket.on('terminal:output', (data) => {
      term.write(data);
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
      fitAddon.fit();
      socket.emit('terminal:resize', {
        cols: term.cols,
        rows: term.rows
      });
    };

    window.addEventListener('resize', handleResize);

    // Initial resize
    setTimeout(() => {
      fitAddon.fit();
      socket.emit('terminal:resize', {
        cols: term.cols,
        rows: term.rows
      });
    }, 100);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      socket.off('terminal:output');
      socket.off('terminal:exit');
      term.dispose();
    };
  }, []);

  return (
    <div ref={terminalRef} className="w-full h-full" />
  );
}
