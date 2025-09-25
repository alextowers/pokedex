import { TestBed } from '@angular/core/testing';

import { QueryParserService } from './query-parser.service';

describe('QueryParserService', () => {
  let service: QueryParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
