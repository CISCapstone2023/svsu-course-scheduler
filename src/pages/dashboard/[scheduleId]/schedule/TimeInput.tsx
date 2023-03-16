import { useCallback, useEffect, useState } from "react";
import { Checkbox, Input } from "react-daisyui";
import militaryToTime from "src/utils/time";

interface TimeInputProps {
  value: number;
  onChange: (time: number) => void;
  ref: any;
}

const TimeInput = ({ value, ref, onChange }: TimeInputProps) => {
  const [hour, setHour] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [isPM, setIsPM] = useState(false);

  useEffect(() => {
    try {
      const time = militaryToTime(value);
      setHour(time.anteMeridiemHour);
      setMinutes(time.minute);
      setIsPM(time.period == "PM");
    } catch (e) {}
  }, []);

  useEffect(() => {
    onChangeLocally();
  }, [hour, minutes, isPM]);

  const onChangeLocally = () => {
    let tempHours = hour;
    if (isPM == true && hour != 12) {
      tempHours += 12;
    }

    const military = parseInt(
      `${tempHours}${minutes < 10 ? "0" : ""}${minutes}`
    );
    onChange(military);
  };

  return (
    <div className="flex rounded-lg border-[1px] border-gray-300 p-1" ref={ref}>
      <input
        type="number"
        className="time-input w-8"
        value={hour}
        onChange={(event) => {
          const hours = parseInt(event.currentTarget.value);
          if (hours != undefined && hours > 100) {
            setHour(hour);
          } else {
            setHour(hours);
          }
        }}
        onBlur={(event) => {
          const hours = parseInt(event.currentTarget.value);
          if (hours != undefined && hours > 12) {
            setHour(12);
          }
        }}
        min="1"
        max="12"
      />
      :
      <input
        type="number"
        className="time-input w-8"
        value={minutes}
        onChange={(event) => {
          const mins = parseInt(event.currentTarget.value);
          if (mins != undefined && mins > 60) {
            setMinutes(minutes);
          } else {
            setMinutes(mins);
          }
        }}
        onBlur={(event) => {
          const mins = parseInt(event.currentTarget.value);
          if (mins != undefined && mins > 60) {
            setMinutes(59);
          }
        }}
        min="0"
        max="60"
      />
      <select
        value={isPM == true ? "PM" : "AM"}
        onChange={(event) => {
          setIsPM(event.currentTarget.value == "PM");
        }}
      >
        <option value={"AM"}>AM</option>
        <option value={"PM"}>PM</option>
      </select>
    </div>
  );
};

export default TimeInput;
