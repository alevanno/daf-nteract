import * as React from "react";
import Enzyme, { mount } from "enzyme";
import toJson from "enzyme-to-json";

jest.mock("../src/load-script");
import loadScript from "../src/load-script";
import { Node, Provider } from "../src";

describe("MathJax", () => {
  test("Node can be renderered without provider", () => {
    const wrapper = mount(<Node>x^2 + y = 3</Node>);
    expect(loadScript).toHaveBeenLastCalledWith(
      "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML",
      expect.any(Function)
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test("Nodes use existing provider", () => {
    const wrapper = mount(
      <Provider src="script-src">
        <Node>x^2 + y = 3</Node>
        <Node>x^3 + y = 2</Node>
      </Provider>
    );
    expect(loadScript).toHaveBeenLastCalledWith(
      "script-src",
      expect.any(Function)
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
