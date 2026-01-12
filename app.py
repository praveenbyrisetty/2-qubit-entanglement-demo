from flask import Flask, render_template, jsonify, request
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

app = Flask(__name__)
simulator = AerSimulator()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/run_circuit', methods=['POST'])
def run_circuit():
    try:
        data = request.json
        shots = data.get('shots', 1)
        
        qc = QuantumCircuit(2)
        qc.h(0)
        qc.cx(0, 1)
        qc.measure_all()
        
        job = simulator.run(transpile(qc, simulator), shots=shots)
        result = job.result()
        counts = result.get_counts()
        
        total = sum(counts.values())
        dist = {
            '00': (counts.get('00', 0) / total) * 100,
            '01': (counts.get('01', 0) / total) * 100,
            '10': (counts.get('10', 0) / total) * 100,
            '11': (counts.get('11', 0) / total) * 100
        }
        return jsonify({'results': dist})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)