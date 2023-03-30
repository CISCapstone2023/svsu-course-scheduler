import classNames from "classnames";

interface CalendarWeekdayHeaderProps {
  weekday: string;
  onClick?: () => void;
  active?: boolean;
  locked?: boolean;
}

const CalendarWeekdayHeader = ({
  weekday,
  active = false,
  onClick,
  locked = false,
}: CalendarWeekdayHeaderProps) => {
  return (
    <>
      {active && (
        <div
          onClick={() => {
            if (onClick) onClick();
          }}
          className={classNames(
            { "": active },
            "relative flex w-[70px] grow  border-r border-b border-base-300  pl-2 hover:cursor-pointer hover:bg-blue-500 hover:text-white"
          )}
        >
          <div
            className="absolute"
            style={{
              top: 0,
              left: 1,
            }}
          >
            {weekday}
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarWeekdayHeader;
