import {createContext, PropsWithChildren, useEffect, useState} from 'react';
import {NewService} from './service';

export type IAppContext = {
  loading: boolean;
  state: any;
};

export const AppContextInitialState = {
  loading: true,
  state: {},
};

export const AppContext = createContext<IAppContext>(AppContextInitialState);

export function AppContextProvider({children}: PropsWithChildren<any>) {
  const [appState, setAppState] = useState(AppContextInitialState);

  const changeState = (newState: any) => {
    setAppState((prev) =>
      JSON.stringify(newState) !== JSON.stringify(prev.state)
        ? {state: newState, loading: false}
        : prev
    );
  };

  useEffect(() => {
    NewService(changeState);
  }, []);

  return (
    <AppContext.Provider value={{...appState}}>
      <div>{children}</div>
    </AppContext.Provider>
  );
}
