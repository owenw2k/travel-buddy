"use client";

import Map  from './map/map';
import Header from './header/header';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './reducer'

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
