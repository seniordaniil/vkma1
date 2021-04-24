import React, { FC, useCallback, useState, useEffect, useRef } from 'react';
import { Icon28SunOutline } from '@vkontakte/icons';
import {
  View,
  Panel,
  useAdaptivity,
  AppRoot,
  SplitLayout,
  SplitCol,
  ViewWidth,
  PanelHeader,
} from '@vkontakte/vkui';
import styled from 'styled-components';
import bridge, { VKBridgeSubscribeHandler } from '@vkontakte/vk-bridge';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

const Cell = styled.div`
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Button = styled.button<{ color: string; active: boolean }>`
  outline: none;
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: ${({ active }) => (active ? '1px solid' : 'none')};
  border-radius: 100%;
  color: ${({ color }) => color};
`;

const count = 8;

export const App: FC = () => {
  const { viewWidth } = useAdaptivity();

  const [open, setOpen] = useState(true);
  const openRef = useRef(open);
  openRef.current = open;

  const [active, setActive] = useState<number>(null);
  const [states, setStates] = useState<Record<number, boolean>>({});
  const statesRef = useRef(states);
  statesRef.current = states;

  const toggleActive = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const index = parseInt(e.currentTarget.dataset.index);

      setStates((state) => ({
        ...state,
        [index]: !state[index],
      }));
    },
    [setStates],
  );

  useEffect(() => {
    let step = -1;
    const interval = setInterval(() => {
      if (!openRef.current) return;

      step++;
      if (step === count) step = 0;

      bridge
        .send('VKWebAppFlashSetLevel', {
          level: Number(Boolean(statesRef.current[step])),
        })
        .then(() => {
          setActive(step);
        })
        .catch(console.error);
    }, 1000);

    const handler: VKBridgeSubscribeHandler = (e) => {
      switch (e.detail.type) {
        case 'VKWebAppViewHide':
          setOpen(false);
          bridge
            .send('VKWebAppFlashSetLevel', {
              level: 0,
            })
            .catch(console.error);
          break;
        case 'VKWebAppViewRestore':
          setOpen(true);
          break;
      }
    };

    bridge.subscribe(handler);

    return () => {
      clearInterval(interval);
      bridge.unsubscribe(handler);
    };
  }, [statesRef, setActive, openRef, setOpen]);

  return (
    <AppRoot>
      <SplitLayout header={<PanelHeader separator={false} />}>
        <SplitCol spaced={Number(viewWidth) > ViewWidth.MOBILE}>
          <View activePanel={'main'}>
            <Panel id={'main'}>
              <PanelHeader separator={false} />
              <Wrapper>
                {Array.from({ length: count }).map((_, index) => (
                  <Cell key={index}>
                    <Button
                      active={active === index}
                      onClick={toggleActive}
                      data-index={index}
                      color={
                        states[index]
                          ? 'var(--button_primary_background)'
                          : 'var(--icon_secondary)'
                      }
                    >
                      <Icon28SunOutline height={36} width={36} />
                    </Button>
                  </Cell>
                ))}
              </Wrapper>
            </Panel>
          </View>
        </SplitCol>
      </SplitLayout>
    </AppRoot>
  );
};
