// Test setup configuration
export const testConfig = {
  timeout: 5000,
  port: 3001, // Use different port for tests
  host: 'localhost'
};

// Mock console to reduce test output noise
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  return originalConsole;
};
