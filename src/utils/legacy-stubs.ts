// Legacy API stubs for backwards compatibility
// These are deprecated and should not be used in new code

export const fetchClient = async () => {
  console.warn('fetchClient is deprecated - use Firebase services instead');
  return {
    get: async () => { throw new Error('fetchClient deprecated - use Firebase'); },
    post: async () => { throw new Error('fetchClient deprecated - use Firebase'); },
    put: async () => { throw new Error('fetchClient deprecated - use Firebase'); },
    delete: async () => { throw new Error('fetchClient deprecated - use Firebase'); },
  };
};

