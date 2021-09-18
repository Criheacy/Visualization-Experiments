import React from "react";
import * as d3 from "d3";
import { useSVG } from "hooks/useD3";
import { ChartDataItem, ChartDataProps } from "./index";

interface TreeChartNode {
  name: string;
  children: TreeChartNode[];
}

const toTreeChartRootNode = (data: ChartDataItem[]): TreeChartNode => ({
  name: "root",
  children: data.map((item) => ({
    name: item.class,
    children: Object.entries(item.count).map(([key, value]) => ({
      name: key,
      children: [],
      value,
    })),
  })),
});

const TreeChart = (props: ChartDataProps) => {
  const svgRef = useSVG(
    (svg) => {
      const width = 420;
      const height = 320;
      const padding = 1.5;

      const root = d3
        .hierarchy<TreeChartNode>(toTreeChartRootNode(props.data))
        .sum((d: any) => d.value || 0);

      d3.treemap<TreeChartNode>().size([width, height]).padding(padding)(root);

      svg
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr("x", (d: any) => d.x0)
        .attr("y", (d: any) => d.y0)
        .attr("width", (d: any) => d.x1 - d.x0)
        .attr("height", (d: any) => d.y1 - d.y0)
        .style("fill", (d: any) =>
          props.colorMap(d.parent.data.name, d.data.name)
        );

      svg
        .selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("x", (d: any) => (d.x0 + d.x1) / 2) // +10 to adjust position (more right)
        .attr("y", (d: any) => (d.y0 + d.y1) / 2 + 5) // +20 to adjust position (lower)
        .text((d) => d.data.name)
        .attr("font-size", "15px")
        .attr("text-anchor", "middle")
        .attr("fill", "white");
    },
    [props.data]
  );

  return (
    <svg
      ref={svgRef}
      style={{
        width: 420,
        height: 320,
        margin: "auto",
      }}
    />
  );
};

export default TreeChart;
