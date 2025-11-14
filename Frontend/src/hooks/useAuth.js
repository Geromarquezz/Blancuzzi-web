import { useContext } from 'react'
import { AuthContext } from '../Context/AuthContext.jsx'

export const useAuth = () => {
    const context = useContext(AuthContext)
    
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider')
    }
    
    return context
}