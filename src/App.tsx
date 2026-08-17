import { Bounce, ToastContainer } from "react-toastify"
import AppRouter from "./routes/AppRouter"
import { AuthProvider } from "./components/context/AuthContext"

function App() {

  return (
    <>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </>
  )
}

export default App