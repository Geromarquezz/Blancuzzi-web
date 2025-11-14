import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import ConfirmDialog from '../Components/ConfirmDialog.jsx'

const ConfirmContext = createContext(null)

export const ConfirmProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({ open: false })

  const closeDialog = useCallback((accepted) => {
    if (dialogState.resolve) {
      dialogState.resolve(accepted)
    }
    setDialogState({ open: false })
  }, [dialogState])

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        title: options?.title,
        message: options?.message,
        confirmText: options?.confirmText || 'Aceptar',
        cancelText: options?.cancelText || 'Cancelar',
        tone: options?.tone || 'default',
        resolve
      })
    })
  }, [])

  const contextValue = useMemo(() => confirm, [confirm])

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      <ConfirmDialog
        open={dialogState.open}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        tone={dialogState.tone}
        onConfirm={() => closeDialog(true)}
        onCancel={() => closeDialog(false)}
      />
    </ConfirmContext.Provider>
  )
}

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error('useConfirm debe ser usado dentro de un ConfirmProvider')
  }
  return ctx
}

export default ConfirmProvider
