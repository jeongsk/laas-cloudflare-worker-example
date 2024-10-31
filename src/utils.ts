import { PresetApiV2Response } from './types';

const RESPONSE_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

export function createResponse(body: any = null, status: number = 200): Response {
  const responseBody = typeof body === 'string' ? body : JSON.stringify(body);
  return new Response(responseBody, { status, headers: RESPONSE_HEADERS });
}

export async function responseStream(ctx: ExecutionContext, call: Promise<PresetApiV2Response>) {
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const textEncoder = new TextEncoder();

  const formatChunk = (chunk: any) => `data: ${JSON.stringify(chunk)}\n\n`;

  try {
    const answer = (await call) as unknown as any;
    answer.object = 'chat.completion.chunk';
    answer.choices = answer.choices.map(({ message, ...other }: any) => ({
      delta: message,
      ...other,
    }));

    const inProgressChunk = { ...answer, choices: [{ ...answer.choices[0], finish_reason: null }] };
    const completedChunk = { ...answer, choices: [{ ...answer.choices[0], delta: {} }] };

    writer.write(textEncoder.encode(formatChunk(inProgressChunk)));
    writer.write(textEncoder.encode(formatChunk(completedChunk)));
    writer.write(textEncoder.encode(`data: [DONE]\n\n`));
  } catch (error) {
    console.error('Error in responseStream:', error);
    writer.write(textEncoder.encode('data: [ERROR]\n\n'));
  } finally {
    writer.close();
  }

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
    },
  });
}
