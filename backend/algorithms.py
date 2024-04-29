from itertools import permutations
import numpy as np
import random
from math import exp

def calculate_total_distance(route_indices, distance_matrix):
    return sum(distance_matrix[route_indices[i]][route_indices[i+1]] for i in range(len(route_indices) - 1))

def tsp_brute_force(locations, distance_matrix):
    print("Starting brute force TSP...")
    all_routes = permutations(locations)
    best_route = None
    min_distance = float('inf')
    for route in all_routes:
        route_indices = [locations.index(loc) for loc in route]
        total_distance = calculate_total_distance(route_indices, distance_matrix)
        if total_distance < min_distance:
            min_distance = total_distance
            best_route = route
        print(f"Checking route: {route} with distance: {total_distance}")
    print("Brute force TSP completed.")
    return list(best_route), min_distance

def tsp_genetic_algorithm(locations, distance_matrix, population_size=50, generations=500):
    print("Starting genetic algorithm TSP...")
    location_indices = list(range(len(locations)))
    population = [np.random.permutation(location_indices).tolist() for _ in range(population_size)]

    for generation in range(generations):
        fitness_scores = [1 / (calculate_total_distance(individual, distance_matrix) + 1) for individual in population]
        population_sorted_by_fitness = sorted(zip(population, fitness_scores), key=lambda x: x[1], reverse=True)
        population = [x[0] for x in population_sorted_by_fitness]

        new_population = []
        while len(new_population) < population_size:
            parent1, parent2 = population[np.random.randint(len(population))], population[np.random.randint(len(population))]
            crossover_point = np.random.randint(1, len(locations) - 1)
            child = parent1[:crossover_point] + [gene for gene in parent2 if gene not in parent1[:crossover_point]]
            new_population.append(child)
        population = new_population

    best_route_indices = population[0]
    best_route = [locations[idx] for idx in best_route_indices]
    best_distance = calculate_total_distance(best_route_indices, distance_matrix)
    print("Genetic algorithm TSP completed.")
    return best_route, best_distance

def tsp_nearest_neighbor(locations, distance_matrix):
    print("Starting nearest neighbor TSP...")
    current_location = locations[0]
    unvisited = set(locations[1:])
    route = [current_location]
    while unvisited:
        next_location = min(unvisited, key=lambda loc: distance_matrix[locations.index(current_location)][locations.index(loc)])
        route.append(next_location)
        unvisited.remove(next_location)
        current_location = next_location
    print("Nearest neighbor TSP completed.")
    return route, calculate_total_distance([locations.index(loc) for loc in route], distance_matrix)


def simulated_annealing(locations, distance_matrix):
    def calculate_total_distance(route):
        return sum(distance_matrix[route[i]][route[i+1]] for i in range(len(route)-1))

    current_route = locations[:]
    random.shuffle(current_route)
    min_route = current_route[:]
    min_distance = calculate_total_distance(current_route)

    temp = 10000  # High initial temperature
    cooling_rate = 0.003  # Cooling rate

    while temp > 1:
        i, j = random.sample(range(len(current_route)), 2)
        new_route = current_route[:]
        new_route[i], new_route[j] = new_route[j], new_route[i]  # Swap two cities
        new_distance = calculate_total_distance(new_route)
        if new_distance < min_distance or random.random() < exp((min_distance - new_distance) / temp):
            current_route = new_route
            if new_distance < min_distance:
                min_distance = new_distance
                min_route = current_route
        temp *= (1 - cooling_rate)

    return min_route, min_distance

def branch_and_bound(locations, distance_matrix):
    import itertools

    def calculate_total_distance(route):
        return sum(distance_matrix[route[i]][route[i+1]] for i in range(len(route)-1))

    best_distance = float('inf')
    best_route = None

    for route in itertools.permutations(locations):
        current_distance = calculate_total_distance(route)
        if current_distance < best_distance:
            best_distance = current_distance
            best_route = route

    return best_route, best_distance