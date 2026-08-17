import React from 'react';

const CHARSET_PRESETS = [
  { label: 'Classic', value: '@%#*+=-:. ' },
  { label: 'Blocks', value: '█▓▒░ ' },
  { label: 'Minimal', value: '#.  ' },
  { label: 'Binary', value: '10 ' },
];

export default function SettingsPanel({ settings, onChange }) {
  const update = (key, value) => onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="width" className="block text-sm font-medium text-gray-300 mb-1">
          Width: {settings.width} characters
        </label>
        <input
          id="width"
          type="range"
          min="40"
          max="220"
          value={settings.width}
          onChange={(e) => update('width', Number(e.target.value))}
          className="w-full accent-accent"
        />
      </div>

      <div>
        <label htmlFor="charset" className="block text-sm font-medium text-gray-300 mb-1">
          Character set
        </label>
        <select
          id="charset"
          value={settings.charset}
          onChange={(e) => update('charset', e.target.value)}
          className="w-full bg-black border border-gray-700 rounded-md px-3 py-2 font-mono"
        >
          {CHARSET_PRESETS.map((preset) => (
            <option key={preset.label} value={preset.value}>
              {preset.label} ({preset.value.trim()})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="invert"
          type="checkbox"
          checked={settings.invert}
          onChange={(e) => update('invert', e.target.checked)}
          className="accent-accent"
        />
        <label htmlFor="invert" className="text-sm font-medium text-gray-300">Invert brightness</label>
      </div>

      <div>
        <label htmlFor="brightness" className="block text-sm font-medium text-gray-300 mb-1">
          Brightness: {settings.brightness}
        </label>
        <input
          id="brightness"
          type="range"
          min="-100"
          max="100"
          value={settings.brightness}
          onChange={(e) => update('brightness', Number(e.target.value))}
          className="w-full accent-accent"
        />
      </div>

      <div>
        <label htmlFor="contrast" className="block text-sm font-medium text-gray-300 mb-1">
          Contrast: {settings.contrast}
        </label>
        <input
          id="contrast"
          type="range"
          min="-100"
          max="100"
          value={settings.contrast}
          onChange={(e) => update('contrast', Number(e.target.value))}
          className="w-full accent-accent"
        />
      </div>
    </div>
  );
}

export const DEFAULT_SETTINGS = {
  width: 100,
  charset: '@%#*+=-:. ',
  invert: false,
  brightness: 0,
  contrast: 0,
};
