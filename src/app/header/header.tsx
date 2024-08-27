import { useState } from 'react';
import { Container, Switch, Burger} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './HeaderSimple.module.css';

export default function Header() {
  const [opened, { toggle }] = useDisclosure(false);


  return (
    <div className={classes.header}>
      <Container py={16} className={classes.inner}>
        <Switch
          size='lg'
          onLabel="World"
          offLabel="USA"
        />
      </Container>
    </div>
  );
}