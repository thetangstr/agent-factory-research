/**
 * Web search abstraction — supports Brave Search, Tavily, and SerpAPI.
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SearchConfig {
  provider: "brave" | "tavily" | "serpapi";
  apiKey: string;
}

export class WebSearchClient {
  constructor(private config: SearchConfig) {}

  async search(query: string, count = 5): Promise<SearchResult[]> {
    switch (this.config.provider) {
      case "brave":
        return this.searchBrave(query, count);
      case "tavily":
        return this.searchTavily(query, count);
      case "serpapi":
        return this.searchSerpAPI(query, count);
      default:
        throw new Error(`Unknown search provider: ${this.config.provider}`);
    }
  }

  private async searchBrave(query: string, count: number): Promise<SearchResult[]> {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": this.config.apiKey,
      },
    });
    if (!res.ok) throw new Error(`Brave search failed: ${res.status}`);
    const data = await res.json();
    return (data.web?.results ?? []).map((r: any) => ({
      title: r.title,
      url: r.url,
      snippet: r.description ?? "",
    }));
  }

  private async searchTavily(query: string, count: number): Promise<SearchResult[]> {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: this.config.apiKey,
        query,
        max_results: count,
        search_depth: "basic",
      }),
    });
    if (!res.ok) throw new Error(`Tavily search failed: ${res.status}`);
    const data = await res.json();
    return (data.results ?? []).map((r: any) => ({
      title: r.title,
      url: r.url,
      snippet: r.content ?? "",
    }));
  }

  private async searchSerpAPI(query: string, count: number): Promise<SearchResult[]> {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&num=${count}&api_key=${this.config.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`SerpAPI search failed: ${res.status}`);
    const data = await res.json();
    return (data.organic_results ?? []).map((r: any) => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet ?? "",
    }));
  }
}
