//React and NextJS
import { useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";

//Libraries
import { Button, Card, Checkbox, Dropdown } from "react-daisyui";
import { CaretDown } from "tabler-icons-react";
import AsyncSelect from "react-select/async";

//Components and APIS
import DashboardLayout from "src/components/dashboard/DashboardLayout";
import DashboardSidebar, {
  DashboardPages,
} from "src/components/dashboard/DashboardSidebar";
import DashboardContent from "src/components/dashboard/DashboardContent";
import DashboardContentHeader from "src/components/dashboard/DashboardContentHeader";

import { routeNeedsAuthSession } from "src/server/auth";
import { prisma } from "src/server/db";
import { api } from "src/utils/api";
import FacultyReport from "./FacultyReport";
import useSidebar from "src/hooks/useSidebar";

/**
 * Dashboard Properties Interface
 *
 * @author CIS 2023
 */
interface DashboardProps {
  scheduleId: string; //The ID of the schedule
  name: string; //The name of the current revision
  department: string; //The department of the user
}

/**
 * Department Select Interface
 *
 * This interface is used to define
 *
 * @author CIS 2023
 */
interface DepartmentSelect {
  label: string | null;
  value: string | null;
  name: string | null;
}

const Report: NextPage<DashboardProps> = ({ scheduleId, name, department }) => {
  /**
   * Filter values
   * The value which will be searching that is set by the debouncing below
   */

  // Filter the semesters
  const [filterFallSemester, setFilterFallSemester] = useState(true);
  const [filterWinterSemester, setFilterWinterSemester] = useState(true);
  const [filterSpringSemester, setFilterSpringSemester] = useState(true);
  const [filterSummerSemester, setFilterSummerSemester] = useState(true);

  // Get a list of departments
  const departmentMutation =
    api.department.getAllDepartmentAutofill.useMutation();

  // Duplicate copy of the filter, but not in an object form
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(
    department
  );

  // Filter faculty members by department (for the select)
  const [departmentValue, setDepartmentValue] = useState<DepartmentSelect>({
    label: department,
    value: department,
    name: department,
  });

  /**
   * Faculties Query
   *
   * Retrieves the factulies members with the provided filters
   * - Fall, Winter, Spring, or Summer semester
   * - Department
   * - Search (not in use)
   * - Revision for tuid
   * @author CIS 2023
   */
  const faculties = api.report.getAllReports.useQuery({
    semester_fall: filterFallSemester,
    semester_spring: filterSpringSemester,
    semester_summer: filterSummerSemester,
    semester_winter: filterWinterSemester,
    department: departmentFilter,
    search: "",
    tuid: scheduleId,
  });

  // Sort faculty by department
  faculties.data?.faculties.sort((a, b) =>
    a.department > b.department ? 1 : b.department > a.department ? -1 : 0
  );

  //Add sidebar toggle
  const [showSidebar, toggleSidebar] = useSidebar();
  return (
    <DashboardLayout>
      <Head>
        <title>{name.substring(0, 30)} | SVSU Course Scheduler | Report</title>
      </Head>
      {showSidebar && <DashboardSidebar page={DashboardPages.REPORT} />}
      <DashboardContent>
        <DashboardContentHeader
          title={`Report | ${name}`}
          onMenuClick={toggleSidebar}
        />
        <div className="m-2 h-full overflow-auto">
          <div className="flex">
            <Dropdown>
              <Button>
                Semester
                <CaretDown />
              </Button>
              <Dropdown.Menu>
                <Card.Body>
                  <div className="flex space-x-4">
                    <p>Fall</p>
                    <Checkbox
                      disabled={!faculties.data?.isFall}
                      indeterminate={true}
                      checked={filterFallSemester}
                      onChange={(e) => {
                        setFilterFallSemester(e.currentTarget.checked);
                      }}
                    />
                  </div>
                  <div className="flex">
                    <p>Winter</p>
                    <Checkbox
                      indeterminate={true}
                      disabled={!faculties.data?.isWinter}
                      checked={filterWinterSemester}
                      onChange={(e) => {
                        setFilterWinterSemester(e.currentTarget.checked);
                      }}
                    />
                  </div>
                  <div className="flex">
                    <p>Spring</p>
                    <Checkbox
                      indeterminate={true}
                      disabled={!faculties.data?.isSpring}
                      checked={filterSpringSemester}
                      onChange={(e) => {
                        setFilterSpringSemester(e.currentTarget.checked);
                      }}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <p>Summer</p>
                    <Checkbox
                      indeterminate={true}
                      disabled={!faculties.data?.isSummer}
                      checked={filterSummerSemester}
                      onChange={(e) => {
                        setFilterSummerSemester(e.currentTarget.checked);
                      }}
                    />
                  </div>
                </Card.Body>
              </Dropdown.Menu>
            </Dropdown>

            <AsyncSelect
              isClearable
              defaultOptions
              className="ml-2 w-[250px]"
              placeholder={"Enter Department"}
              loadOptions={(search, callback) => {
                new Promise<any>(async (resolve) => {
                  const data = await departmentMutation.mutateAsync({
                    search: search.toLowerCase(),
                  });
                  if (data != undefined) {
                    callback(
                      data.map((obj) => ({
                        label: obj.label,
                        value: obj.value,
                        name: obj.name,
                      }))
                    );
                  } else {
                    callback([]);
                  }
                });
              }}
              onChange={(value) => {
                setDepartmentValue(value as DepartmentSelect);
                if (value != null) {
                  setDepartmentFilter(value.name);
                } else {
                  setDepartmentFilter(null);
                }
              }}
              value={departmentValue}
              // {...field}
              // styles={customStyles}
            />
          </div>

          <div className="container mx-auto mt-5 space-y-3 px-4">
            {faculties.data != undefined &&
              faculties.data.faculties.map((faculty, index) => {
                return <FacultyReport key={index} faculty={faculty} />;
              })}
          </div>
        </div>
      </DashboardContent>
    </DashboardLayout>
  );
};

export default Report;

/**
 * Get Server Side Properties
 *
 * NextJS supports a custom callback, so before a page is returned to the client
 * you can check on the backend, this allows for us to check if the user is
 * authenticated for example.
 *
 * So with this code we wrap the "routeNeedsAuthSession" so the user needs to
 * be signed in for this page to be shown, if its not that function will redirect the
 * user back to the "/" home sign-up page.
 *
 * Also the perk of server props is that it occurs at page load time.
 * Meaning any data we pass into the "props" return object, will be provided
 * as a prop to the "NextPage" below. So for example the {} of the props could
 * contain data which could be used.
 *
 */

export const getServerSideProps = routeNeedsAuthSession(
  async ({ query }, session) => {
    //Grab schedule id from query parameter
    const scheduleId = query.scheduleId || "";

    if (session == undefined) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    //Check to make sure its a string
    if (typeof scheduleId === "string") {
      //Make sure we have owenrship of said revision
      const hasRevision =
        (await prisma.scheduleRevision.count({
          where: {
            tuid: query.scheduleId as string,
            creator_tuid: session?.user?.id,
          },
        })) == 1;

      //And if we DO NOT, redirect them back to the main page
      if (!hasRevision) {
        return {
          redirect: {
            destination: "/projects", //Path to the Login Screen
            permanent: false,
          },
        };
      }
    }

    //Now get the revision and get the name so we can use it in the title
    const revision = await prisma.scheduleRevision.findFirst({
      where: {
        tuid: query.scheduleId as string,
        creator_tuid: session?.user?.id,
      },
      select: {
        name: true,
      },
    });

    //Get the user also so we can grab the departments for the filter automaitcally
    const user = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
      select: {
        department: true,
      },
    });

    return {
      props: {
        scheduleId,
        //Pass the name to the page
        name: revision!.name,
        //Pass department to the page
        department: user?.department,
      },
    };
  }
);
