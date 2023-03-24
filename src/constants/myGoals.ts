export const goalConfigTags = ["Duration", "Due date", "Filter", "Habit", "Time budget", "Start date"];

export const getHeadingOfTag = (tagName: string, warningMessage = false) => {
  let heading = "";
  switch (tagName) {
    case "Duration":
      heading = warningMessage ? "This goal already has a duration so no budget can be added." : "Add a duration to show on calendar";
      break;
    case "Start date":
      heading = "When you want to start?";
      break;
    case "Due date":
      heading = "What's the deadline?";
      break;
    case "Habit":
      heading = "So, do you repeat this goal daily?";
      break;
    case "Filter":
      heading = "When you want to work on this?";
      break;
    case "Time budget":
      heading = warningMessage ? "This goal already has a duration so no budget can be added." : "Let's decide a budget for this goal?";
      break;
    default:
      break;
  }
  return heading;
};
