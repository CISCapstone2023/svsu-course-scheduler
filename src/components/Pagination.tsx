import { last, map } from "lodash";
import React from "react";
import { Button, Pagination } from "react-daisyui";
import { ChevronLeft, ChevronRight } from "tabler-icons-react";

interface PaginationProps {
  children?: React.ReactNode;
  totalPageCount: number;
  currentPage: number;
  onClick: (page: number) => void;
}

const range = (start: number, end: number) => {
  const length = end - start + 1;
  /*
  	Create an array of certain length and set the elements within it from
    start value to end value.
  */
  return Array.from({ length }, (_, idx) => idx + start);
};

const PaginationBar = ({
  children,
  totalPageCount,
  currentPage,
  onClick,
}: PaginationProps) => {
  const siblingsAmount = 2;
  const totalPages = siblingsAmount * 2 + 1;

  const pages = range(
    Math.max(1, currentPage - siblingsAmount),
    Math.min(
      totalPageCount,
      currentPage +
        (currentPage < totalPages - siblingsAmount
          ? totalPages - currentPage
          : siblingsAmount)
    )
  );
  return (
    <div>
      <Pagination>
        <>
          {currentPage != 0 && (
            <>
              {currentPage != 1 && (
                <Button
                  onClick={() => {
                    onClick(currentPage - 1);
                  }}
                >
                  <ChevronLeft />
                </Button>
              )}
              {pages.map((num, i) => {
                return (
                  <Button
                    key={i}
                    active={num == currentPage}
                    onClick={() => {
                      onClick(num);
                    }}
                  >
                    {num}
                  </Button>
                );
              })}
              {currentPage != totalPageCount && pages.length > 0 && (
                <Button
                  onClick={() => {
                    onClick(currentPage + 1);
                  }}
                >
                  <ChevronRight />
                </Button>
              )}
            </>
          )}
        </>
        <></>
      </Pagination>
    </div>
  );
};

export default PaginationBar;
