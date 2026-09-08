// Read secrets only on the server. Never include this object in a public response.
export function getAIConfig(env = process.env) {
  const provider = (env.AI_PROVIDER || (env.AZURE_OPENAI_ENDPOINT || env.AZURE_OPENAI_API_KEY || env.AZURE_OPENAI_DEPLOYMENT ? 'azure' : 'openai')).trim();
  if (!['azure', 'openai'].includes(provider)) throw new Error('AI_PROVIDER must be azure or openai.');
  if (provider === 'openai') return {
    provider, apiKey: env.OPENAI_API_KEY?.trim() || '',
    model: env.OPENAI_MODEL?.trim() || 'gpt-5',
    endpoint: 'https://api.openai.com/v1/responses',
  };
  const apiKey = env.AZURE_OPENAI_API_KEY?.trim() || '';
  const resource = env.AZURE_OPENAI_ENDPOINT?.trim() || '';
  const model = env.AZURE_OPENAI_DEPLOYMENT?.trim() || '';
  if (!apiKey && !resource && !model) return { provider, apiKey: '' };
  if (!apiKey || !resource || !model) throw new Error('Foundry needs AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT.');
  let url;
  try { url = new URL(resource); } catch { throw new Error('Invalid Foundry resource endpoint.'); }
  // Use the resource endpoint, not a project/Agent Service URL or a visitor-supplied URL.
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash ||
      !/^[a-z0-9-]+\.(openai\.azure\.com|services\.ai\.azure\.com)$/.test(url.hostname) ||
      !['/', '/openai/v1', '/openai/v1/', '/openai/v1/responses', '/openai/v1/responses/'].includes(url.pathname)) {
    throw new Error('Use an HTTPS Azure resource endpoint or its /openai/v1/responses URL.');
  }
  return { provider, apiKey, model, endpoint: url.origin + '/openai/v1/responses' };
}

export function getAIStatus(env = process.env) {
  try {
    const config = getAIConfig(env);
    return { mode: config.apiKey ? 'live' : 'preview', provider: config.provider };
  } catch {
    return { mode: 'unavailable', provider: null };
  }
}
