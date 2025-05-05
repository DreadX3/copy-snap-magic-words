
export interface CopyResult {
  id: number;
  text: string;
}

export interface ShareTarget {
  platform: string;
  name: string;
  color: string;
  action: (text?: string) => void;
}
