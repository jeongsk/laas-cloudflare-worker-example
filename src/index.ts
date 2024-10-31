import { PresetApiV2Request, PresetApiV2Response } from './types';
import { createResponse, responseStream } from './utils';

const LAAS_PROJECT = 'your-project-code';
const LAAS_API_KEY = 'your-api-key';
const LAAS_PRESET = 'your-preset-hash';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.endsWith('/models')) {
      return createResponse({
        object: 'list',
        data: [
          {
            id: 'gpt-4o',
            object: 'model',
          },
        ],
      });
    }

    if (url.pathname === '/v1/chat/completions') {
      try {
        const body = await request.json();
        const { messages = [], stream, ...args } = body as Omit<PresetApiV2Request, 'hash'> & { stream: boolean };

        const data: PresetApiV2Request = {
          hash: LAAS_PRESET,
          messages,
          ...args,
        };

        const chatCompletion = fetch('https://api-laas.wanted.co.kr/api/preset/v2/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            project: LAAS_PROJECT,
            apiKey: env.LAAS_API_KEY || LAAS_API_KEY,
          },
          body: JSON.stringify(data),
        }).then(r => r.json() as unknown as PresetApiV2Response);

        if (stream) {
          return await responseStream(ctx, chatCompletion);
        }

        const answer = await chatCompletion;
        return createResponse(answer, 200);
      } catch (error) {
        console.error('Error:', error);
        return createResponse({ error: 'An error occurred' }, 500);
      }
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
