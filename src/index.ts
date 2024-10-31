import { PresetApiV2Request, PresetApiV2Response } from './types';
import { createResponse, responseStream } from './utils';

export const API_CONFIG = {
  BASE_URL: 'https://api-laas.wanted.co.kr',
  ENDPOINTS: {
    CHAT_COMPLETIONS: '/api/preset/v2/chat/completions',
  },
  LAAS_PROJECT: 'your-project-code',
  LAAS_PRESET: 'your-preset-hash',
};

export async function handleModelsRoute() {
  return createResponse({
    object: 'list',
    data: [
      {
        id: 'gpt-4',
        object: 'model',
      },
    ],
  });
}

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleChatCompletions(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') {
    throw new ApiError(405, 'Method not allowed');
  }

  const body = await request.json();
  const { messages = [], stream, ...args } = body as Omit<PresetApiV2Request, 'hash'> & { stream: boolean };

  // 입력 유효성 검사
  if (!messages.length) {
    throw new ApiError(400, 'Messages array cannot be empty');
  }

  const data: PresetApiV2Request = {
    hash: API_CONFIG.LAAS_PRESET,
    messages,
    ...args,
  };

  const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT_COMPLETIONS}`;

  const chatCompletion = fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      project: API_CONFIG.LAAS_PROJECT,
      apiKey: env.LAAS_API_KEY,
    },
    body: JSON.stringify(data),
  }).then(response => {
    if (!response.ok) {
      throw new ApiError(response.status, `API request failed with status ${response.status}`);
    }
    return response.json() as Promise<PresetApiV2Response>;
  });

  if (stream) {
    return await responseStream(ctx, chatCompletion);
  }

  const answer = await chatCompletion;
  return createResponse(answer, 200);
}

// 레이트 리미팅 함수 (예시)
async function checkRateLimit(request: Request, env: Env) {
  // 실제 구현에서는 KV나 다른 저장소를 사용하여 요청 횟수를 추적
  return { allowed: true };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);

      // 레이트 리미팅 체크 (선택적)
      const rateLimitResult = await checkRateLimit(request, env);
      if (!rateLimitResult.allowed) {
        throw new ApiError(429, 'Too many requests');
      }

      // 라우팅
      switch (url.pathname) {
        case '/models':
          return await handleModelsRoute();
        case '/v1/chat/completions':
          return await handleChatCompletions(request, env, ctx);
        default:
          throw new ApiError(404, 'Not Found');
      }
    } catch (error) {
      console.error('Error:', error);

      if (error instanceof ApiError) {
        return createResponse(
          {
            error: error.message,
            status: 'error',
          },
          error.statusCode,
        );
      }

      return createResponse(
        {
          error: 'An unexpected error occurred',
          status: 'error',
        },
        500,
      );
    }
  },
} satisfies ExportedHandler<Env>;
