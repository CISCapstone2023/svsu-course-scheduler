import { useEffect, useState } from "react";

/**
 * Sidebar Hook
 *
 * This hook allows for toggling a boolean value (sidebar)
 * then saves the state to local storage
 *
 * @returns boolean, toggle function
 */
const useSidebar = () => {
  //Deafult state of the sidebar
  const [sidebar, setShowSidebar] = useState(true);

  //Toggle the sidebar but inverting the current value
  const toggleSidebar = () => {
    //Grab a local copy of the value
    const value = sidebar;
    setShowSidebar(!value);
    //Save the value to local storage
    localStorage.setItem("dashboard/sidebar", !value ? "true" : "false");
  };

  //On Component Mount (useEffect with no dependencies)
  useEffect(() => {
    //Local the value (its a string..., so just check if true is a string)
    const value = localStorage.getItem("dashboard/sidebar");
    setShowSidebar(!(value == "false"));
  }, []);

  //Return the values as tuple with specified data types
  return [sidebar, toggleSidebar] as [boolean, () => void];
};

//Export the function so other files can use it
export default useSidebar;
