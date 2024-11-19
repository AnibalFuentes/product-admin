import Logo from "./logo";
import { ProfileDropdown } from "./profile-dropdown";
import { ModeToggle } from "./toggle-mode";

const Navbar = () => {
  return (
    <div className="flex justify-end   mb-0 lg:mx-10 py-6 border-b border-solid border-gray-200 sticky top-0 bg-white dark:bg-slate-950 z-40">
      <ProfileDropdown />
      <ModeToggle />
    </div>
  );
};

export default Navbar;
