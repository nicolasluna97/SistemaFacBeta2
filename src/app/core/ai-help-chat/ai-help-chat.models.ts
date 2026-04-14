export interface AiHelpSource {
  documentTitle: string;
  documentSlug: string;
  sectionTitle: string;
  similarity: number;
}

export interface AiHelpChatResponse {
  question: string;
  answer: string;
  sources: AiHelpSource[];
}