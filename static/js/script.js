// --- 3D ENGINE (THREE.JS) ---
function initBloch(id) {
    const container = document.getElementById(id);
    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.set(2.5, 1.5, 4); 
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    line.material.color.setHex(0x64748b);
    line.material.opacity = 0.2;
    line.material.transparent = true;
    scene.add(line);

    const createLine = (color, start, end) => {
        const mat = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });
        const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
        return new THREE.Line(geo, mat);
    };

    // Y (Vertical) - Green
    scene.add(createLine(0x22c55e, new THREE.Vector3(0, -2.5, 0), new THREE.Vector3(0, 2.5, 0))); 
    // X (Horizontal) - Red
    scene.add(createLine(0xef4444, new THREE.Vector3(-2.5, 0, 0), new THREE.Vector3(2.5, 0, 0))); 
    // Z (Depth) - Blue
    scene.add(createLine(0x3b82f6, new THREE.Vector3(0, 0, -2.5), new THREE.Vector3(0, 0, 2.5))); 

    const dir = new THREE.Vector3(0, 1, 0);
    const origin = new THREE.Vector3(0, 0, 0);
    const arrow = new THREE.ArrowHelper(dir, origin, 2, 0xffffff, 0.6, 0.3);
    scene.add(arrow);

    function animate() {
        requestAnimationFrame(animate);
        line.rotation.y += 0.002;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const nw = container.clientWidth;
        const nh = container.clientHeight;
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
    });

    return { arrow: arrow };
}

const bloch0 = initBloch('canvas0');
const bloch1 = initBloch('canvas1');


// --- LOGIC ---
const els = {
    pulses: [document.getElementById('p0'), document.getElementById('p1')],
    toggle: document.getElementById('animToggle'),
    status: document.getElementById('liveStatus'),
    boxes: [document.getElementById('resBox0'), document.getElementById('resBox1')]
};

const wait = ms => new Promise(r => setTimeout(r, ms));

function setStatus(msg) {
    els.status.innerText = "> " + msg;
}

function resetLab() {
    els.pulses.forEach(p => { p.style.opacity = 0; p.style.left = '0%'; p.style.transition = 'none'; });
    
    ['00','01','10','11'].forEach(k => {
        document.getElementById('b'+k).style.width = '0%';
        document.getElementById('v'+k).innerText = '0%';
    });

    els.boxes.forEach(b => {
        b.innerText = "?";
        b.style.borderColor = "#272e3b";
        b.style.color = "#8b949e";
        b.style.background = "rgba(35, 134, 54, 0.0)";
    });

    updateVector(bloch0, 'up');
    updateVector(bloch1, 'up');
    setStatus("System Reset. Ready.");
}

async function runExperiment(shots) {
    setStatus(`Running Experiment (${shots} Shots)...`);
    els.boxes.forEach(b => b.innerText = "?");

    if (els.toggle.checked) {
        const p0 = els.pulses[0]; const p1 = els.pulses[1];
        p0.style.opacity = 1; p1.style.opacity = 1; 
        await wait(200);
        
        // Move to H-Gate (18%)
        p0.style.transition = 'left 0.6s linear'; p1.style.transition = 'left 0.6s linear';
        p0.style.left = '18%'; p1.style.left = '18%'; 
        setStatus("H-Gate: Applying Superposition...");
        await wait(800);
        
        // Move to CNOT (50%)
        p0.style.left = '50%'; p1.style.left = '50%'; 
        setStatus("CNOT: Entangling Qubits...");
        await wait(800);
        
        // Move to End (90%)
        p0.style.left = '90%'; p1.style.left = '90%'; 
        await wait(600);
    }

    const res = await fetch('/api/run_circuit', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({shots: shots})
    }).then(r => r.json());

    for (let k in res.results) {
        let val = res.results[k].toFixed(1);
        document.getElementById('b'+k).style.width = val + '%';
        document.getElementById('v'+k).innerText = val + '%';
    }

    if (shots === 1) {
        let win = res.results['11'] > 0 ? '11' : '00';
        
        els.boxes[0].innerText = win[0];
        els.boxes[1].innerText = win[1];
        els.boxes.forEach(b => {
            b.style.borderColor = "#238636";
            b.style.color = "#3fb950";
            b.style.background = "rgba(35, 134, 54, 0.1)";
        });

        let dir = (win[0] === '0') ? 'up' : 'down';
        updateVector(bloch0, dir);
        updateVector(bloch1, dir);
        
        setStatus(`Measurement Result: |${win}⟩`);
    } else {
        updateVector(bloch0, 'mixed');
        updateVector(bloch1, 'mixed');
        setStatus(`Batch Complete.`);
    }
}

function updateVector(obj, state) {
    let x=0, y=0, z=0;
    if (state === 'up') { x=0; y=1; z=0; obj.arrow.setLength(2); }
    else if (state === 'down') { x=0; y=-1; z=0; obj.arrow.setLength(2); }
    else { x=0; y=0; z=0; obj.arrow.setLength(0.1); }
    
    obj.arrow.setDirection(new THREE.Vector3(x, y, z));
}