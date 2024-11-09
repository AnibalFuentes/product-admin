import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function SwitchStateItem () {
  return (
    <div className='flex items-center space-x-2'>
      <Switch id='state' />
      <Label htmlFor='state'>estado</Label>
    </div>
  )
}
