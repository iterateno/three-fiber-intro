import "./App.css";
import "./card/base.css";
import "./card/rare.css";
import { clamp, round } from "./helpers/math.ts";
import card from "/card.png";

function interact(event: React.PointerEvent<HTMLDivElement>) {
  const el = event.target as HTMLElement; // cast to HTMLElement
  const rect = el.getBoundingClientRect(); // get element's current size/position
  const absolute = {
    x: event.clientX - rect.left, // get mouse position from left
    y: event.clientY - rect.top, // get mouse position from right
  };
  const percent = {
    x: clamp(round((100 / rect.width) * absolute.x)),
    y: clamp(round((100 / rect.height) * absolute.y)),
  };
  const norm = {
    x: percent.x / 100 - 0.5,
    y: percent.y / 100 - 0.5,
  };
  const deg = {
    x: norm.y * 50,
    y: -norm.x * 25,
  };

  const dynamicStyle = {
    "--pointer-x": `${percent.x}%`,
    "--pointer-y": `${percent.y}%`,
    "--rotate-x": `${deg.x}deg`,
    "--rotate-y": `${deg.y}deg`,
  };

  // Apply dynamicStyle to root.
  for (const [key, value] of Object.entries(dynamicStyle)) {
    document.documentElement.style.setProperty(key, value);
  }
}

function App() {
  return (
    <div>
      <div
        className="card"
        style={{ height: "80vh", position: "relative" }}
        onPointerMove={interact}
      >
        <img src={card} alt="Vite logo" style={{ height: "100%" }} />
        <div className="shine"></div>
        <div className="glare"></div>
      </div>
    </div>
  );
}

export default App;
