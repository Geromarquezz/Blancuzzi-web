import { useContext } from 'react'
import { TurnosContext } from '../Context/TurnosContext.jsx'

export const useTurnos = () => {
    const context = useContext(TurnosContext)
    
    if (!context) {
        throw new Error('useTurnos debe ser usado dentro de un TurnosProvider')
    }
    
    return context
}