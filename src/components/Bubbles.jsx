import React, { useEffect, useState } from "react";
import "../styles/Bubbles.css";

export default function Bubbles({ count = 20 }) {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const newBubbles = Array.from({ length: count }).map(() => ({
      id: Math.random().toString(36).substr(2, 9),
      left: Math.random() * 100,
      size: 30 + Math.random() * 50, // bigger bubbles
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
      opacity: 0.2 + Math.random() * 0.3,
      speedX: (Math.random() - 0.5) * 0.5,
      gradient: `radial-gradient(circle at 30% 30%, rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 255, 0.3), rgba(255, 255, 255, 0))`
    }));
    setBubbles(newBubbles);
  }, [count]);

  return (
    <div className="bubbles-container">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="bubble"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            opacity: b.opacity,
            '--speed-x': b.speedX,
            background: b.gradient
          }}
        />
      ))}
    </div>
  );
}
