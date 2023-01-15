exports.componentGenerator = {
  description: "Create a component",
  // User input prompts provided as arguments to the template
  prompts: [
    {
      // Raw text input
      type: "input",
      // Variable name for this input
      name: "name",
      // Prompt to display on command line
      message: "What is your component name (CAMEL CASE)?",
    },
  ],
  actions: [
    {
      // Add a new file
      type: "add",
      // Path for the new file
      path: "src/components/{{pascalCase name}}.tsx",
      // Handlebars template used to generate content of new file
      templateFile: "generators/Component.tsx.hbs",
    },
  ],
};

exports.dashboardPageGenerator = {
  description: "Create a new dashbord page",
  prompts: [
    {
      // Raw text input
      type: "input",
      // Variable name for this input
      name: "name",
      // Prompt to display on command line
      message: "What is your page name (CAMEL CASE)?",
    },
    {
      // Raw text input
      type: "input",
      // Variable name for this input
      name: "description",
      // Prompt to display on command line
      message: "What is the purpose of this page?",
    },
  ],
  actions: [
    {
      // Add a new file
      type: "add",
      // Path for the new file
      path: "src/pages/dashboard/{{lowerCase name}}/index.tsx",
      // Handlebars template used to generate content of new file
      templateFile: "generators/DashboardPage.tsx.hbs",
    },
  ],
};

exports.commentHelper = (text) => {
  const LINE_LENGTH = 50;

  //Get the list of words in the comment
  const words = text.split(" ");

  let currentLine = ""; //Current length of the line
  let lines = []; //The lines in said comment

  //Loop over all of the words
  while (words.length != 0) {
    if (currentLine.length >= LINE_LENGTH) {
      lines.push(" * " + currentLine); //Add the line to the list of lines
      currentLine = ""; //Reset the line so the next line can be generated
    }
    currentLine += words.shift() + " ";
  }
  //Push the last line too
  lines.push(" * " + currentLine); //Add the line to the list of lines
  return lines.join("\n");
};
