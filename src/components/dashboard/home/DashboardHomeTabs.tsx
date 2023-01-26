import React from "react";
import { Stats, Tabs, Tab, Table } from "react-daisyui";
//import Tab from "react-daisyui/dist/Tabs/Tab";

interface DashboardHomeTabsProps {
  children?: React.ReactNode;
}

const DashboardHomeTabs = ({ children }: DashboardHomeTabsProps) => {
  const [tabValue, setTabValue] = React.useState(0);
  return (
    <div className="container mx-auto px-4">
      <h1 className="font-bold">
        Welcome to the Course Scheduler and Visualizer
      </h1>

      <div>
        <Stats className="bg-base-200 shadow">
          <Stats.Stat>
            <div className="stat-title">Total Courses</div>
            <div className="stat-value">40</div>
          </Stats.Stat>
        </Stats>

        <Stats className="ml-5 bg-base-200 shadow">
          <Stats.Stat>
            <div className="stat-title">Total Faculty Members</div>
            <div className="stat-value">672</div>
          </Stats.Stat>
        </Stats>
      </div>

      <div className="w-full">
        <Tabs
          className="w-full"
          value={tabValue}
          onChange={setTabValue}
          size="lg"
        >
          <Tabs.Tab value={0}>Added</Tabs.Tab>
          <Tabs.Tab value={2}>Modified</Tabs.Tab>
          <Tabs.Tab value={1}>Removed</Tabs.Tab>
        </Tabs>

        <div className="overflow-x-auto">
          <Table>
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
                <span>FA23</span>
              </Table.Row>

              <Table.Row>
                <span>2</span>
                <span>Hart Hagerty</span>
                <span>Desktop Support Technician</span>
                <span>Zemlak, Daniel and Leannon</span>
                <span>United States</span>
                <span>12/5/2020</span>
              </Table.Row>

              <Table.Row>
                <span>3</span>
                <span>Brice Swyre</span>
                <span>Tax Accountant</span>
                <span>Carroll Group</span>
                <span>China</span>
                <span>8/15/2020</span>
              </Table.Row>

              <Table.Row>
                <span>4</span>
                <span>Marjy Ferencz</span>
                <span>Office Assistant I</span>
                <span>Rowe-Schoen</span>
                <span>Russia</span>
                <span>3/25/2021</span>
              </Table.Row>

              <Table.Row>
                <span>5</span>
                <span>Yancy Tear</span>
                <span>Community Outreach Specialist</span>
                <span>Wyman-Ledner</span>
                <span>Brazil</span>
                <span>5/22/2020</span>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomeTabs;
