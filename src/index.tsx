import React from 'react';
import ReactDOM from 'react-dom';
import 'core-js/features/set';
import 'core-js/features/map';
import '@vkontakte/vkui/dist/vkui.css';
import { App } from './app';
import reportWebVitals from './reportWebVitals';
import { AdaptivityProvider, ConfigProvider } from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge';

bridge.subscribe(({ detail }) => {
  if (detail.type === 'VKWebAppUpdateConfig') {
    const schemeAttribute = document.createAttribute('scheme');
    schemeAttribute.value = detail.data.scheme || 'bright_light';

    document.body.attributes.setNamedItem(schemeAttribute);
  }
});

bridge.send('VKWebAppInit').catch(console.error);

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider>
      <AdaptivityProvider>
        <App />
      </AdaptivityProvider>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
