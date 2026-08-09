/**
 * Production environment configuration. DummyJSON is a public demo
 * API with no environment-specific tiers, so `apiUrl` matches
 * development here — this file exists so a real backend URL can be
 * swapped in later without touching any service code.
 */
export const environment = {
  production: true,
  apiUrl: 'https://dummyjson.com',
};
