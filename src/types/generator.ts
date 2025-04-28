
export type TextLengthOption = 'short' | 'long';

export interface GenerateOptions {
  includeEmojis: boolean;
  includeHashtags: boolean;
  customHashtags: string;
  targetAudience: string;
  imageDescription: string;
  theme?: string;
  textLength: TextLengthOption;
}
