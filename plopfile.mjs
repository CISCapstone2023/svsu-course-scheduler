import {
  componentGenerator,
  commentHelper,
  dashboardPageGenerator,
} from "./generators/index.js";

export default (plop) => {
  plop.setHelper("comment", commentHelper);
  plop.setGenerator("component", componentGenerator);
  plop.setGenerator("page", dashboardPageGenerator);
};
