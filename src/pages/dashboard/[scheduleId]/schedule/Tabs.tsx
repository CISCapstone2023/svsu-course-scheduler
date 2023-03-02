import classNames from "classnames";
import { Button, Dropdown } from "react-daisyui";
import { ITab } from "src/server/api/routers/calendar";
import { Plus } from "tabler-icons-react";

//Properities for the <Tabs> Component
interface TabsProps {
  children?: React.ReactNode;
  tabs: ITab[];
  showChildren?: boolean;
  active: number;
  onSelect: (value: number) => void;
}
//Properities for the <Tab> Component
interface TabProps {
  children?: React.ReactNode;
  title: string;
  active: boolean;
  onClick: () => void;
}

//Tab Component
const Tab = ({ title, onClick, active }: TabProps) => {
  return (
    <div
      onClick={onClick}
      className={classNames(
        "h-50 flex grow cursor-pointer items-center justify-center border-r-2 bg-base-100 text-center hover:bg-base-200",
        {
          "bg-blue-500 text-white hover:bg-blue-500": active,
        }
      )}
    >
      <p>{title}</p>
    </div>
  );
};

//Tabs
export const Tabs = ({
  children,
  onSelect,
  active,
  tabs,
  showChildren = false,
}: TabsProps) => {
  return (
    <div className="flex h-10 w-full border-spacing-1 border-2 border-x">
      {tabs.length > 0 &&
        tabs.map((tab, index) => {
          return (
            <Tab
              key={index}
              onClick={() => {
                onSelect(index);
              }}
              active={active == index}
              title={tab.title}
            />
          );
        })}

      {showChildren && (
        <div className="flex items-center justify-center space-x-3 p-1">
          {/* Before the attempt at inline the children, it was in a dropdown */}
          {/* <Dropdown vertical="top">
            <Dropdown.Toggle size="sm">
              <Plus />
            </Dropdown.Toggle>
            <Dropdown.Menu>{children}</Dropdown.Menu>
          </Dropdown> */}
          {children}
        </div>
      )}
    </div>
  );
};
