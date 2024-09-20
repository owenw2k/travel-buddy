import { Modal, Button, ColorPicker,  Input} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

export default function ColorModal() {
  const dispatch = useDispatch();
  const [opened, { open, close }] = useDisclosure(false);
  const [color, onColorChange] = useState('#02A');
  const [name, onNameChange] = useState('');

  const handleCreate = () => {
    dispatch({type: 'ADD_LEGEND', payload: {color, name}});
    close();
  }

  return (
    <>
      <Modal opened={opened} onClose={close} title="Add Legend">
        <Input.Wrapper label="Legend Color">
          <ColorPicker fullWidth size="lg" value={color} onChange={onColorChange} />
        </Input.Wrapper>
        <Input.Wrapper label="Legend Name" pt={5} pb={10}>
          <Input placeholder="" value={name} onChange={(event) => onNameChange(event.currentTarget.value)}/>
        </Input.Wrapper>
        <Button fullWidth onClick={handleCreate}>Create</Button>
      </Modal>

      <Button fullWidth onClick={open} variant='default'>Add</Button>
    </>
  );
}