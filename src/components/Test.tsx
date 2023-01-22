import React from 'react';

interface TestProps {
    children?: React.ReactNode
}

const Test = ({children}: TestProps) => {
  return (
    <div>
      Test
    </div>
  );
};

export default Test;