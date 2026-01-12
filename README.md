# 2-Qubit Entanglement Demo

A web-based Quantum Entanglement simulator built with Python (Flask) and Qiskit.
It features a 3D Bloch Sphere visualization using Three.js to demonstrate Bell States.

## Features
- **Visual Circuit Builder**: Interactive H-Gate and CNOT Gate placement.
- **Real Quantum Logic**: Uses `qiskit-aer` to simulate quantum state vectors.
- **3D Visualization**: Bloch spheres update in real-time using Three.js.

## How to Run Locally
1. Install dependencies: `pip install -r requirements.txt`
2. Run the app: `python app.py`
3. Open browser: `http://127.0.0.1:5000`