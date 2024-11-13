import Logo from './logo'
import { ProfileDropdown } from './profile-dropdown'
import { ModeToggle } from './toggle-mode'

const Navbar = () => {
  return (
    <div className='flex justify-between mx-6 mb-10 lg:mx-10 py-6 border-b border-solid border-gray-200 md:border-0'>
      <Logo />
      <div className=''>
        <ProfileDropdown/>
        <ModeToggle/>
      </div>
    </div>
  )
}

export default Navbar
