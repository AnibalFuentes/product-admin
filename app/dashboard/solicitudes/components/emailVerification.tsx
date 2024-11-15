import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAuth, sendEmailVerification, updateEmail } from 'firebase/auth'
import toast from 'react-hot-toast'

interface EmailVerificationDialogProps {
  onEmailVerified: (email: string) => void
}

export function EmailVerificationDialog({ onEmailVerified }: EmailVerificationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSendVerification = async () => {
    const auth = getAuth()
    const currentUser = auth.currentUser

    if (!currentUser) {
      toast.error("No hay un usuario autenticado para verificar.")
      return
    }

    try {
      setIsVerifying(true)
      await updateEmail(currentUser, email) // Actualiza el email temporalmente en Firebase
      await sendEmailVerification(currentUser)
      toast.success("Correo de verificación enviado. Verifica tu bandeja de entrada.")
      
      // Después de enviar la verificación, esperamos la confirmación del usuario
      onEmailVerified(email) // Envía el email verificado al componente principal
      setIsOpen(false)
    } catch (error) {
      const err = error as Error
      toast.error(`Error al enviar verificación: ${err.message}`)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Verificar Email</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verificar Nuevo Email</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="email">Nuevo Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Ingrese el nuevo email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSendVerification} disabled={!email || isVerifying}>
            {isVerifying ? 'Enviando...' : 'Enviar Verificación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
