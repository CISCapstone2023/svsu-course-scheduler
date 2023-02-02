import React, { Children } from "react";

interface ImportExcelModelProps {
  children?: React.ReactNode;
}

const ModalLayout = ({ children }: ImportExcelModelProps) => {
  return (
    <div className="border-neutral-900 container mx-auto h-3/4 w-2/4 overflow-y-scroll rounded-lg border-2 border-opacity-50 bg-stone-200 p-4">
      {children}
    </div>
  );
};

export default ModalLayout;
