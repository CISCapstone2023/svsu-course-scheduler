import React from "react";
import { Divider, Menu } from "react-daisyui";
import {
  Assembly,
  Book,
  Building,
  Calendar,
  ChartBar,
  Home,
  User,
} from "tabler-icons-react";
import SidebarItem from "./SidebarItem";

interface SidebarProps {
  children?: React.ReactNode;
}

const Sidebar = ({ children }: SidebarProps) => {
  return (
    <div className="flex h-full w-[220px] flex-col bg-base-200 pt-4">
      <Menu>
        <Menu.Item>
          <SidebarItem title="Project" url="" bold={true}>
            <Assembly width={40} height={40} />
          </SidebarItem>
        </Menu.Item>

        <Divider />

        <Menu.Item>
          <SidebarItem title="Home" url="/dashboard/home">
            <Home width={40} height={40} />
          </SidebarItem>
        </Menu.Item>

        <Menu.Item>
          <SidebarItem title="Schedule" url="/dashboard/home">
            <Calendar width={40} height={40} />
          </SidebarItem>
        </Menu.Item>

        <Menu.Item>
          <SidebarItem title="Report" url="/dashboard/home">
            <ChartBar width={40} height={40} />
          </SidebarItem>
        </Menu.Item>

        <Divider />

        <Menu.Item>
          <SidebarItem title="Courses" url="/dashboard/home">
            <Book width={40} height={40} />
          </SidebarItem>
        </Menu.Item>

        <Menu.Item>
          <SidebarItem title="Faculty" url="/dashboard/home">
            <User width={40} height={40} />
          </SidebarItem>
        </Menu.Item>

        <Menu.Item>
          <SidebarItem title="Buildings" url="/dashboard/home">
            <Building width={40} height={40} />
          </SidebarItem>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default Sidebar;
