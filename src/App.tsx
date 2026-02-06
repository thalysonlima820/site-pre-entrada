import { Route, Routes } from 'react-router-dom';
import './App.css'
import PreEnrtada from './page/PreEnrtada';
import Entradas from './page/Entradas';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<PreEnrtada />} />
        <Route path='/entrada' element={<Entradas />} />
      </Routes>
    </>
  )
}

export default App
