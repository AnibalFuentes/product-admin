import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface SwitchStateItemProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function SwitchStateItem ({ checked, onChange }: SwitchStateItemProps) {
  return (
    <div className='flex items-center space-x-2'>
      <Switch id='state' checked={checked} onCheckedChange={onChange} />
      <Label htmlFor='state'>Estado</Label>
    </div>
  )
}
