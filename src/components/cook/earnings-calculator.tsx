"use client";

import { useState } from "react";
import { money } from "@/lib/format";
import { COOK_SHARE } from "@/lib/pricing";

export function EarningsCalculator() {
  const [price, setPrice] = useState(15);
  const [portions, setPortions] = useState(12);
  const [nights, setNights] = useState(2);
  const weekly = price * 100 * portions * nights * COOK_SHARE;
  return (
    <div className="card p-5">
      <Slider label="Price per meal" value={price} min={8} max={40} step={1} format={(v) => `$${v}`} onChange={setPrice} />
      <Slider label="Portions per night" value={portions} min={4} max={40} step={1} format={(v) => `${v}`} onChange={setPortions} />
      <Slider label="Nights per week" value={nights} min={1} max={6} step={1} format={(v) => `${v}`} onChange={setNights} />
      <div className="mt-5 rounded-2xl bg-sage-soft p-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-sage">Estimated take-home</p>
        <p className="font-display text-4xl font-bold text-ink">
          {money(Math.round(weekly))}
          <span className="text-base font-sans font-semibold text-ink-soft"> / week</span>
        </p>
        <p className="mt-1 text-sm text-ink-soft">About {money(Math.round(weekly * 4.33))} a month, before tips and ingredients.</p>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, format, onChange }: { label: string; value: number; min: number; max: number; step: number; format: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <label className="mt-3 block first:mt-0">
      <span className="flex justify-between text-sm">
        <span className="font-bold">{label}</span>
        <span className="font-display font-bold">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full accent-tomato" />
    </label>
  );
}
