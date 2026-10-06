export interface ArticleSection {
  /** Anchor id, when other pages link to the section. */
  id?: string;
  heading: string;
  paragraphs?: string[];
  list?: string[];
  /** Paragraphs that follow the list. */
  after?: string[];
}

export interface Article {
  slug: string;
  title: string;
  summary: string;
  /** `YYYY-MM-DD` of the last editorial change. */
  updated: string;
  sections: ArticleSection[];
}
