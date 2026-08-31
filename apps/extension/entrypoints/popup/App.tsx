import { CORE_VERSION } from '@promptvox/core';
import { UI_VERSION } from '@promptvox/ui';

export default function App() {
  return (
    <div style={{ padding: '16px', fontFamily: 'monospace', minWidth: '300px' }}>
      <h1>PromptVox Extension</h1>
      <p>Core version: {CORE_VERSION}</p>
      <p>UI version: {UI_VERSION}</p>
    </div>
  );
}
