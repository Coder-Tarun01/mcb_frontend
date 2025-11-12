export type SuggestionCategory = 'jobs' | 'companies' | 'skills' | 'locations' | 'recent' | 'trending';

export interface SuggestionItem {
  id: string;
  label: string;
  value: string;
  category: SuggestionCategory;
  icon?: string;
  subtitle?: string;
  popularity?: number;
}

export interface SuggestionGroups {
  jobs: SuggestionItem[];
  companies: SuggestionItem[];
  skills: SuggestionItem[];
  locations: SuggestionItem[];
  recent?: SuggestionItem[];
  trending?: SuggestionItem[];
}

export interface SuggestionResponseDto {
  jobs: string[];
  companies: string[];
  skills: string[];
  locations: string[];
  meta?: {
    cached?: boolean;
    tookMs?: number;
    trending?: Partial<Record<'jobs' | 'companies' | 'skills' | 'locations', string[]>>;
  };
}

export interface SearchSubmissionPayload {
  query: string;
  location?: string;
  category?: SuggestionCategory;
  suggestion?: SuggestionItem | null;
  context: 'navbar' | 'homepage' | 'jobs';
}

