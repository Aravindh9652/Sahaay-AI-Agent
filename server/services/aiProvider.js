async function openAIQuery(query, options = {}){
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { provider: 'openai', answer: `OPENAI_API_KEY not set. Query was: ${query}` }
  }
  try {
    // Lazy load OpenAI to avoid dependency issues
    const { OpenAI } = require('openai')
    const client = new OpenAI({ apiKey })
    const model = options.model || process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    const resp = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: query }]
    })
    const out = resp?.choices?.[0]?.message?.content || JSON.stringify(resp)
    return { provider: 'openai', answer: out }
  } catch (err) {
    console.error('OpenAI error', err)
    return { provider: 'openai', error: err.message || String(err) }
  }
}

async function localQuery(query){
  return { provider: 'local', answer: `Local stub: ${query}` }
}

async function handleQuery({ query, provider = 'openai', options = {} }){
  if (!query) return { provider, answer: '' }
  switch ((provider || '').toLowerCase()){
    case 'openai':
      return openAIQuery(query, options)
    case 'local':
    default:
      return localQuery(query)
  }
}

module.exports = { handleQuery }