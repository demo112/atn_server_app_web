import { SHARED_CONST } from '@attendance/shared';

console.log('Web: Attendance System Loaded');
console.log('Shared Constant:', SHARED_CONST);

// React entry point
import React from 'react';
import ReactDOM from 'react-dom/client';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    React.createElement('div', null, 
      React.createElement('h1', null, 'Attendance System Web'),
      React.createElement('p', null, `Shared: ${SHARED_CONST}`)
    )
  );
}
