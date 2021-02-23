import './App.css';
import {useContext} from 'react';
import {AppContext, AppContextProvider, IAppContext} from './AppContext';

function App() {
  return (
    <div className="App">
      <AppContextProvider>
        <ShowState />
      </AppContextProvider>
    </div>
  );
}

function ShowState() {
  const {state, loading} = useContext<IAppContext>(AppContext);
  console.log('Rerender', state, loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>My info</div>
      <p>Me: {state?.user?.name}</p>
      <div>My friends: {state?.user?.friends?.join(', ')}</div>
    </div>
  );
}

export default App;
