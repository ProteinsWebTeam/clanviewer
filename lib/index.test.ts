import ClanViewer from "./index";

import * as d3 from "d3-selection";

const minData = {
  target: { x: 8, y: 2, accession: "a" },
  source: { x: 3, y: 6, accession: "b" },
  score: 0.5,
};
const options = {
  element: document.createElement("div"),
  width: 500,
  height: 500,
  r: 10,
  testing: true,
};
const dataJson = {
  members: [
    { pfama_acc: "f1", pfama_id: "id1", num_full: 1 },
    { pfama_acc: "f2", pfama_id: "id2", num_full: 2 },
  ],
  relationships: [{ pfama_acc_1: "f1", pfama_acc_2: "f2", evalue: 8.2e-6 }],
  clan_acc: "CLtest",
  clan_id: "001",
  total_occurrences: 2,
};

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe("constructor()", () => {
  it("should initialise the options", () => {
    const obj = new ClanViewer(options);
    expect(obj).toMatchSnapshot();
  });
});

describe("#linkArc()", () => {
  it("should return the path for an arc", () => {
    const arc = ClanViewer.linkArc(minData);

    expect(arc).toMatchSnapshot();
  });
});

describe("#labelArc()", () => {
  it("should return the translate coordinates", () => {
    ClanViewer.linkArc(minData);
    const label = ClanViewer.labelArc(minData);
    expect(label).toMatchSnapshot();
  });
});

describe("#processData(data)", () => {
  it("should create source and target objects in each element of data relationships", () => {
    // processData uses some values that should be initiated in the constructor, but given that we are calling
    // it in a static way, we set up those values here:

    const obj = new ClanViewer({ ...options, r: 5 });

    obj.processData(dataJson);
    expect(dataJson).toMatchSnapshot();
  });
  it("should use num_full only if score is not included", () => {
    const obj = new ClanViewer({ ...options, r: 5 });

    const newData = obj.processData(dataJson);
    expect(newData.nodes[0].score).toBe(1);
    expect(newData.nodes[1].score).toBe(2);
  });
});

describe("paint()", () => {
  const dataWithMembers = {
    members: [
      { pfama_acc: "f1", pfama_id: "id1", num_full: 1 },
      { pfama_acc: "f2", pfama_id: "id2", num_full: 2 },
    ],
    relationships: [
      { pfama_acc_1: "f1", pfama_acc_2: "f2", evalue: 8.2e-6 },
      { pfama_acc_1: "f1", pfama_acc_2: "f2", evalue: 8.2e-7 },
      { pfama_acc_1: "f2", pfama_acc_2: "f1", evalue: 8.2e-5 },
    ],
    clan_acc: "CLtest",
    clan_id: "100",
    total_occurrences: 3,
  };

  it("should paint multiple relationships", function () {
    const root = document.createElement("div"),
      options = {
        element: root,
        testing: true,
        multiple_relationships: true,
        directional: true,
      };
    const obj = new ClanViewer(options);

    obj.paint(dataWithMembers);
    expect(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      obj.force.nodes().map(({ x, y, ...rest }) => rest)
    ).toMatchSnapshot();
    expect(dataWithMembers.relationships).toHaveLength(
      d3.select(root).selectAll(".link").size()
    );
    expect(dataWithMembers.members).toHaveLength(
      d3.select(root).selectAll(".node").size()
    );
    expect(d3.select(root).selectAll("marker").size()).toBe(1);
  });
});
