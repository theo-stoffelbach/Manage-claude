// Mock socket.io-client BEFORE any imports
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  id: 'test-socket-id',
  listeners: {}
};

const mockIo = jest.fn(() => mockSocket);

jest.mock('socket.io-client', () => ({
  io: mockIo
}));

// Set up window.location before module loads
delete window.location;
window.location = {
  protocol: 'http:',
  hostname: 'localhost',
  href: 'http://localhost:3000'
};

describe('Socket Service', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Reset listeners
    mockSocket.listeners = {};
    mockSocket.on.mockImplementation((event, callback) => {
      mockSocket.listeners[event] = callback;
      return mockSocket;
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should create socket instance with correct default configuration', () => {
    const socket = require('../socket').default;

    expect(mockIo).toHaveBeenCalledWith(
      'http://localhost:3105',
      expect.objectContaining({
        autoConnect: false,
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })
    );
  });

  it('should log connection when socket connects', () => {
    const socket = require('../socket').default;

    // Trigger the connect event
    mockSocket.listeners['connect']();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '🔌 Connected to backend:',
      'test-socket-id'
    );
  });

  it('should log disconnection when socket disconnects', () => {
    const socket = require('../socket').default;

    // Trigger the disconnect event
    mockSocket.listeners['disconnect']('transport close');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '🔌 Disconnected from backend:',
      'transport close'
    );
  });

  it('should log connection errors', () => {
    const socket = require('../socket').default;
    const testError = new Error('Connection failed');

    // Trigger the connect_error event
    mockSocket.listeners['connect_error'](testError);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Connection error:',
      testError
    );
  });

  it('should log socket errors', () => {
    const socket = require('../socket').default;
    const testError = new Error('Socket error');

    // Trigger the error event
    mockSocket.listeners['error'](testError);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Socket error:',
      testError
    );
  });

  it('should export socket instance', () => {
    const socket = require('../socket').default;

    expect(socket).toBeDefined();
    expect(socket).toBe(mockSocket);
  });

  it('should handle connection events and log appropriately', () => {
    const socket = require('../socket').default;

    // Test event listeners are registered
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
  });
});
