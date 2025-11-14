import { useEffect } from 'react'
import './ConfirmDialog.css'

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  tone = 'default',
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel?.()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) {
    return null
  }

  return (
    <div className="confirm-dialog__backdrop" role="presentation" onClick={onCancel}>
      <div
        className={`confirm-dialog__container confirm-dialog__container--${tone}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(event) => event.stopPropagation()}
      >
        {title && (
          <h3 id="confirm-dialog-title" className="confirm-dialog__title">
            {title}
          </h3>
        )}
        <p id="confirm-dialog-message" className="confirm-dialog__message">
          {message}
        </p>
        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-dialog__btn confirm-dialog__btn--secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" className="confirm-dialog__btn confirm-dialog__btn--primary" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
