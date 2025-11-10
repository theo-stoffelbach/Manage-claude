import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Terminal from '../Terminal';

// Mock xterm
jest.mock('@xterm/xterm', () => {
  const mockTerm = {
    loadAddon: jest.fn(),
    open: jest.fn(),
    write: jest.fn(),
    onData: jest.fn(),
    dispose: jest.fn(),
    cols: 80,
    rows: 24
  };

  return {
    Terminal: jest.fn(() => mockTerm)
  };
});

// Mock FitAddon
jest.mock('@xterm/addon-fit', () => {
  const mockFitAddon = {
    fit: jest.fn()
  };

  return {
    FitAddon: jest.fn(() => mockFitAddon)
  };
});

// Mock socket service
jest.mock('../../services/socket', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  };
  return { default: mockSocket };
});

const { Terminal: XTerm } = require('@xterm/xterm');
const { FitAddon } = require('@xterm/addon-fit');
const socket = require('../../services/socket').default;

describe('Terminal Component', () => {
  let mockTerm;
  let mockFitAddon;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTerm = {
      loadAddon: jest.fn(),
      open: jest.fn(),
      write: jest.fn(),
      onData: jest.fn(),
      dispose: jest.fn(),
      cols: 80,
      rows: 24
    };

    mockFitAddon = {
      fit: jest.fn()
    };

    XTerm.mockReturnValue(mockTerm);
    FitAddon.mockReturnValue(mockFitAddon);

    // Clear event listeners
    socket.on.mockClear();
    socket.off.mockClear();
    socket.emit.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render terminal container', () => {
    const { container } = render(<Terminal />);

    const terminalDiv = container.querySelector('.w-full.h-full');
    expect(terminalDiv).toBeInTheDocument();
  });

  it('should initialize xterm with correct configuration', () => {
    render(<Terminal />);

    expect(XTerm).toHaveBeenCalledWith(
      expect.objectContaining({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: expect.objectContaining({
          background: '#1e1e1e',
          foreground: '#d4d4d4',
          cursor: '#ffffff'
        })
      })
    );
  });

  it('should load FitAddon and call fit', () => {
    render(<Terminal />);

    expect(FitAddon).toHaveBeenCalled();
    expect(mockTerm.loadAddon).toHaveBeenCalledWith(mockFitAddon);
    expect(mockFitAddon.fit).toHaveBeenCalled();
  });

  it('should open terminal in the DOM', () => {
    const { container } = render(<Terminal />);

    const terminalDiv = container.querySelector('.w-full.h-full');
    expect(mockTerm.open).toHaveBeenCalledWith(terminalDiv);
  });

  it('should register terminal:output event listener', () => {
    render(<Terminal />);

    expect(socket.on).toHaveBeenCalledWith('terminal:output', expect.any(Function));
  });

  it('should write data to terminal when receiving terminal:output', () => {
    render(<Terminal />);

    // Get the callback for terminal:output
    const outputCallback = socket.on.mock.calls.find(
      call => call[0] === 'terminal:output'
    )[1];

    // Simulate receiving data
    outputCallback('Hello, Terminal!');

    expect(mockTerm.write).toHaveBeenCalledWith('Hello, Terminal!');
  });

  it('should register terminal:exit event listener', () => {
    render(<Terminal />);

    expect(socket.on).toHaveBeenCalledWith('terminal:exit', expect.any(Function));
  });

  it('should display exit message when terminal exits', () => {
    render(<Terminal />);

    // Get the callback for terminal:exit
    const exitCallback = socket.on.mock.calls.find(
      call => call[0] === 'terminal:exit'
    )[1];

    // Simulate terminal exit
    exitCallback({ exitCode: 0 });

    expect(mockTerm.write).toHaveBeenCalledWith(
      expect.stringContaining('[Process exited with code 0]')
    );
  });

  it('should send user input to backend via socket', () => {
    render(<Terminal />);

    // Get the onData callback
    const onDataCallback = mockTerm.onData.mock.calls[0][0];

    // Simulate user input
    onDataCallback('ls -la\r');

    expect(socket.emit).toHaveBeenCalledWith('terminal:input', 'ls -la\r');
  });

  it('should emit terminal:resize on window resize', async () => {
    jest.useFakeTimers();

    render(<Terminal />);

    // Clear initial resize calls
    socket.emit.mockClear();

    // Simulate window resize
    window.dispatchEvent(new Event('resize'));

    expect(mockFitAddon.fit).toHaveBeenCalled();

    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('terminal:resize', {
        cols: 80,
        rows: 24
      });
    });

    jest.useRealTimers();
  });

  it('should send initial resize after mount', async () => {
    jest.useFakeTimers();

    render(<Terminal />);

    // Fast-forward past the 100ms timeout
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('terminal:resize', {
        cols: 80,
        rows: 24
      });
    });

    jest.useRealTimers();
  });

  it('should cleanup on unmount', () => {
    const { unmount } = render(<Terminal />);

    unmount();

    expect(socket.off).toHaveBeenCalledWith('terminal:output');
    expect(socket.off).toHaveBeenCalledWith('terminal:exit');
    expect(mockTerm.dispose).toHaveBeenCalled();
  });

  it('should remove resize listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<Terminal />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});
