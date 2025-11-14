import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './toast.css'
import './index.css'
import './fontawesome.js'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <ToastContainer
      position="top-center"
      autoClose={3000}
      hideProgressBar={true}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      theme="light"
      limit={3}
    />
  </>,
)
