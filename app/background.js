"use client";
import { useEffect, useRef } from "react";

// Бүх хуудасны ард: бүдэг neural network. Дохио давхаргаар урсана, хулгана node-ыг идэвхжүүлнэ.
export default function Background() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    let cleanup = () => {};
    let cancelled = false;

    import("three").then((THREE) => {
      if (cancelled) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobile = window.innerWidth < 768;
      const layers = mobile ? [3, 4, 4, 2] : [4, 6, 7, 6, 3];

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0xffffff, 1);
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
      camera.position.z = 5;
      const group = new THREE.Group();
      scene.add(group);

      // Цагаан дэвсгэр дээр өнгийг цагаан руу холих замаар бүдэг болгоно
      const white = new THREE.Color(0xffffff), blue = new THREE.Color(0x2563eb), teal = new THREE.Color(0x0d9488);
      const tint = (c, k, out) => out.copy(white).lerp(c, k);

      // Node, холбоос
      const nodes = [], edges = [];
      layers.forEach((count, l) => {
        for (let i = 0; i < count; i++) nodes.push({ l, i, count, x: 0, y: 0, glow: 0, phase: Math.random() * 6.28 });
      });
      nodes.forEach((a, ai) =>
        nodes.forEach((b, bi) => b.l === a.l + 1 && edges.push({ a: ai, b: bi, glow: 0 }))
      );
      const outgoing = nodes.map((_, i) => edges.map((e, ei) => (e.a === i ? ei : -1)).filter((x) => x >= 0));

      let aspect = 1;
      function layout() {
        aspect = window.innerWidth / window.innerHeight;
        camera.left = -aspect;
        camera.right = aspect;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        const w = aspect * 1.7;
        nodes.forEach((n) => {
          n.bx = -w / 2 + (n.l / (layers.length - 1)) * w;
          n.by = ((n.i + 0.5) / n.count - 0.5) * 1.5;
        });
      }
      layout();
      window.addEventListener("resize", layout);

      const circle = new THREE.CircleGeometry(1, 24);
      const nodeMesh = new THREE.InstancedMesh(circle, new THREE.MeshBasicMaterial(), nodes.length);
      group.add(nodeMesh);

      const linePos = new Float32Array(edges.length * 6), lineCol = new Float32Array(edges.length * 6);
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
      lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
      const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ vertexColors: true }));
      lines.position.z = -1;
      group.add(lines);

      const MAX = 60;
      const pulseMesh = new THREE.InstancedMesh(circle, new THREE.MeshBasicMaterial(), MAX);
      pulseMesh.position.z = 1;
      group.add(pulseMesh);
      let pulses = [];

      const fire = (ni) => {
        nodes[ni].glow = 1;
        const out = outgoing[ni];
        if (!out.length) return;
        const k = Math.random() < 0.3 ? 2 : 1;
        for (let j = 0; j < k && pulses.length < MAX; j++)
          pulses.push({ e: out[Math.floor(Math.random() * out.length)], t: 0, speed: 0.5 + Math.random() * 0.4 });
      };

      // Хулгана
      const mouse = new THREE.Vector2(99, 99), offset = new THREE.Vector2();
      const onMove = (e) =>
        mouse.set((e.clientX / window.innerWidth) * 2 * aspect - aspect, 1 - (e.clientY / window.innerHeight) * 2);
      window.addEventListener("pointermove", onMove);

      const m = new THREE.Matrix4(), c = new THREE.Color();
      const clock = new THREE.Clock();
      let last = 0, spawn = 0, frame;

      function draw() {
        const t = reduce ? 0 : clock.getElapsedTime();
        const dt = Math.min(t - last, 0.05);
        last = t;

        offset.lerp(mouse.x > 50 ? new THREE.Vector2() : mouse.clone().multiplyScalar(0.02), 0.05);
        group.position.set(offset.x, offset.y, 0);

        // Шинэ дохио оролтын давхаргаас
        spawn -= dt;
        if (spawn <= 0) {
          fire(Math.floor(Math.random() * layers[0]));
          spawn = 0.9 + Math.random() * 0.8;
        }

        nodes.forEach((n, i) => {
          n.x = n.bx;
          n.y = n.by + Math.sin(t * 0.4 + n.phase) * 0.015;
          if (Math.hypot(n.x + offset.x - mouse.x, n.y + offset.y - mouse.y) < 0.08 && n.glow < 0.2) fire(i);
          n.glow = Math.max(0, n.glow - dt * 0.8);
          const r = 0.009 + n.glow * 0.006;
          m.makeScale(r, r, 1).setPosition(n.x, n.y, 0);
          nodeMesh.setMatrixAt(i, m);
          nodeMesh.setColorAt(i, tint(n.l % 2 ? teal : blue, 0.22 + n.glow * 0.45, c));
        });
        nodeMesh.instanceMatrix.needsUpdate = true;
        nodeMesh.instanceColor.needsUpdate = true;

        edges.forEach((e, i) => {
          const a = nodes[e.a], b = nodes[e.b];
          linePos.set([a.x, a.y, 0, b.x, b.y, 0], i * 6);
          e.glow = Math.max(0, e.glow - dt * 0.6);
          tint(blue, 0.06 + e.glow * 0.25, c);
          lineCol.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6);
        });
        lineGeo.attributes.position.needsUpdate = true;
        lineGeo.attributes.color.needsUpdate = true;

        // Дохио холбоосын дагуу урсана
        const next = [];
        pulses.forEach((p) => {
          p.t += dt * p.speed;
          const e = edges[p.e];
          e.glow = Math.max(e.glow, 1 - Math.abs(p.t - 0.5));
          if (p.t >= 1) fire(e.b);
          else next.push(p);
        });
        pulses = next;
        for (let i = 0; i < MAX; i++) {
          const p = pulses[i];
          if (p) {
            const a = nodes[edges[p.e].a], b = nodes[edges[p.e].b];
            m.makeScale(0.006, 0.006, 1).setPosition(a.x + (b.x - a.x) * p.t, a.y + (b.y - a.y) * p.t, 0);
          } else m.makeScale(0, 0, 0);
          pulseMesh.setMatrixAt(i, m);
          pulseMesh.setColorAt(i, tint(blue, 0.55, c));
        }
        pulseMesh.instanceMatrix.needsUpdate = true;
        pulseMesh.instanceColor.needsUpdate = true;

        renderer.render(scene, camera);
        if (!reduce) frame = requestAnimationFrame(draw);
      }
      draw();

      cleanup = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", layout);
        window.removeEventListener("pointermove", onMove);
        [circle, lineGeo, nodeMesh.material, pulseMesh.material, lines.material].forEach((o) => o.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return <div ref={ref} className="bg-canvas" aria-hidden="true" />;
}
