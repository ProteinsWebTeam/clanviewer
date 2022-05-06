import ClanViewer from "../lib/index";
import data from "./example.json";
import data2 from "./iproExample.json";

const rootDiv = document.getElementById("container");
const rootDiv2 = document.getElementById("container2");
if (rootDiv && rootDiv2) {
  const instance = new ClanViewer({ element: rootDiv, directional: true });

  instance.paint(data);

  const clearB = document.getElementById("clear-button");
  const reloadB = document.getElementById("reload-button");

  clearB?.addEventListener("click", () => instance.clear());
  reloadB?.addEventListener("click", () => instance.paint(data));

  const instance2 = new ClanViewer({ element: rootDiv2, directional: true });
  instance2.paint(data2);

  const select = document.getElementById("nodeLabel");
  select?.addEventListener("change", (evt) =>
    instance2.updateNodeLabel(
      (evt?.target as HTMLSelectElement)?.value as "accession" | "name"
    )
  );
}
