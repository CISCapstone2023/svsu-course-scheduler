import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Button, Form, Input, Select } from "react-daisyui";
import { useForm } from "react-hook-form";
import { api } from "src/utils/api";
import {
  finalizeProjectOnBoarding,
  IProjectFinalizeOnboarding,
  IProjectOrganizedColumnRowNumerical,
} from "src/validation/projects";

interface ProjectFinalizeProps {
  children?: React.ReactNode;
  tuid: string | undefined;
  columns: IProjectOrganizedColumnRowNumerical;
}

const ProjectFinalize = ({ children, tuid, columns }: ProjectFinalizeProps) => {
  /**
   * Onboaring Form
   *
   * A form which we can finalize the onboaring process. Uses a custom zod schema
   * which has a single name to onboard the current revision into the system
   */
  const { reset, ...onboardingForm } = useForm<IProjectFinalizeOnboarding>({
    mode: "onBlur",
    resolver: zodResolver(finalizeProjectOnBoarding),
  });

  //Get the mutation from the backend API so we can create said revision!!
  const createRevisionMutation =
    api.projects.createScheduleRevision.useMutation();

  /**
   * Handle Form Submit
   *
   * This will handle the form submit to create the new revision.
   * It will check to make sure a name is present before it runs said function
   * as this is taken care of by the useForm (react-hook-form) library
   *
   * @param value
   */
  const onHandleFormSubmit = async (value: IProjectFinalizeOnboarding) => {
    if (tuid != undefined && columns != undefined) {
      console.log("im doing this");
      const result = await createRevisionMutation.mutateAsync({
        columns,
        tuid,
        name: value.name,
      });
      alert(result);
    }
  };

  return (
    <form
      onSubmit={onboardingForm.handleSubmit(onHandleFormSubmit)}
      className="component-preview flex w-full items-center justify-center gap-2 p-4 font-sans"
    >
      <div className="form-control w-full max-w-xs">
        {/* <label className="label">
          <span className="label-text">Semester</span>
        </label> */}
        {/* <Select defaultValue={"default"} onChange={console.log} required>
          <option value={"default"} disabled>
            Semester
          </option>
          <option value="Fall">Fall</option>
          <option value="Winter">Winter</option>
          <option value="Spring">Spring</option>
          <option value="Summer">Summer</option>
        </Select>
        <label className="label">
          <span className="label-text">Year</span>
        </label>
        <Input type="number" required placeholder="00" min="0" max="99" /> */}

        <label className="label">
          <span className="label-text">Name</span>
        </label>
        <Input
          type="text"
          placeholder="eg. Fall Draft"
          {...onboardingForm.register("name")}
        />
        <ErrorMessage
          errors={onboardingForm.formState.errors}
          name="name"
          render={({ message }) => (
            <p className="font-semibold text-red-600">{message}</p>
          )}
        />
        <div className="flex justify-end">
          <Button color="success" type="submit" className="mt-2">
            Finalize
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ProjectFinalize;
