import type { NextPage } from "next";
import { useSession } from "next-auth/react";

import { useState } from "react";

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
import { Button, Card, Checkbox, Dropdown } from "react-daisyui";
import { CaretDown, Mail } from "tabler-icons-react";

import AsyncSelect from "react-select/async";

import Head from "next/head";
import { toast } from "react-toastify";
import useSidebar from "src/hooks/useSidebar";
import AnimatedSpinner from "src/components/AnimatedSpinner";

interface DashboardProps {
  scheduleId: string;
  name: string;
}

// Creates a type for storing/using departments
interface DepartmentSelect {
  label: string | null;
  value: string | null;
  name: string | null;
}
/**
 * Report
 * Generates the main report page
 * @Author Binh Dang
 */
const Report: NextPage<DashboardProps> = ({ scheduleId, name }) => {
  /**
   * useSession
   *
   * A function provided by the NextJSAuth library which provides data about the user
   * assuming they are successfully signed-in. If they are it will be null.
   */
  const {} = useSession();

  /**
   * Filter values
   * The value which will be searching that is set by the debouncing below
   */

  // Filter the semesters
  const [filterFallSemester, setFilterFallSemester] = useState(true);
  const [filterWinterSemester, setFilterWinterSemester] = useState(true);
  const [filterSpringSemester, setFilterSpringSemester] = useState(true);
  const [filterSummerSemester, setFilterSummerSemester] = useState(true);
  const exportMutation = api.projects.exportScheduleRevision.useMutation();

  //Make a state to toggle the sidebar
  const [showSidebar, toggleSidebar] = useSidebar();

  const exportCalendar = async () => {
    const result = await exportMutation.mutateAsync({
      tuid: scheduleId,
    });
    if (result) {
      window.open("/api/revision/" + scheduleId + "/downloadReport", "_blank");
      toast.success("Please attatch the exported Excel sheet to the email! ", {
        position: "top-center",
      });
    } else {
      toast.error(
        "Could not export to excel. \n This is likely from an older revision, which is not supported. ",
        { position: "top-center" }
      );
    }
  };
  // Get a list of departments
  const departmentMutation =
    api.department.getAllDepartmentAutofill.useMutation();

  // Filter faculty members by department
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [departmentValue, setDepartmentValue] = useState<DepartmentSelect>({
    label: null,
    value: null,
    name: null,
  });

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

  return (
    <DashboardLayout>
      <Head>
        <title>{name.substring(0, 30)} | SVSU Course Scheduler | Report</title>
      </Head>
      {showSidebar && <DashboardSidebar page={DashboardPages.REPORT} />}
      <DashboardContent>
        <DashboardContentHeader
          title={"Report | " + name}
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
            <Button
              color="info"
              className="ml-2"
              onClick={() => {
                const nl = "%0D%0A";
                const space = "     ";
                let listOfFaculty = "";
                if (faculties.data != undefined)
                  faculties.data.faculties.map((faculty) => {
                    listOfFaculty += faculty.email + ",";
                  });
                console.log(listOfFaculty);
                exportCalendar();
                window.location.href =
                  "mailto:" +
                  listOfFaculty +
                  "?subject=Proposed Calendar for Review&body=Hello All," +
                  nl +
                  nl +
                  "Here's the proposed schedule that is attatched to this email" +
                  nl +
                  nl +
                  "Please review and email back, " +
                  nl +
                  nl +
                  "SVSU Course Scheduler";
              }}
            >
              <Mail /> Email to All
            </Button>
          </div>

          <div className="container mx-auto mt-5 space-y-3 px-4">
            <span>
              <i>*Please attatch the exported Excel sheet to the email!</i>
            </span>
            {faculties.data != undefined &&
              faculties.data.faculties.map((faculty, index) => {
                return (
                  <FacultyReport
                    key={index}
                    faculty={faculty}
                    scheduleId={scheduleId}
                  />
                );
              })}
            {/* Make a spinner show if we have no calendar data loaded */}
            {faculties.data == undefined && (
              <div className="flex h-[200px] w-full flex-col items-center justify-center">
                <AnimatedSpinner />
                <p>Loading...</p>
              </div>
            )}
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

    return {
      props: {
        scheduleId,
        name: revision!.name,
      },
    };
  }
);
