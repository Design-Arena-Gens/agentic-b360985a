'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    const plane = {
      x: 100,
      y: 300,
      vx: 0,
      vy: 0,
      angle: 0
    };

    const obstacles: { x: number; y: number; width: number; height: number }[] = [];
    const keys: { [key: string]: boolean } = {};

    const addObstacle = () => {
      obstacles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 100),
        width: 50,
        height: 50
      });
    };

    const obstacleInterval = setInterval(addObstacle, 2000);

    const update = () => {
      // Controls
      if (keys['ArrowUp']) {
        plane.vx += Math.cos(plane.angle) * 0.1;
        plane.vy += Math.sin(plane.angle) * 0.1;
      }
      if (keys['ArrowDown']) {
        plane.vx -= Math.cos(plane.angle) * 0.05;
        plane.vy -= Math.sin(plane.angle) * 0.05;
      }
      if (keys['ArrowLeft']) plane.angle -= 0.05;
      if (keys['ArrowRight']) plane.angle += 0.05;

      // Physics
      plane.vy += 0.02; // gravity
      plane.x += plane.vx;
      plane.y += plane.vy;
      plane.vx *= 0.99;
      plane.vy *= 0.99;

      // Update obstacles
      obstacles.forEach((obs, i) => {
        obs.x -= 2;
        if (obs.x + obs.width < 0) obstacles.splice(i, 1);
      });

      // Collision
      obstacles.forEach(obs => {
        if (
          plane.x < obs.x + obs.width &&
          plane.x + 20 > obs.x &&
          plane.y < obs.y + obs.height &&
          plane.y + 20 > obs.y
        ) {
          setGameOver(true);
        }
      });

      // Boundaries
      if (plane.y < 0 || plane.y > canvas.height - 20) setGameOver(true);

      setScore(prev => prev + 1);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw plane
      ctx.save();
      ctx.translate(plane.x, plane.y);
      ctx.rotate(plane.angle);
      ctx.fillStyle = 'blue';
      ctx.fillRect(-10, -5, 20, 10);
      ctx.restore();

      // Draw obstacles
      ctx.fillStyle = 'red';
      obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      });
    };

    const gameLoop = () => {
      if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    gameLoop();

    return () => {
      clearInterval(obstacleInterval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Plane Simulator</h1>
      <div className="relative">
        <canvas ref={canvasRef} className="border border-gray-400"></canvas>
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded">
              <h2 className="text-xl font-bold">Game Over</h2>
              <p>Score: {score}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Restart
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="mt-4">Score: {score}</p>
      <p className="text-sm text-gray-600">Use arrow keys to control the plane</p>
    </div>
  );
}