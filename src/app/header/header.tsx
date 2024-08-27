import { useState } from 'react';
import { Container, Switch, Burger} from '@mantine/core';
import classes from './HeaderSimple.module.css';
import { useDispatch } from 'react-redux'

export default function Header() {

  const dispatch = useDispatch()

  return (
    <header className={classes.header}>
      <Container py={16} className={classes.inner}>
        <Switch
          defaultChecked
          size='lg'
          onLabel="World"
          offLabel="America"
          onChange={() => dispatch({type: "SWITCH_MAP"})}
        />
      </Container>
    </header>
  );
}