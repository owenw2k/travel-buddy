import { Container, Tabs} from '@mantine/core';
import { useDispatch } from 'react-redux';

const tabs = [
  'World',
  'America'
];

export default function Header() {

  const dispatch = useDispatch();

  const items = tabs.map((tab) => (
    <Tabs.Tab value={tab} key={tab}>
      {tab}
    </Tabs.Tab>
  ));

  return (
    <header className='header'>
      <Container ms={0} py={8} className='inner'>
        <Tabs
          defaultValue="World"
          variant="outline"
          visibleFrom="sm"
          onChange={() => dispatch({type: "SWITCH_MAP"})}
        >
          <Tabs.List>{items}</Tabs.List>
        </Tabs>
      </Container>
    </header>
  );
}