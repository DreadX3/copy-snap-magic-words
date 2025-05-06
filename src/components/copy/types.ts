
export interface CopyResult {
  id: string;
  text: string;
}

export interface ShareTarget {
  platform: string;
  name: string;
  color: string;
  action: (text: string) => void;
}
