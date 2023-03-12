import { useCallback, useEffect, useState } from "react";
import { Checkbox, Input } from "react-daisyui";

interface TimeInputProps {
  value: number;
  onChange: (time: number) => void;
}

const militaryToSplit = (time: number) => {
  //initializes hour variable to parse integer time numbers
  const hour = parseInt(
    time >= 1000
      ? time.toString().substring(0, 2) //splits numbers of time to get ending numbers of set time
      : time.toString().substring(0, 1) // splits numbers of time to get begining numbers of set time
  ); // mods time to convert from military time to standard time
  let anteMeridiemHour = hour % 12;
  // conditional statement to reset hours to 12 if initial time is 12 since 12 mod 12 returns zero
  if (anteMeridiemHour == 0) {
    anteMeridiemHour = 12;
  }

  //initializes constant for getting the minutes of time
  const minute = parseInt(
    time.toString().substring(time.toString().length - 2)
  );

  //initializes constant to be used for AM/PM tagging on time
  const anteMeridiem = time >= 1300 ? "PM" : "AM";
  return {
    hour,
    minute,
    anteMeridiemHour,
    anteMeridiem,
    totalMinutes: hour * 60 + minute,
  };
};

export const TimeInput = ({ value }: TimeInputProps) => {
  const [hour, setHour] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [isPM, setIsPM] = useState(false);

  useEffect(() => {
    const time = militaryToSplit(value);
    setHour(time.anteMeridiemHour);
    setMinutes(time.minute);
    setIsPM(time.anteMeridiem == "PM");
  }, []);

  useEffect(() => {
    onChange();
  }, [hour, minutes, isPM]);

  const onChange = () => {
    let tempHours = hour;
    if (isPM == true) {
      tempHours += 12;
    }

    const military = parseInt(
      `${tempHours}${minutes < 10 ? "0" : ""}${minutes}`
    );
    console.log(military);
  };

  return (
    <div className="flex rounded-lg border-[1px] border-gray-300 p-1">
      <input
        type="number"
        className="time-input w-8"
        value={hour}
        onChange={(event) => {
          setHour(parseInt(event.currentTarget.value));
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
          setMinutes(parseInt(event.currentTarget.value));
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
