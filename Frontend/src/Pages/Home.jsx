import Contacto from "../Components/Contacto"
import Hero from "../Components/Hero"
import Media from "../Components/Media"
import MisTrabajos from "../Components/MisTrabajos"
import Quiensoy from "../Components/Quiensoy"
import Ubicacion from "../Components/Ubicacion"

const Home = () => {
  return (
    <div className="home-page">
      <Hero/>
      <Quiensoy/>
      <MisTrabajos/>
      <Ubicacion/>
      <Contacto/>
      <Media/>
    </div>
  )
}

export default Home