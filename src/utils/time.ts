/**
 * Converts military time of integer to a its counterparts of
 * minute, hour, and the PM/AM period
 * @param time
 * @returns
 */
const militaryToTime = (time: number) => {
  //initializes hour variable to parse integer time numbers
  let hour = parseInt(
    time >= 1000
      ? time.toString().substring(0, 2) //splits numbers of time to get ending numbers of set time
      : time.toString().substring(0, 1) // splits numbers of time to get begining numbers of set time
  );
  let anteMeridiemHour = hour;
  if (hour > 12) {
    anteMeridiemHour = hour - 12;
  }
  // conditional statement to reset hours to 12 if initial time is 12 since 12 mod 12 returns zero
  if (hour == 0) {
    hour = 12;
  }

  //initializes constant for getting the minutes of time
  const minute = parseInt(
    time.toString().substring(time.toString().length - 2)
  );

  //initializes constant to be used for AM/PM tagging on time
  const period = time >= 1100 ? "PM" : "AM";
  return {
    hour,
    anteMeridiemHour,
    minute,
    period,
  };
};

export default militaryToTime;
