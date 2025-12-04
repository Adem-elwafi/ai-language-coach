AI service layer

Files:
- `aiService.js` — Main service wrapper. Exposes `configure`, `analyzeText`, `correctText`, `getSuggestions`.
- `mockData.js` — Local mock responses for development and testing.

Usage (example):

```js
import aiService from './services/aiService';

// 1) For local development, use mock responses (default)
aiService.configure({ provider: 'mock', useMock: true });
const result = await aiService.analyzeText('I have car. She go to school yesterday.');
console.log(result);

// 2) To use OpenAI (in production), configure with API key and provider
// aiService.configure({ provider: 'openai', apiKey: process.env.VITE_OPENAI_KEY, model: 'gpt-4' });
// const analysis = await aiService.analyzeText('Your learner text...');

Notes:
- The service will automatically fall back to mock responses when `useMock` is true or no API key is configured.
- Error objects thrown have a `code` and `message` property and may include `detail` for provider responses.
- No API keys are stored by this module; pass keys via `configure()` or environment-to-runtime mapping.
