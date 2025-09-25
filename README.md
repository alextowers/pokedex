# Pokedex App

This is a Pokedex application built with Angular, designed to provide information about Pokémon through natural language queries.

## Our Collaboration

This application was built through an interactive session with a Gemini CLI agent. The agent guided the development process, from setting up the initial Angular project to implementing features and styling. Our collaboration involved:

*   **Initial Setup:** Setting up the Angular project and configuring the development environment.
*   **Standalone Conversion:** Migrating the application to a standalone Angular architecture.
*   **Core Functionality:** Implementing the search mechanism to fetch and display Pokémon data from the PokéAPI.

*   **Enhanced Query Processing:** Developing a `QueryParserService` to understand natural language queries, extract Pokémon names, and identify requested information (types, abilities, stats) with synonym handling.
*   **Improved Error Handling:** Implementing specific and user-friendly error messages.
*   **Pokedex-themed UI:** Styling the application to resemble a classic Pokedex device.
*   **"My Team" Feature:** Adding functionality to create a team of up to three Pokémon, store it in local storage, and display Pokémon images in the team list.

## Features

*   Natural language query processing (e.g., "tell me the type of psyduck", "abilities of pikachu").
*   Displays Pokémon name, image, types, abilities, and stats.
*   Conditional display of information based on query.
*   "My Team" feature to add/remove up to three Pokémon, persisted in local storage.
*   Pokedex-themed user interface.

## Local Installation and Running

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (Node Package Manager)

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/alextowers/pokedex.git
    cd pokedex
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the application:**
    ```bash
    ng serve -o
    ```
    This will open the application in your default web browser at `http://localhost:4200`.

## Docker Installation and Running

### Prerequisites

*   Docker

### Steps

1.  **Build the Docker image:**
    ```bash
    docker build -t pokedex-app .
    ```
2.  **Run the Docker container:**
    ```bash
    docker run -p 4200:4200 --name pokedex-dev-container -d pokedex-app
    ```
3.  **Access the application:**
    Open your web browser and navigate to `http://localhost:4200`.

## API Credits

Pokémon data is provided by the [PokéAPI](https://pokeapi.co/).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.