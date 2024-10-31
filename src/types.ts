export enum ServiceType {
  OPENAI = 'OPENAI',
  AZURE = 'AZURE',
  NCP = 'NCP',
  UPSTAGE = 'UPSTAGE',
  GOOGLE = 'GOOGLE',
  AWS = 'AWS',
  ANTHROPIC = 'ANTHROPIC',
}

export interface ChatCompletionContentPartText {
  type: 'text';
  text: string;
}

export namespace ChatCompletionContentPartImage {
  export interface ImageURL {
    url: string;
  }
}

export interface ChatCompletionContentPartImage {
  type: 'image_url';
  image_url: ChatCompletionContentPartImage.ImageURL;
}

export type ChatCompletionContentPart = ChatCompletionContentPartText | ChatCompletionContentPartImage;

export interface ChatCompletionMessageParam {
  name?: string;
  role: string;
  content: string | Array<ChatCompletionContentPart> | null;
  tool_call_id?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  tool_calls?: {
    id: string;
    type: string; // function
    function: {
      name: string;
      arguments: string;
    };
  }[];
}

export interface PresetApiV2Request {
  hash: string;
  params?: Record<string, string>;
  model?: string;
  messages: Array<ChatCompletionMessageParam>;
  service_type?: ServiceType;
  max_tokens?: number;
  response_format?: {
    type: string;
  };
  source_count?: number;
  tool_choice?: any;
}

export interface PresetApiV2Response {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    finish_reason: string;
    index: number;
    message: Omit<ChatCompletionMessageParam, 'name' | 'tool_call_id'>;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
