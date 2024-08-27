"use client";

import Header from './header/header';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducer';
import MapContainer from './map/mapContainer';
import Legend from './legend/legend';

const store = configureStore({
  reducer: rootReducer
})

export default function Home() {
  return (
    <Provider store={store}>
      <MantineProvider>
        <Legend/>
        <Header/>
        <MapContainer/>
      </MantineProvider>
    </Provider>
  );
}
