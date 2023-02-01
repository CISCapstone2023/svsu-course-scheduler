import React from "react";
import { Stats, Tabs, Table } from "react-daisyui";
//import Tab from "react-daisyui/dist/Tabs/Tab";

interface DashboardHomeTabsProps {
  children?: React.ReactNode;
}

const DashboardHomeTabs = ({ children }: DashboardHomeTabsProps) => {
  const [tabValue, setTabValue] = React.useState(0);

  const setCurrentTab = (value: number | null) => {
    if (value != null) {
      setTabValue(value);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="mb-4 pt-10 font-bold">
        Welcome to the Course Scheduler and Visualizer
      </h1>

      <div>
        <Stats className="mb-4 bg-base-200 shadow">
          <Stats.Stat>
            <div className="stat-title">Total Courses</div>
            <div className="stat-value">40</div>
          </Stats.Stat>
        </Stats>

        <Stats className="ml-5 mb-4 bg-base-200 shadow">
          <Stats.Stat>
            <div className="stat-title">Total Faculty Members</div>
            <div className="stat-value">672</div>
          </Stats.Stat>
        </Stats>
      </div>

      <div className="w-full">
        <Tabs
          className="w-full"
          variant="lifted"
          value={tabValue}
          onChange={setCurrentTab}
          size="lg"
        >
          <Tabs.Tab value={0}>Added</Tabs.Tab>
          <Tabs.Tab value={2}>Modified</Tabs.Tab>
          <Tabs.Tab value={1}>Removed</Tabs.Tab>
          <Tabs.Tab value={null} className="flex-1 cursor-default" />
        </Tabs>

        <div className="overflow-x-auto border-x-[1px] border-b-[1px] border-gray-200 p-2">
          <Table className="w-full">
            <Table.Head>
              <span />
              <span>Faculty Member Name</span>
              <span>Course ID</span>
              <span>Course Title</span>
              <span>Location</span>
              <span>Start Time/ End Time</span>
            </Table.Head>

            <Table.Body>
              <Table.Row>
                <span>1</span>
                <span>Poonam, Dharam</span>
                <span>CS*116</span>
                <span>Computer Programming I</span>
                <span>SE116</span>
                <span>M/W 10:30AM-12:20PM</span>
              </Table.Row>

              <Table.Row>
                <span>2</span>
                <span>James, Scott</span>
                <span>CIS*422</span>
                <span>System Analysis & Design Concepts</span>
                <span>SE121</span>
                <span>T/TH 8:30AM-10:20AM</span>
              </Table.Row>

              <Table.Row>
                <span>3</span>
                <span>Mukherjee, Avishek</span>
                <span>CIS*355*01</span>
                <span>Server Side Webb Dev</span>
                <span>SE145</span>
                <span>M/W 10:30AM-12:20PM</span>
              </Table.Row>

              <Table.Row>
                <span>4</span>
                <span>Jaksa, Joseph J.</span>
                <span>CJ*315*90</span>
                <span>Private Security</span>
                <span>ONL 1</span>
                <span>Lecture-Online</span>
              </Table.Row>

              <Table.Row>
                <span>5</span>
                <span>Rahman, Khandaker Abir</span>
                <span>CS*433*70</span>
                <span>Cybersecurity</span>
                <span>ONL1, SE137 (Lecture-Hybrid)</span>
                <span>T 2:30PM-4:20PM</span>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomeTabs;
