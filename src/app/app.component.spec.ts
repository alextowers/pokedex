import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs'; // Import 'of' for creating observable
import { AppComponent, TeamPokemon } from './app.component';
import { QueryParserService, ParsedQuery } from './app/query-parser.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf, ngFor

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpTestingController: HttpTestingController;
  let queryParserService: jasmine.SpyObj<QueryParserService>;

  const mockPokemonData = {
    name: 'pikachu',
    sprites: { front_default: 'pikachu.png' },
    types: [{ type: { name: 'electric' } }],
    abilities: [{ ability: { name: 'static' } }],
    stats: [{ stat: { name: 'hp' }, base_stat: 35 }]
  };

  beforeEach(async () => {
    const queryParserServiceSpy = jasmine.createSpyObj('QueryParserService', ['parseQuery']);

    await TestBed.configureTestingModule({
      imports: [
        AppComponent, // Import the standalone component directly
        HttpClientTestingModule,
        FormsModule, // Provide FormsModule for ngModel
        CommonModule // Provide CommonModule for ngIf, ngFor
      ],
      providers: [
        { provide: QueryParserService, useValue: queryParserServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    queryParserService = TestBed.inject(QueryParserService) as jasmine.SpyObj<QueryParserService>;

    // Mock localStorage
    let store: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => store[key] = value);
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => { delete store[key]; });
    spyOn(localStorage, 'clear').and.callFake(() => { store = {}; });

    fixture.detectChanges(); // Initial data binding
  });

  afterEach(() => {
    httpTestingController.verify(); // Ensure that no outstanding requests are pending.
    localStorage.clear(); // Clear localStorage mock after each test
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'pokedex'`, () => {
    expect(component.title).toEqual('pokedex');
  });

  describe('Local Storage', () => {
    it('should load team from local storage on init', () => {
      const storedTeamNames = ['charmander', 'squirtle'];
      localStorage.setItem('myPokemonTeam', JSON.stringify(storedTeamNames));
  
      // Mock HTTP calls for loading team
      queryParserService.parseQuery.and.returnValue({ pokemonName: 'charmander', requestedInfo: ['all'] });
      component.ngOnInit(); // Manually call ngOnInit as it's not called again after initial fixture.detectChanges()
  
      const req1 = httpTestingController.expectOne('https://pokeapi.co/api/v2/pokemon/charmander');
      req1.flush({ name: 'charmander', sprites: { front_default: 'charmander.png' } });
  
      const req2 = httpTestingController.expectOne('https://pokeapi.co/api/v2/pokemon/squirtle');
      req2.flush({ name: 'squirtle', sprites: { front_default: 'squirtle.png' } });
  
      expect(component.myTeam.length).toBe(2);
      expect(component.myTeam[0].name).toBe('charmander');
      expect(component.myTeam[1].name).toBe('squirtle');
    });

    it('should save team to local storage', () => {
      component.myTeam = [
        { name: 'pikachu', imageUrl: 'pikachu.png' },
        { name: 'bulbasaur', imageUrl: 'bulbasaur.png' }
      ];
      component.saveTeamToLocalStorage();
      const storedTeam = JSON.parse(localStorage.getItem('myPokemonTeam') || '[]');
      expect(storedTeam).toEqual(['pikachu', 'bulbasaur']);
    });

    it('should not load a team if local storage is empty', () => {
      localStorage.removeItem('myPokemonTeam');
      component.loadTeamFromLocalStorage();
      expect(component.myTeam.length).toBe(0);
    });
  });

  describe('search method', () => {
    it('should set loading to true and then false on success', () => {
      queryParserService.parseQuery.and.returnValue({ pokemonName: 'pikachu', requestedInfo: ['all'] });
      component.query = 'pikachu';
      component.search();

      expect(component.loading).toBeTrue();

      const req = httpTestingController.expectOne('https://pokeapi.co/api/v2/pokemon/pikachu');
      expect(req.request.method).toEqual('GET');
      req.flush(mockPokemonData);

      expect(component.loading).toBeFalse();
      expect(component.pokemon).toEqual(mockPokemonData);
      expect(component.error).toBeFalse();
      expect(component.errorMessage).toBeNull();
    });

    it('should set error to true and display error message on 404', () => {
      queryParserService.parseQuery.and.returnValue({ pokemonName: 'nonexistent', requestedInfo: ['all'] });
      component.query = 'nonexistent';
      component.search();

      const req = httpTestingController.expectOne('https://pokeapi.co/api/v2/pokemon/nonexistent');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(component.loading).toBeFalse();
      expect(component.error).toBeTrue();
      expect(component.errorMessage).toContain('nonexistent" not found');
      expect(component.pokemon).toBeNull();
    });

    it('should set error to true and display generic error message on other API errors', () => {
      queryParserService.parseQuery.and.returnValue({ pokemonName: 'servererror', requestedInfo: ['all'] });
      component.query = 'servererror';
      component.search();

      const req = httpTestingController.expectOne('https://pokeapi.co/api/v2/pokemon/servererror');
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });

      expect(component.loading).toBeFalse();
      expect(component.error).toBeTrue();
      expect(component.errorMessage).toContain('unexpected error occurred');
      expect(component.pokemon).toBeNull();
    });

    it('should display error if no pokemon name is extracted', () => {
      queryParserService.parseQuery.and.returnValue({ pokemonName: undefined, requestedInfo: ['all'] });
      component.query = 'just keywords';
      component.search();

      expect(component.loading).toBeFalse();
      expect(component.error).toBeTrue();
      expect(component.errorMessage).toContain('Please provide a Pokémon name');
      expect(component.pokemon).toBeNull();
    });

    it('should update requestedInfo after a search', () => {
      queryParserService.parseQuery.and.returnValue({ pokemonName: 'pikachu', requestedInfo: ['type', 'abilities'] });
      component.query = 'type and abilities of pikachu';
      component.search();

      const req = httpTestingController.expectOne('https://pokeapi.co/api/v2/pokemon/pikachu');
      req.flush(mockPokemonData);

      expect(component.requestedInfo).toEqual(['type', 'abilities']);
    });
  });

  describe('Team Management', () => {
    it('should add a pokemon to the team', () => {
      expect(component.myTeam.length).toBe(0);
      component.addPokemonToTeam(mockPokemonData);
      expect(component.myTeam.length).toBe(1);
      expect(component.myTeam[0].name).toBe('pikachu');
      expect(localStorage.getItem('myPokemonTeam')).toContain('pikachu');
    });

    it('should not add a pokemon if team is full', () => {
      component.myTeam = [
        { name: 'charmander', imageUrl: 'charmander.png' },
        { name: 'squirtle', imageUrl: 'squirtle.png' },
        { name: 'bulbasaur', imageUrl: 'bulbasaur.png' }
      ];
      expect(component.isTeamFull()).toBeTrue();
      component.addPokemonToTeam(mockPokemonData);
      expect(component.myTeam.length).toBe(3); // Should not add
    });

    it('should not add a pokemon if it is already in the team', () => {
      component.myTeam = [{ name: 'pikachu', imageUrl: 'pikachu.png' }];
      expect(component.isPokemonInTeam('pikachu')).toBeTrue();
      component.addPokemonToTeam(mockPokemonData);
      expect(component.myTeam.length).toBe(1); // Should not add
    });

    it('should remove a pokemon from the team', () => {
      component.myTeam = [
        { name: 'charmander', imageUrl: 'charmander.png' },
        { name: 'squirtle', imageUrl: 'squirtle.png' }
      ];
      component.removePokemonFromTeam('charmander');
      expect(component.myTeam.length).toBe(1);
      expect(component.myTeam[0].name).toBe('squirtle');
      expect(localStorage.getItem('myPokemonTeam')).not.toContain('charmander');
    });

    it('isTeamFull should return true if team has 3 members', () => {
      component.myTeam = [{}, {}, {}] as TeamPokemon[];
      expect(component.isTeamFull()).toBeTrue();
    });

    it('isTeamFull should return false if team has less than 3 members', () => {
      component.myTeam = [{}, {}] as TeamPokemon[];
      expect(component.isTeamFull()).toBeFalse();
    });

    it('isPokemonInTeam should return true if pokemon is in team', () => {
      component.myTeam = [{ name: 'pikachu', imageUrl: 'pikachu.png' }];
      expect(component.isPokemonInTeam('pikachu')).toBeTrue();
    });

    it('isPokemonInTeam should return false if pokemon is not in team', () => {
      component.myTeam = [{ name: 'charmander', imageUrl: 'charmander.png' }];
      expect(component.isPokemonInTeam('pikachu')).toBeFalse();
    });
  });
});
