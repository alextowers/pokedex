import { Component, OnInit } from '@angular/core'; // Import OnInit
import { HttpClient } from '@angular/common/http';
import { QueryParserService, ParsedQuery } from './app/query-parser.service'; // Import the new service
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const TEAM_STORAGE_KEY = 'myPokemonTeam';
export interface TeamPokemon {
  name: string;
  imageUrl: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AppComponent implements OnInit {
  // Implement OnInit
  title = 'pokedex';
  query = '';
  pokemon: any;
  loading = false;
  error = false;
  errorMessage: string | null = null; // New property for specific error messages
  requestedInfo: ('all' | 'type' | 'abilities' | 'stats')[] = ['all']; // New property, now an array
  myTeam: TeamPokemon[] = []; // New property for the team, now stores TeamPokemon objects

  constructor(
    private http: HttpClient,
    private queryParserService: QueryParserService
  ) {} // Inject the service

  ngOnInit(): void {
    // Implement ngOnInit
    this.loadTeamFromLocalStorage();
  }

  loadTeamFromLocalStorage(): void {
    const team = localStorage.getItem(TEAM_STORAGE_KEY);
    if (team) {
      const storedNames: string[] = JSON.parse(team);
      // For each stored name, fetch its image URL
      storedNames.forEach((name) => {
        this.http
          .get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
          .subscribe((pokemonData: any) => {
            this.myTeam.push({
              name: pokemonData.name,
              imageUrl: pokemonData.sprites.front_default,
            });
          });
      });
    }
  }

  saveTeamToLocalStorage(): void {
    // Store only names in local storage to avoid storing large image data
    const teamNames = this.myTeam.map((p) => p.name);
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(teamNames));
  }

  addPokemonToTeam(pokemon: any): void {
    // pokemon parameter is now the full pokemon object
    if (!this.isTeamFull() && !this.isPokemonInTeam(pokemon.name)) {
      this.myTeam.push({
        name: pokemon.name,
        imageUrl: pokemon.sprites.front_default,
      });
      this.saveTeamToLocalStorage();
    }
  }

  removePokemonFromTeam(pokemonName: string): void {
    this.myTeam = this.myTeam.filter((p) => p.name !== pokemonName);
    this.saveTeamToLocalStorage();
  }

  isTeamFull(): boolean {
    return this.myTeam.length >= 3;
  }

  isPokemonInTeam(pokemonName: string): boolean {
    return this.myTeam.some((p) => p.name === pokemonName);
  }

  search() {
    this.loading = true;
    this.error = false;
    this.errorMessage = null; // Reset error message for each search
    this.pokemon = null;

    const parsedQuery: ParsedQuery = this.queryParserService.parseQuery(
      this.query
    );
    const pokemonName = parsedQuery.pokemonName;
    this.requestedInfo = parsedQuery.requestedInfo;

    if (!pokemonName) {
      this.error = true;
      this.errorMessage = 'Please provide a Pokémon name in your query.';
      this.loading = false;
      return;
    }

    this.http.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`).subscribe(
      (pokemon) => {
        this.pokemon = pokemon;
        this.loading = false;
      },
      (errorResponse) => {
        this.error = true;
        this.loading = false;
        if (errorResponse.status === 404) {
          this.errorMessage = `Pokémon "${pokemonName}" not found. Please check the spelling.`;
        } else {
          this.errorMessage =
            'An unexpected error occurred while fetching Pokémon data.';
        }
      }
    );
  }
}
