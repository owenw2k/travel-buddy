import { Button, Container, Tabs} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../types';
import { useEffect, useState } from 'react';

const tabs = [
  'World',
  'America'
];

export default function Header() {
  const[world, setWorld] = useState<Boolean>(true);
  const reduxWorld = useSelector((state: State) => state.world);

  useEffect(() => {
    setWorld(reduxWorld);
  }, [reduxWorld]);
  
  const dispatch = useDispatch();

  const items = tabs.map((tab) => (
    <Tabs.Tab value={tab} key={tab}>
      {tab}
    </Tabs.Tab>
  ));

  const clearData = () => {
    dispatch({type: "CLEAR_DATA"});
    window.location.reload();
  }

  return (
    <header className='header'>
      <Container ms={0} py={8} className='inner' fluid={true}>
        <Tabs
          value={world ? 'World' : 'America'}
          variant="outline"
          visibleFrom="sm"
          onChange={(value) => dispatch({type: "SWITCH_MAP", payload: {map: value}})}
        >
          <Tabs.List>{items}</Tabs.List>
        </Tabs>
        <Button variant='filled' color='red' onClick={clearData}>Clear Data</Button>
      </Container>
      <Container>
      </Container>
    </header>
  );
}