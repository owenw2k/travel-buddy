"use client";

import WorldMap  from './map/worldMap';
import AmericaMap from './map/americaMap';
import Header from './header/header';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducer';
import Map from './map/map';

const store = configureStore({
  reducer: rootReducer
})

export default function Home() {
  return (
    <Provider store={store}>
      <MantineProvider>
        <Header/>
        <Map/>
      </MantineProvider>
    </Provider>
  );
}
