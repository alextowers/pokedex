import { TestBed } from '@angular/core/testing';
import { QueryParserService, ParsedQuery } from './query-parser.service';

describe('QueryParserService', () => {
  let service: QueryParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test cases for parseQuery method
  it('should extract pokemon name correctly from a simple query', () => {
    const result: ParsedQuery = service.parseQuery('pikachu');
    expect(result.pokemonName).toBe('pikachu');
    expect(result.requestedInfo).toEqual(['all']);
  });

  it('should extract pokemon name after "of" ', () => {
    const result: ParsedQuery = service.parseQuery('tell me the type of charmander');
    expect(result.pokemonName).toBe('charmander');
    expect(result.requestedInfo).toEqual(['type']);
  });

  it('should extract pokemon name after "about" ', () => {
    const result: ParsedQuery = service.parseQuery('show me about bulbasaur');
    expect(result.pokemonName).toBe('bulbasaur');
    expect(result.requestedInfo).toEqual(['all']);
  });

  it('should detect "type" information request', () => {
    const result: ParsedQuery = service.parseQuery('what is the type of squirtle');
    expect(result.pokemonName).toBe('squirtle');
    expect(result.requestedInfo).toEqual(['type']);
  });

  it('should detect "abilities" information request', () => {
    const result: ParsedQuery = service.parseQuery('abilities of mewtwo');
    expect(result.pokemonName).toBe('mewtwo');
    expect(result.requestedInfo).toEqual(['abilities']);
  });

  it('should detect "powers" (synonym for abilities) information request', () => {
    const result: ParsedQuery = service.parseQuery('powers of mew');
    expect(result.pokemonName).toBe('mew');
    expect(result.requestedInfo).toEqual(['abilities']);
  });

  it('should detect "stats" information request', () => {
    const result: ParsedQuery = service.parseQuery('stats for charizard');
    expect(result.pokemonName).toBe('charizard');
    expect(result.requestedInfo).toEqual(['stats']);
  });

  it('should detect "characteristics" (synonym for stats) information request', () => {
    const result: ParsedQuery = service.parseQuery('characteristics of eevee');
    expect(result.pokemonName).toBe('eevee');
    expect(result.requestedInfo).toEqual(['stats']);
  });

  it('should detect multiple information requests', () => {
    const result: ParsedQuery = service.parseQuery('tell me the type and abilities of snorlax');
    expect(result.pokemonName).toBe('snorlax');
    expect(result.requestedInfo).toEqual(['type', 'abilities']);
  });

  it('should handle queries with only keywords', () => {
    const result: ParsedQuery = service.parseQuery('type abilities stats');
    expect(result.pokemonName).toBeUndefined(); // No pokemon name in this case
    expect(result.requestedInfo).toEqual(['type', 'abilities', 'stats']);
  });

  it('should return "all" if no specific info is requested', () => {
    const result: ParsedQuery = service.parseQuery('find me pikachu');
    expect(result.pokemonName).toBe('pikachu');
    expect(result.requestedInfo).toEqual(['all']);
  });

  it('should handle empty query', () => {
    const result: ParsedQuery = service.parseQuery('');
    expect(result.pokemonName).toBeUndefined();
    expect(result.requestedInfo).toEqual(['all']);
  });

  it('should handle query with leading/trailing spaces', () => {
    const result: ParsedQuery = service.parseQuery('  squirtle  ');
    expect(result.pokemonName).toBe('squirtle');
    expect(result.requestedInfo).toEqual(['all']);
  });

  it('should handle query with mixed case', () => {
    const result: ParsedQuery = service.parseQuery('What are the ABILITIES of Bulbasaur');
    expect(result.pokemonName).toBe('bulbasaur');
    expect(result.requestedInfo).toEqual(['abilities']);
  });
});
