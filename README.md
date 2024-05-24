# Boids Simulation

This project is a simulation of boids, which are simple agents that exhibit flocking behavior. The boids in this simulation adjust their velocity based on three rules: alignment, cohesion, and separation. The simulation also includes mouse interaction where boids avoid the mouse pointer, and their color and shape change based on their speed.

## Features

- **Alignment**: Boids try to match the velocity of nearby boids.
- **Cohesion**: Boids steer towards the average position of their neighbors.
- **Separation**: Boids avoid crowding too closely to each other.
- **Mouse Interaction**: Boids avoid the mouse pointer.
- **Visual Effects**: Boids change color and size based on their speed.
- **Dynamic Canvas Resizing**: The canvas resizes dynamically with the window.

## Getting Started

### Prerequisites

- A modern web browser that supports HTML5 and JavaScript.

### Running the Simulation

1. Clone the repository or download the files.
2. Open `index.html` in your web browser.

### Files

- `index.html`: Contains the HTML structure and references the JavaScript file.
- `boids.js`: Contains the JavaScript code that runs the boids simulation.