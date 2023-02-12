import React from "react";
import { Form, Input, Select } from "react-daisyui";

interface ProjectFinalizeProps {
  children?: React.ReactNode;
}

const ProjectFinalize = ({ children }: ProjectFinalizeProps) => {
  return (
    <Form
      method="POST"
      className="component-preview flex w-full items-center justify-center gap-2 p-4 font-sans"
    >
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Semester</span>
        </label>
        <Select defaultValue={"default"} onChange={console.log} required>
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
        <Input type="number" required placeholder="00" />

        <label className="label">
          <span className="label-text">Name</span>
        </label>
        <Input type="text" placeholder="First Revision" />
      </div>
    </Form>
  );
};

export default ProjectFinalize;
