"use client";

import Map  from './map/map';
import Header from './header/header';
import { MantineProvider } from '@mantine/core';
import { Button } from '@mantine/core';

export default function Home() {
  return (
    <MantineProvider>
        <Header/>
        <Map/>
    </MantineProvider>
  );
}
