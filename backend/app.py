from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json
import time

# Import all the required TSP algorithms from the algorithms module
from algorithms import (
    tsp_brute_force, 
    tsp_genetic_algorithm, 
    tsp_nearest_neighbor, 
    simulated_annealing, 
    branch_and_bound
)

app = Flask(__name__)
CORS(app)

def load_data(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

# Load nodes and edges data
nodes_data = load_data('../nodes.json')
edges_data = load_data('../edges.json')

# Extract locations and coordinates
locations = [node['Location'] for node in nodes_data]
latitude = {node['Location']: float(node['Latitude']) for node in nodes_data}
longitude = {node['Location']: float(node['Longitude']) for node in nodes_data}

# Create a distance matrix based on the edges data
distance_matrix = np.zeros((len(locations), len(locations)))
for edge in edges_data:
    i, j = locations.index(edge['Node1']), locations.index(edge['Node2'])
    distance = float(edge['Distance (km)'])
    distance_matrix[i, j] = distance_matrix[j, i] = distance

def run_algorithm(algorithm, route, matrix):
    start_time = time.time()
    if algorithm == 'brute_force':
        result = tsp_brute_force(route, matrix)
    elif algorithm == 'genetic':
        result = tsp_genetic_algorithm(route, matrix)
    elif algorithm == 'nearest_neighbor':
        result = tsp_nearest_neighbor(route, matrix)
    elif algorithm == 'simulated_annealing':
        result = simulated_annealing(route, matrix)
    elif algorithm == 'branch_and_bound':
        result = branch_and_bound(route, matrix)
    else:
        raise ValueError(f"Unsupported algorithm: {algorithm}")
    end_time = time.time()
    return result + (end_time - start_time,)

@app.route('/tsp/optimize_route', methods=['POST'])
def tsp_optimize_route():
    try:
        data = request.get_json()
        algorithms = data.get('algorithms', [])
        unoptimized_route_indices = [locations.index(node['id']) for node in data.get('path', [])]
        results = []
        for algorithm in algorithms:
            optimized_route_indices, total_distance, execution_time = run_algorithm(algorithm, unoptimized_route_indices, distance_matrix)
            optimized_route = [locations[idx] for idx in optimized_route_indices]
            results.append({
                'algorithm': algorithm,
                'optimized_route': optimized_route,
                'total_distance': total_distance,
                'execution_time': execution_time
            })
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e), 'results': []}), 500

if __name__ == '__main__':
    app.run(debug=True)
