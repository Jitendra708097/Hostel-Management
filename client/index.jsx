
import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import App  from './App';
import './src/style/index.css';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import { store } from './src/redux/store';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
