import Logo from "./logo";
import { ProfileDropdown } from "./profile-dropdown";
import { ModeToggle } from "./toggle-mode";

const Navbar = () => {
  return (
    <div className="flex justify-end max-w-full w-full px-4 lg:px-10 py-2 border-b border-solid border-gray-200 sticky top-0 bg-white/75 dark:bg-slate-950/75 backdrop-blur-lg z-40 ">
      <ProfileDropdown />
      <ModeToggle />
    </div>
  );
};

export default Navbar;
