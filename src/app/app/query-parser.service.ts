import { Injectable } from '@angular/core';

export interface ParsedQuery {
  pokemonName: string | undefined;
  requestedInfo: ('all' | 'type' | 'abilities' | 'stats')[];
}

@Injectable({
  providedIn: 'root'
})
export class QueryParserService {

  constructor() { }

  parseQuery(query: string): ParsedQuery {
    const queryLower = query.toLowerCase();
    let pokemonName: string | undefined;
    const requestedInfo: ('all' | 'type' | 'abilities' | 'stats')[] = [];

    // Synonym handling and multi-intent detection
    if (queryLower.includes('type') || queryLower.includes('types')) {
      requestedInfo.push('type');
    }
    if (queryLower.includes('abilities') || queryLower.includes('powers')) {
      requestedInfo.push('abilities');
    }
    if (queryLower.includes('stats') || queryLower.includes('characteristics')) {
      requestedInfo.push('stats');
    }

    // If no specific info is requested, default to 'all'
    if (requestedInfo.length === 0) {
      requestedInfo.push('all');
    }

    let cleanedQuery = queryLower;

    // Remove common query phrases and keywords
    cleanedQuery = cleanedQuery.replace(/(tell me|what are|show me|of|about|type|types|abilities|powers|stats|characteristics)\s*/g, '').trim();

    // Try to extract pokemon name from the cleaned query
    // This simple approach assumes the remaining word(s) are the pokemon name
    // A more advanced approach would involve a list of all pokemon names
    pokemonName = cleanedQuery.split(' ').filter(Boolean).pop();

    return { pokemonName, requestedInfo };
  }
}
